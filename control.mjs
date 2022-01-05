import { Server } from "socket.io";
import crypto from "crypto";

import assert from "console";

import { NO_HINT, HINT_LVL1, HINT_LVL2, HINT_LVL3, initGameState, copyGameState, wellFormed, setGivens, _idx, checkGameOver, validGameState, gameStatesEqual, organizeCages } from './src/game_logic.mjs';
import { NO_SOLUTIONS, NO_UNIQUE_SOLUTION, solveGame, findHint } from './game_solver.mjs';

let io;

let g_current_state = initGameState();
let g_solution = 0;
// set to true when the game is over
let g_finished = false;
let g_mode = 0;
let g_selected = {};
let g_starttime = -1;
let g_endtime = -1;

let g_history_idx = 0;
let g_history = [];

// map from tokens to user objects
let g_users = new Map();
let g_socket_id_to_tokens = new Map();
let g_user_id_to_user = new Map();
let g_user_idx = 0;
const n_user_colors = 4;

function addUserObj(socket_id) {
	let token = crypto.randomBytes(32).toString("hex");
	let user = {
		id: g_user_idx,
		color: (g_user_idx % n_user_colors)
	};
	g_users.set(token, user);
	g_socket_id_to_tokens.set(socket_id, token);
	g_user_id_to_user.set(user.id, user);
	g_user_idx++;
	return token;
}


function expandHistory() {
    if (g_history_idx !== g_history.length - 1) {
        assert(g_history_idx < g_history.length);

        for (let i = g_history.length - 2; i >= g_history_idx; i--) {
            // no need to deep copy
            let itm = {
                gameState: g_history[i].gameState
            };
            if ('hint_cache' in g_history[i]) {
                itm.hint_cache = {...g_history[i].hint_cache};
            }
            g_history.push(itm);
        }
        g_history_idx = g_history.length - 1;
    }
}


function addToHistory(gameState) {
    // append to history
    expandHistory();

    let itm = {
        gameState: copyGameState(gameState)
    };
    g_history.push(itm);
    g_history_idx = g_history.length - 1;
}


export default function init(app) {
    io = new Server(app, { /* options */ });

    io.on("connection", function(socket) {

        socket.on("disconnect", function() {
            if (!g_socket_id_to_tokens.has(socket.id)) {
                return;
            }
            let token = g_socket_id_to_tokens.get(socket.id);

            if (!g_users.has(token)) {
                return;
            }
            let user = g_users.get(token);
            let logout_timer = setTimeout(function() {
                // remove their highlights from the selected map before deleting them
                for (idx in g_selected) {
                    let user_colors = g_selected[idx];
                    if (user_colors.includes(user.color)) {
                        let new_cols = user_colors.filter((color) => color !== user.color);
                        if (new_cols.length > 0) {
                            g_selected[idx] = new_cols;
                        }
                        else {
                            delete g_selected[idx];
                        }
                    }
                }
                io.emit("update", {
                    selected: g_selected
                });

                g_users.delete(token);
                g_socket_id_to_tokens.delete(socket.id);
                g_user_id_to_user.delete(user.id);
            }, 60000);
            user.timeout = logout_timer;
        });

        socket.on("login", (data) => {
            if (!("token" in data) || !g_users.has(data.token)) {
                let token = addUserObj(socket.id);
                socket.emit("login_response", {
                    user: g_users.get(token),
                    token: token
                });
                return;
            }

            let token = data.token;
            let user = g_users.get(token);

            if ("timeout" in user) {
                clearTimeout(user.timeout);
                delete user.timeout;
            }

            socket.emit("login_response", {
                user: user,
                token: token
            });
        });

        socket.on("fetch", () => {
            socket.emit("fetch_response", {
                gameState: g_current_state,
                state: g_mode,
                selected: g_selected,
                starttime: g_starttime,
                endtime: g_endtime,
                finished: g_finished
            });
        });

        socket.on("update", (data) => {
            update_game(socket, data);
        });

        socket.on("verify_cells", (data) => {
            verify_cells(socket, data);
        });

        socket.on("undo", (data) => {
            if (!("token" in data)) {
                console.log("bad request", data);
                return;
            }
            let token = data.token;
        
            if (!g_users.has(token)) {
                return;
            }

            if (g_history_idx === 0) {
                // can't undo from the 0'th move
                return;
            }

            g_history_idx--;
            g_current_state = copyGameState(g_history[g_history_idx].gameState);

            io.emit("update", {
                gameState: g_current_state
            });
        });

        socket.on("redo", (data) => {
            if (!("token" in data)) {
                console.log("bad request", data);
                return;
            }
            let token = data.token;
        
            if (!g_users.has(token)) {
                return;
            }

            if (g_history_idx >= g_history.length - 1) {
                // can't redo from the most recent move
                return;
            }

            g_history_idx++;
            g_current_state = copyGameState(g_history[g_history_idx].gameState);

            io.emit("update", {
                gameState: g_current_state
            });
        });

        socket.on("give_hint", (data) => {
            if (!("token" in data) || !("req_level" in data)) {
                console.log("bad request", data);
                return;
            }
            let token = data.token;
        
            if (!g_users.has(token)) {
                return;
            }

            if (g_mode !== 1 || g_finished) {
                // only allow hints once the game has started/not ended
                return;
            }

            if (g_solution === 0) {
                // no solution, no hints available
                return;
            }

            if (!onRightTrack()) {
                // if we aren't on the right track, let them know, we aren't able
                // to give a hint if it's wrong so far
                io.emit("solution_discrepancy");
                return;
            }

            let req_level = data.req_level;
            if (req_level !== g_current_state.hint_state + 1) {
                // requested hint at level either already covered or past the next level after
                // the current state
                return;
            }
            if (req_level > HINT_LVL3) {
                // cannot ask for a hint once a digit has been revealed
                return
            }

            // promote this game state to the top of history
            expandHistory();

            let hint_res;
            if (('hint_cache' in g_history[g_history_idx]) && req_level !== HINT_LVL1) {
                hint_res = g_history[g_history_idx].hint_cache;
            }
            else {
                hint_res = findHint(g_current_state);
                g_history[g_history_idx].hint_cache = hint_res;
            }

            if (hint_res === -1) {
                io.emit("no_hint", {});
            }
            else {
                let tile_idx = hint_res.tile_idx;
                let verbal_hint = hint_res.verbal_hint;
                let g_idx = _idx(Math.floor(tile_idx / 9), tile_idx % 9);
                // mark both current state and state in history as hinted
                g_current_state.hint_state = req_level;
                g_history[g_history_idx].gameState.hint_state = req_level;

                if (req_level === HINT_LVL1) {
                    g_current_state.hinted_tile = g_idx;
                    g_history[g_history_idx].gameState.hinted_tile = g_idx;
                }
                else if (req_level === HINT_LVL2) {
                    g_current_state.verbal_hint = verbal_hint;
                    g_history[g_history_idx].gameState.verbal_hint = verbal_hint;
                }
                else /* req_level === HINT_LVL3 */ {
                    g_current_state.board[g_idx].val = g_solution[tile_idx];
                    g_current_state.board[g_idx].revealed = true;
                    gameStateChanged();
                }
                io.emit("update", {
                    gameState: g_current_state,
                    endtime: g_endtime,
                    finished: g_finished
                });
            }
        });

        socket.on("reset", (data) => {
            if (!("token" in data)) {
                console.log("bad request", data);
                return;
            }
            let token = data.token;
        
            if (!g_users.has(token)) {
                return;
            }

            if (g_finished) {
                g_current_state = initGameState();
                g_solution = 0;
                g_finished = false;
                g_mode = 0;
                g_selected = {};
                g_starttime = -1;
                g_endtime = -1;
                g_history_idx = 0;
                g_history = [];

                io.emit("update", {
                    gameState: g_current_state,
                    state: g_mode,
                    selected: g_selected,
                    starttime: g_starttime,
                    endtime: g_endtime,
                    finished: g_finished
                });
            }
        });

    });
}


function updateTile(trans_state, new_state, idx, user) {
    let s1 = trans_state.board[idx];
    let s2 = new_state.board[idx];
    
    if ((s1.val != s2.val || s1.pencils != s2.pencils ||
        s1.possibles != s2.possibles || s1.user_color != s2.user_color)
            && !s1.given && (!s1.revealed && !s2.revealed)) {

        s1.val = s2.val;
        s1.pencils = s2.pencils;
        s1.possibles = s2.possibles;
        s1.given = s2.given;
        s1.user_color = user.color;
        return true;
    }
    return false;
}


/*
 * checks gameover condition and adds game state to history
 */
function gameStateChanged() {
    if (g_mode === 1 && !g_finished) {
        if (!g_finished) {
            g_finished = checkGameOver(g_current_state);
            if (g_finished) {
                g_endtime = new Date().getTime();
            }
        }

        g_current_state.hinted_tile = -1;
        g_current_state.hint_state = NO_HINT;
        delete g_current_state.verbal_hint;

        addToHistory(g_current_state);
    }
}


function update_game(socket, data) {
	if (!("token" in data)) {
		console.log("bad request", data);
		return;
	}
	let token = data.token;

	if (!g_users.has(token)) {
		return;
	}
	let user = g_users.get(token);

	if ("state" in data) {
		if (data.state === 0) {
			g_starttime = -1;
			g_endtime = -1;
			g_solution = 0;
			g_finished = false;
			g_history_idx = 0;
            g_history = [];
            delete g_current_state.hint_cache;
            g_current_state.hint_state = NO_HINT;
            g_current_state.hinted_tile = -1;

			if (g_mode === 1) {
				// unset all givens
				g_current_state.board.forEach((tile) => {
					tile.given = false;
				});
			}
		}
		else if (data.state === 1 && g_mode === 0) {
			g_starttime = new Date().getTime();

			solveGame(g_current_state).then((res) => {
				if (res === NO_SOLUTIONS) {
					io.emit("no_solutions", {});
				}
				else if (res === NO_UNIQUE_SOLUTION) {
					io.emit("multiple_solutions", {});
				}
				else {
					g_solution = res;
				}
			});

			g_current_state = setGivens(g_current_state);
			g_history.push({
                gameState: copyGameState(g_current_state)
            });
			g_history_idx = 0;
		}
		g_mode = data.state;
	}
	if (("old_state" in data) && ("new_state" in data)) {
		let old_state = data.old_state;
		let new_state = data.new_state;

        if (!validGameState(old_state) || !validGameState(new_state)) {
            // immediately abort if we got invalid game states in the request
            console.log("invalid game state");
            return;
        }

        let trans_state = copyGameState(g_current_state);

        let changed = false;
        // don't allow changes once the game has finished
        if (!g_finished) {
            // go through and only accept changes to cells which match
            // in g_current_state and old_state
            for (let i = 0; i < 81; i++) {
                let ot = old_state.board[i];
                let gt = g_current_state.board[i];

                if (ot.val === gt.val &&
                        ot.pencils === gt.pencils &&
                        ot.possibles === gt.possibles &&
                        ot.given === gt.given &&
                        ot.cage_idx === gt.cage_idx &&
                        ot.user_color === gt.user_color) {

                    changed = updateTile(trans_state, new_state, i, user) || changed;
                }
            }
        }

        if (g_mode === 0) {
            let new_cages = new Map();
            for (let i = 0; i < 81; i++) {
                let ot = old_state.board[i];
                let gt = g_current_state.board[i];

                if (ot.val === gt.val &&
                        ot.pencils === gt.pencils &&
                        ot.possibles === gt.possibles &&
                        ot.given === gt.given &&
                        ot.cage_idx === gt.cage_idx &&
                        ot.user_color === gt.user_color) {

                    let new_cage_idx = new_state.board[i].cage_idx;
                    if (new_cage_idx !== ot.cage_idx) {
                        if (new_cage_idx === -1) {
                            trans_state.board[i].cage_idx = -1;
                        }
                        else if (!new_cages.has(new_cage_idx)) {
                            new_cages.put(new_cage_idx, {
                                sum: new_state.cages[new_cage_idx].sum,
                                tiles: [i]
                            });
                        }
                        else {
                            new_cages.get(new_cage_idx).tiles.push(i);
                        }
                        changed = true;
                    }
                }
            }

            let n_cages = trans_state.cages.length;
            new_cages.forEach((cage) => {
                cage.tiles.forEach((tile_idx) => {
                    trans_state.tiles[tile_idx].cage_idx = n_cages;
                });
                trans_state.cages.push(cage);
                n_cages++;
            });
            organizeCages(trans_state);
        }

        if (changed && validGameState(trans_state)) {
            g_current_state = trans_state;
            gameStateChanged();
        }
	}
	if ("selected" in data) {
		let selected = data.selected;
		let user_color = user.color;
		for (let idx in selected) {
			let user_colors = selected[idx];
			if (user_colors.includes(user_color)) {
				if (!(idx in g_selected)) {
					g_selected[idx] = [user_color];
				}
				else {
					let g_user_colors = g_selected[idx];
					if (!g_user_colors.includes(user_color)) {
						g_user_colors.push(user_color);
					}
				}
			}
		};

		for (let idx in g_selected) {
			let user_colors = g_selected[idx];
			if (user_colors.includes(user_color)) {
				if (!(idx in selected) || !(selected[idx].includes(user_color))) {
					let new_arr = user_colors.filter((color) => color !== user_color);
					if (new_arr.length > 0) {
						g_selected[idx] = new_arr;
					}
					else {
						delete g_selected[idx];
					}
				}
			}
		}
	}

	io.emit("update", {
		gameState: g_current_state,
		state: g_mode,
		selected: g_selected,
		starttime: g_starttime,
		endtime: g_endtime,
		finished: g_finished
	});
}


// returns true if the current game state is on the right track, i.e. no discrepancies
// between it and the correct solution so far
function onRightTrack() {
	for (let i = 0; i < g_solution.length; i++) {
		let r = Math.floor(i / 9);
		let c = i % 9;

		let tile = g_current_state.board[_idx(r, c)];
		let ans  = g_solution[r * 9 + c];

		if (tile.val !== 0 && ans !== tile.val) {
			return false;
		}
    }
    return true;
}


function verify_cells(socket, data) {
	if (!("token" in data)) {
		console.log("bad request", data);
		return;
	}
	let token = data.token;

	if (!g_users.has(token)) {
		return;
	}
	
	if (g_solution === 0) {
		// no solution
		return;
    }

    let changed = false;

	for (let i = 0; i < g_solution.length; i++) {
		let r = Math.floor(i / 9);
		let c = i % 9;

		let tile = g_current_state.board[_idx(r, c)];
		let ans  = g_solution[r * 9 + c];

		if (tile.val !== 0 && ans !== tile.val) {
			// make all incorrect cells negative
            tile.val = -tile.val;
            changed = true;
		}
    }
    
    if (changed) {
        addToHistory(g_current_state);
    }

    if (changed) {
        io.emit("update", {
            gameState: g_current_state
        });
    }
    else {
        // letting the users know that everything is right so far
        io.emit("on_right_track", {});
    }
}


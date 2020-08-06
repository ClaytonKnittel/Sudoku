var socketio = require("socket.io"),
    crypto = require("crypto");

const { assert } = require("console");

const { initGameState, copyGameState, wellFormed, setGivens, _idx, checkGameOver } = require('./public/game_logic');
const { NO_SOLUTIONS, NO_UNIQUE_SOLUTION, solveGame, findHint } = require('./game_solver');
const { on } = require("process");


var io;

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


function init(app) {
    io = socketio.listen(app);
    io.sockets.on("connection", function(socket) {


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
                io.sockets.emit("update", {
                    gameState: g_current_state,
                    state: g_mode,
                    selected: g_selected,
                    starttime: g_starttime,
                    endtime: g_endtime,
                    finished: g_finished
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
            g_current_state = copyGameState(g_history[g_history_idx]);

            io.sockets.emit("update", {
                gameState: g_current_state,
                state: g_mode,
                selected: g_selected,
                starttime: g_starttime,
                endtime: g_endtime,
                finished: g_finished
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
            g_current_state = copyGameState(g_history[g_history_idx]);

            io.sockets.emit("update", {
                gameState: g_current_state,
                state: g_mode,
                selected: g_selected,
                starttime: g_starttime,
                endtime: g_endtime,
                finished: g_finished
            });
        });

        socket.on("give_hint", (data) => {
            if (!("token" in data)) {
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
                io.sockets.emit("solution_discrepancy");
                return;
            }

            let tile_idx = findHint(g_current_state);
            if (tile_idx === -1) {
                io.sockets.emit("no_hint", {});
            }
            else {
                let g_idx = _idx(Math.floor(tile_idx / 9), tile_idx % 9);
                // mark both current state and state in history as hinted
                g_current_state[g_idx].hinted = true;
                g_history[g_history_idx][g_idx].hinted = true;
                io.sockets.emit("update", {
                    gameState: g_current_state,
                    state: g_mode,
                    selected: g_selected,
                    starttime: g_starttime,
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

                io.sockets.emit("update", {
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


function updateTile(new_state, idx, user) {
    let s1 = g_current_state[idx];
    let s2 = new_state[idx];
    
    if ((s1.val != s2.val || s1.pencils != s2.pencils ||
        s1.possibles != s2.possibles || s1.user_color != s2.user_color ||
        s1.hinted != s2.hinted)
            && !s1.given) {

        s1.val = s2.val;
        s1.pencils = s2.pencils;
        s1.possibles = s2.possibles;
        s1.given = s2.given;
        s1.user_color = user.color;
        // you can un-hint a tile, but you can't make it a hint if it wasn't one
        s1.hinted = s1.hinted && s2.hinted;
        return true;
    }
    return false;
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

			if (g_mode === 1) {
				// unset all givens
				g_current_state.forEach((tile) => {
					tile.given = false;
				});
			}
		}
		else if (data.state === 1 && g_mode === 0) {
			g_starttime = new Date().getTime();

			solveGame(g_current_state).then((res) => {
				if (res === NO_SOLUTIONS) {
					io.sockets.emit("no_solutions", {});
				}
				else if (res === NO_UNIQUE_SOLUTION) {
					io.sockets.emit("multiple_solutions", {});
				}
				else {
					g_solution = res;
				}
			});

			g_current_state = setGivens(g_current_state);
			g_history.push(copyGameState(g_current_state));
			g_history_idx = 0;
		}
		g_mode = data.state;
	}
	if (("old_state" in data) && ("new_state" in data)) {
		let old_state = data.old_state;
		let new_state = data.new_state;
		let changed = false;

			// don't allow changes once the game has finished
		if (!g_finished && old_state.length === 81) {
            // go through and only accept changes to cells which match
            // in g_current_state and old_state
            for (let i = 0; i < 81; i++) {
                if (!wellFormed(old_state[i])) {
                    // skip malformed tiles
                    continue;
                }
        
                if (old_state.val === g_current_state.val &&
                        old_state.pencils === g_current_state.pencils &&
                        old_state.possibles === g_current_state.possibles &&
                        old_state.given === g_current_state.given &&
                        old_state.user_color === g_current_state.user_color &&
                        old_state.hinted === g_current_state.hinted) {

                    changed = updateTile(new_state, i, user) || changed;
                }
            }
		}

		if (changed) {
			if (g_mode === 1 && !g_finished) {
				g_finished = checkGameOver(g_current_state);
				if (g_finished) {
					g_endtime = new Date().getTime();
				}
			}

			if (g_mode === 1) {
				// append to history
				if (g_history_idx === g_history.length - 1) {
					g_history.push(copyGameState(g_current_state));
					g_history_idx++;
				}
				else {
					assert(g_history_idx < g_history.length);

					for (let i = g_history.length - 2; i >= g_history_idx; i--) {
						// no need to deep copy
						g_history.push(g_history[i]);
					}
					g_history.push(copyGameState(g_current_state));
					g_history_idx = g_history.length - 1;
				}
			}
		}
	}
	if ("selected" in data) {
		let selected = data.selected;
		let user_color = user.color;
		for (idx in selected) {
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

		for (idx in g_selected) {
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

	io.sockets.emit("update", {
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

		let tile = g_current_state[_idx(r, c)];
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

	for (let i = 0; i < g_solution.length; i++) {
		let r = Math.floor(i / 9);
		let c = i % 9;

		let tile = g_current_state[_idx(r, c)];
		let ans  = g_solution[r * 9 + c];

		if (tile.val !== 0 && ans !== tile.val) {
			// make all incorrect cells negative
			tile.val = -tile.val;
		}
	}

	io.sockets.emit("update", {
		gameState: g_current_state,
		state: g_mode,
		selected: g_selected,
		starttime: g_starttime,
		endtime: g_endtime,
		finished: g_finished
	});
}


exports.init = init;

module.exports = exports;

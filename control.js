var socketio = require("socket.io"),
    crypto = require("crypto");

const { assert } = require("console");

const { initGameState, copyGameState, gameStatesEqual, setGivens, _idx } = require('./public/game_logic');
const { NO_SOLUTIONS, NO_UNIQUE_SOLUTION, solveGame } = require('./game_solver');


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


function update_g_state(new_state, user) {
	let changed = false;
	for (let i = 0; i < g_current_state.length; i++) {
		let s1 = g_current_state[i];
		let s2 = new_state[i];

		if ((s1.val != s2.val || s1.pencils != s2.pencils ||
			s1.possibles != s2.possibles || s1.user_color != s2.user_color)
				&& (!s1.given || s2.given)) {

			s1.val = s2.val;
			s1.pencils = s2.pencils;
			s1.possibles = s2.possibles;
			s1.given = s2.given;
			s1.user_color = user.color;
			changed = true;
		}
	}
	return changed;
}

// check if we have game over
function checkGameOver(gameState) {
    // check rows
    for (let r = 0; r < 9; r++) {
        let m = 0;
        for (let c = 0; c < 9; c++) {
            let val = gameState[_idx(r, c)].val;
            if (val == 0) {
                return false;
            }
            m |= (1 << (val - 1));
        }
        if (m != 511) {
            return false;
        }
    }
    // check cols
    for (let c = 0; c < 9; c++) {
        let m = 0;
        for (let r = 0; r < 9; r++) {
            let val = gameState[_idx(r, c)].val;
            if (val == 0) {
                return false;
            }
            m |= (1 << (val - 1));
        }
        if (m != 511) {
            return false;
        }
    }
    // check boxes
    for (let b = 0; b < 9; b++) {
        let m = 0;
        for (let i = 0; i < 9; i++) {
            let r = Math.floor(b / 3) * 3 + Math.floor(i / 3);
            let c = (b % 3) * 3 + (i % 3);

            let val = gameState[_idx(r, c)].val;
            if (val == 0) {
                return false;
            }
            m |= (1 << (val - 1));
        }
        if (m != 511) {
            return false;
        }
    }
    return true;
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

			// for (let i = 0; i < 9; i++) {
			// 	g_current_state[_idx(i, 0)].val = i + 1;
			// 	g_current_state[_idx((i + 6) % 9, 1)].val = i + 1;
			// 	g_current_state[_idx((i + 3) % 9, 2)].val = i + 1;
			// 	g_current_state[_idx((i + 1) % 9, 3)].val = i + 1;
			// 	g_current_state[_idx((i + 7) % 9, 4)].val = i + 1;
			// 	g_current_state[_idx((i + 4) % 9, 5)].val = i + 1;
			// 	g_current_state[_idx((i + 2) % 9, 6)].val = i + 1;
			// 	g_current_state[_idx((i + 8) % 9, 7)].val = i + 1;

			// 	for (let c = 0; c < 8; c++) {
			// 		g_current_state[_idx(i, c)].user_color = 0;
			// 		g_current_state[_idx(i, c)].given = true;
			// 	}
			// }

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
		let changed = true;

		if (g_finished) {
			// don't allow changes once the game has finished
			changed = false;
		}
		if (!gameStatesEqual(old_state, g_current_state)) {
			// conflict! for now just return current global state
			new_state = g_current_state;
			changed = false;
		}

		if (changed) {
			changed = update_g_state(new_state, user);
			if (g_mode === 1 && !g_finished) {
				g_finished = checkGameOver(g_current_state);
				if (g_finished) {
					g_endtime = new Date().getTime();
				}
			}

			if (g_mode === 1 && changed) {
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

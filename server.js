var http = require("http"),
    url = require("url"),
    path = require("path"),
    mime = require("mime"),
	fs = require("fs"),
	socketio = require("socket.io"),
	crypto = require("crypto");

let port = 80;

var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server.
    var reqFile = url.parse(req.url).pathname;
    if (reqFile === "/") {
        reqFile = "/index.html";
    }
	var filename = path.join(__dirname, "/public", reqFile);
    (fs.exists || path.exists)(filename, function(exists){
        if (exists) {
            fs.readFile(filename, function(err, data){
				if (err) {
					// File exists but is not readable (permissions issue?)
					resp.writeHead(500, {
						"Content-Type": "text/plain"
					});
					resp.write("Internal server error: could not read file");
					resp.end();
					return;
				}
				
				// File exists and is readable
				var mimetype = mime.getType(filename);
				resp.writeHead(200, {
					"Content-Type": mimetype
				});
				resp.write(data);
				resp.end();
			});
        }
        else {
            // File does not exist
			resp.writeHead(404, {
				"Content-Type": "text/plain"
			});
			resp.write("Requested file not found: "+filename);
			resp.end();
        }
    });
	
});
app.listen(port);


function initGameState() {
    let arr = [];
    for (let i = 0; i < 81; i++) {
        arr.push({
            val: 0,
            pencils: 0,
            possibles: 0,
			given: false,
			user_color: -1
        });
    }
    return arr;
}

function wellFormed(tileState) {
	return ('val' in tileState) && ('pencils' in tileState) &&
		   ('possibles' in tileState) && ('given' in tileState) &&
		   ('user_color' in tileState);
}

function gameStatesEqual(s1, s2) {
	if (s1.length !== s2.length) {
		return false;
	}
	for (let i = 0; i < s1.length; i++) {
		if (!wellFormed(s1[i]) || !wellFormed(s2[i])) {
			return false;
		}

		if (s1.val != s2.val || s1.pencils != s2.pencils ||
				s1.possibles != s2.possibles || s1.given != s2.given ||
				s1.user_color != s2.user_color) {
			return false;
		}
	}
	return true;
}


let g_current_state = initGameState();
let g_mode = 0;

// map from tokens to user objects
let g_users = new Map();
let g_socket_id_to_tokens = new Map();
let g_user_id_to_user = new Map();
let g_user_idx = 0;
const n_user_colors = 10;

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


var io = socketio.listen(app);
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
			state: g_mode
		});
	});

	socket.on("update", (data) => {
		update_game(socket, data);
	});

});


function update_g_state(new_state, user) {
	for (let i = 0; i < g_current_state.length; i++) {
		let s1 = g_current_state[i];
		let s2 = new_state[i];

		if (s1.val != s2.val || s1.pencils != s2.pencils ||
			s1.possibles != s2.possibles || s1.given != s2.given ||
			s1.user_color != s2.user_color) {

			s1.val = s2.val;
			s1.pencils = s2.pencils;
			s1.possibles = s2.possibles;
			s1.given = s2.given;
			s1.user_color = user.color;
		}
	}
}


function update_game(socket, data) {
	if (!("old_state" in data) || !("new_state" in data) || !("state" in data) ||
			!("token" in data)) {
		console.log("bad request", data);
		return;
	}
	let old_state = data.old_state;
	let new_state = data.new_state;
	let new_mode  = data.state;
	let token 	  = data.token;

	if (!g_users.has(token)) {
		console.log(token, g_users);
		g_users.forEach((v, k) => {
			console.log(k, token === k);
		});
		return;
	}
	let user = g_users.get(token);

	if (!gameStatesEqual(old_state, g_current_state)) {
		// conflict! for now just return current global state
		new_state = g_current_state;
	}

	update_g_state(new_state, user);
	g_mode = new_mode;

	io.sockets.emit("update", {
		gameState: g_current_state,
		state: g_mode
	});
	console.log(g_users);
}

var http = require("http"),
    url = require("url"),
    path = require("path"),
    mime = require("mime"),
	fs = require("fs"),
	socketio = require("socket.io");

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
            given: false
        });
    }
    return arr;
}

function wellFormed(tileState) {
	return ('val' in tileState) && ('pencils' in tileState) &&
		   ('possibles' in tileState) && ('given' in tileState);
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
				s1.possibles != s2.possibles || s1.given != s2.given) {
			return false;
		}
	}
	return true;
}


let g_current_state = initGameState();
let g_mode = 0;


var io = socketio.listen(app);
io.sockets.on("connection", function(socket) {

	socket.on("fetch", () => {
		socket.emit("fetch_response", {
			gameState: g_current_state
		});
	});

	socket.on("update", (data) => {
		update_game(socket, data);
	});

});


function update_game(socket, data) {
	if (!("old_state" in data) || !("new_state" in data) || !("state" in data)) {
		console.log("bad request", data);
		return;
	}
	let old_state = data.old_state;
	let new_state = data.new_state;
	let new_mode  = data.state;

	if (!gameStatesEqual(old_state, g_current_state)) {
		// conflict! for now just return current global state
		new_state = g_current_state;
	}

	g_mode = new_mode;

	io.sockets.emit("update", {
		gameState: new_state,
		state: new_mode
	});
}

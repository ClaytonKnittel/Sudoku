
const NO_HINT = 0;
const HINT_LVL1 = 1;
const HINT_LVL2 = 2;
const HINT_LVL3 = 3;


function initTile() {
    return {
        val: 0,
        pencils: 0,
        possibles: 0,
        given: false,
        revealed: false,
        user_color: -1
    }
}

function initGameState() {
    let arr = [];
    for (let i = 0; i < 81; i++) {
        arr.push(initTile());
    }
    return {
        board: arr,

        hint_state: NO_HINT,
        // to be set to [0-80] when a tile is given as a hint
        hinted_tile: -1
    }
}

function copyGameState(oldState) {
    let newBoard = [];
    oldState.board.forEach((tileState) => {
        newBoard.push({...tileState});
    });
    let newState = {...oldState};
    delete newState.board;
    return {
        board: newBoard,
        ...newState
    };
}


function wellFormed(tileState) {
	return ('val' in tileState) && ('pencils' in tileState) &&
		   ('possibles' in tileState) && ('given' in tileState) &&
		   ('revealed' in tileState) && ('user_color' in tileState);
}

function gameStatesEqual(s1, s2) {
    if (!("board" in s1) || !("hinted_tile" in s1) || !("hint_state" in s1) ||
            !("board" in s1) || !("hinted_tile" in s1) || !("hint_state" in s1)) {
        return false;
    }
	if (s1.board.length !== s2.board.length) {
		return false;
    }
    if (s1.hint_state !== s2.hint_state || s1.hinted_tile !== s2.hinted_tile) {
        return false;
    }
	for (let i = 0; i < s1.board.length; i++) {
        let t1 = s1.board[i];
        let t2 = s2.board[i];

		if (!wellFormed(t1) || !wellFormed(t2)) {
			return false;
        }

		if (t1.val != t2.val || t1.pencils != t2.pencils ||
				t1.possibles != t2.possibles || t1.given != t2.given ||
				t1.user_color != t2.user_color) {
			return false;
		}
	}
	return true;
}


function deleteAllSelected(selected, user_color) {
    for (const idx in selected) {
        let user_colors = selected[idx];
        let new_lis = user_colors.filter((color) => color !== user_color);
        if (new_lis.length === 0) {
            delete selected[idx];
        }
        else {
            selected[idx] = new_lis;
        }
    }
}


function dupArrayMap(am) {
    let dup = {};
    for (const [key, val] of Object.entries(am)) {
        dup[key] = [...val];
    }
    return dup;
}

/*
 * returns the number of tiles this user has selected
 */
function numSelected(selected, user_color) {
    let cnt = 0;
    for (const [_, val] of Object.entries(selected)) {
        val.forEach((col) => {
            cnt += (col === user_color) ? 1 : 0;
        });
    }
    return cnt;
}


function anyNonGivens(state) {
    let changes = false;
    for (let i = 0; i < state.board.length; i++) {
        let tileState = state.board[i];
        if (!(tileState.given)) {
            changes = (changes || (tileState.val != 0 || tileState.pencils != 0 || tileState.possibles != 0));
        }
    }
    return changes;
}


function setGivens(gameState) {
    let gsc = copyGameState(gameState);
    // go through setGivenList and make all tiles givens
    gsc.board.forEach((tileState) => {
        if (tileState.val != 0) {
            tileState.given = true;
            tileState.user_color = -1;
        }
    });
    return gsc;
}



function _idx(r, c) {
    let b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    let i = (r % 3) * 3 + (c % 3);
    return b * 9 + i;
}

function _idx_to_rc(idx) {
    let b = Math.floor(idx / 9);
    let i = idx % 9;
    let r = Math.floor(b / 3) * 3 + Math.floor(i / 3);
    let c = (b % 3) * 3 + (i % 3);
    return [r, c];
}


/*
 * calls given callback on each tile in given row, with arguments
 * (tile, row, col)
 */
function gameStateForEachRow(gameState, row_idx, callback) {
    for (let c = 0; c < 9; c++) {
        let idx = _idx(row_idx, c);
        callback(gameState[idx], row_idx, c);
    }
}

/*
 * calls given callback on each tile in given column, with arguments
 * (tile, row, col)
 */
function gameStateForEachCol(gameState, col_idx, callback) {
    for (let r = 0; r < 9; r++) {
        let idx = _idx(r, col_idx);
        callback(gameState[idx], r, col_idx);
    }
}

/*
 * calls given callback on each tile in given box, with arguments
 * (tile, row, col)
 */
function gameStateForEachBox(gameState, box_idx, callback) {
    for (let i = 0; i < 9; i++) {
        let idx = 9 * box_idx + i;
        let [r, c] = _idx_to_rc(idx)
        callback(gameState[idx], r, c);
    }
}


const NOT_DONE = 1;
const NOT_RIGHT = 2;
const RIGHT = 3;


function checkState(gameState) {
    let gameBoard = gameState.board;
    // check rows
    for (let r = 0; r < 9; r++) {
        let m = 0;
        for (let c = 0; c < 9; c++) {
            let val = gameBoard[_idx(r, c)].val;
            if (val == 0) {
                return NOT_DONE;
            }
            m |= (1 << (val - 1));
        }
        if (m != 511) {
            return NOT_RIGHT;
        }
    }
    // check cols
    for (let c = 0; c < 9; c++) {
        let m = 0;
        for (let r = 0; r < 9; r++) {
            let val = gameBoard[_idx(r, c)].val;
            if (val == 0) {
                return NOT_DONE;
            }
            m |= (1 << (val - 1));
        }
        if (m != 511) {
            return NOT_RIGHT;
        }
    }
    // check boxes
    for (let b = 0; b < 9; b++) {
        let m = 0;
        for (let i = 0; i < 9; i++) {
            let r = Math.floor(b / 3) * 3 + Math.floor(i / 3);
            let c = (b % 3) * 3 + (i % 3);

            let val = gameBoard[_idx(r, c)].val;
            if (val == 0) {
                return NOT_DONE;
            }
            m |= (1 << (val - 1));
        }
        if (m != 511) {
            return NOT_RIGHT;
        }
    }
    return RIGHT;
}

// check if we have game over
function checkGameOver(gameState) {
    return checkState(gameState) == RIGHT;
}


try {
    exports.NO_HINT = NO_HINT,
    exports.HINT_LVL1 = HINT_LVL1,
    exports.HINT_LVL2 = HINT_LVL2,
    exports.HINT_LVL3 = HINT_LVL3,
    exports.initTile = initTile;
    exports.initGameState = initGameState;
    exports.copyGameState = copyGameState;
    exports.wellFormed = wellFormed;
    exports.gameStatesEqual = gameStatesEqual;
    exports.deleteAllSelected = deleteAllSelected;
    exports.dupArrayMap = dupArrayMap;
    exports.numSelected = numSelected;
    exports.anyNonGivens = anyNonGivens;
    exports.setGivens = setGivens;
    exports._idx = _idx;
    exports._idx_to_rc = _idx_to_rc;
    exports.gameStateForEachRow = gameStateForEachRow;
    exports.gameStateForEachCol = gameStateForEachCol;
    exports.gameStateForEachBox = gameStateForEachBox;
    exports.NOT_DONE = NOT_DONE;
    exports.NOT_RIGHT = NOT_RIGHT;
    exports.RIGHT = RIGHT;
    exports.checkState = checkState;
    exports.checkGameOver = checkGameOver;
} catch (ReferenceError) {
    // not node.js
}


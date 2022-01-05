
export const NO_HINT = 0;
export const HINT_LVL1 = 1;
export const HINT_LVL2 = 2;
export const HINT_LVL3 = 3;


export function initTile() {
    return {
        val: 0,
        pencils: 0,
        possibles: 0,
        given: false,
        revealed: false,
        cage_idx: -1,
        user_color: -1
    }
}

export function initGameState() {
    let arr = [];
    for (let i = 0; i < 81; i++) {
        arr.push(initTile());
    }
    return {
        board: arr,

        hint_state: NO_HINT,
        // to be set to [0-80] when a tile is given as a hint
        hinted_tile: -1,

        // a list of the totals of the cages in the game state along with a list of all tile
        // indexes of the tiles within the cage, indexed by cage_idx
        // {
        //    sum: <cage sum>,
        //    tiles: [<tile_1>, ...]
        // }
        cages: []
    }
}

export function copyGameState(oldState) {
    let newBoard = [];
    let newCages = [];
    oldState.board.forEach((tileState) => {
        newBoard.push({...tileState});
    });
    oldState.cages.forEach((cage) => {
        newCages.push({
            sum: cage.sum,
            tiles: [...cage.tiles]
        });
    });
    let newState = {...oldState};
    delete newState.board;
    delete newState.cages;
    return {
        board: newBoard,
        cages: newCages,
        ...newState
    };
}


export function wellFormed(tileState) {
	return ('val' in tileState) && ('pencils' in tileState) &&
		   ('possibles' in tileState) && ('given' in tileState) &&
		   ('revealed' in tileState) && ('cage_idx' in tileState) &&
           ('user_color' in tileState);
}

export function wellFormedCage(cageState) {
    return ('sum' in cageState) && ('tiles' in cageState) &&
            (typeof cageState.tiles == "object") && ('length' in cageState.tiles);
}

export function validGameState(gameState) {
    if (!("board" in gameState) || !("hinted_tile" in gameState) ||
            !("hint_state" in gameState) || !("cages" in gameState) ||
            !("board" in gameState) || !("hinted_tile" in gameState) ||
            !("hint_state" in gameState) || !("cages" in gameState)) {
        return false;
    }

    if (gameState.board.length !== 81) {
        return false;
    }
    if (gameState.hint_state !== NO_HINT &&
            gameState.hint_state !== HINT_LVL1 &&
            gameState.hint_state !== HINT_LVL2 &&
            gameState.hint_state !== HINT_LVL3) {
        console.log("invalid hint");
        return false;
    }

    for (let i = 0; i < gameState.board.length; i++) {
        let t = gameState.board[i];
		if (!wellFormed(t)) {
            console.log("malformed tile", i);
            return false;
        }
        if (t.val < 0 || t.val > 9) {
            console.log(t.val, "oob");
            return false;
        }

        let cage_idx = t.cage_idx;
        if (cage_idx >= gameState.cages.length) {
            console.log(cage_idx, "invalid cage idx");
            return false;
        }
        if (cage_idx >= 0 && !(i in gameState.cages[cage_idx].tiles)) {
            console.log(cage_idx, "invalid cage idx2");
            return false;
        }
    }

    for (let i = 0; i < gameState.cages.length; i++) {
        let c = gameState.cages[i];
        if (!wellFormedCage(c)) {
            return false;
        }

        let prev_tile_idx = -1;
        for (let j = 0; j < c.tiles.length; j++) {
            let tile_idx = c.tiles[j];
            if (tile_idx < 0 || tile_idx > 80 || gameState.board[tile_idx].cage_idx !== i) {
                return false;
            }
            if (tile_idx <= prev_tile_idx) {
                return false;
            }
            prev_tile_idx = tile_idx;
        }
    }

    return true;
}

export function gameStatesEqual(s1, s2) {
    if (s1.hint_state !== s2.hint_state || s1.hinted_tile !== s2.hinted_tile) {
        return false;
    }
	for (let i = 0; i < s1.board.length; i++) {
        let t1 = s1.board[i];
        let t2 = s2.board[i];

		if (t1.val != t2.val || t1.pencils != t2.pencils ||
				t1.possibles != t2.possibles || t1.given != t2.given ||
				t1.cage_idx != t2.cage_idx || t1.user_color != t2.user_color) {
			return false;
		}
	}
    for (let i = 0; i < s1.cages.length; i++) {
        let c1 = s1.cages[i];
        let c2 = s2.cages[i];

        if (c1.sum != c2.sum || c1.tiles.length !== c2.tiles.length) {
            return false;
        }

        for (let j = 0; j < c1.tiles.length; j++) {
            if (c1.tiles[j] != c2.tiles[j]) {
                return false;
            }
        }
    }
	return true;
}


export function deleteAllSelected(selected, user_color) {
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


export function dupArrayMap(am) {
    let dup = {};
    for (const [key, val] of Object.entries(am)) {
        dup[key] = [...val];
    }
    return dup;
}

/*
 * returns the number of tiles this user has selected
 */
export function numSelected(selected, user_color) {
    let cnt = 0;
    for (const [_, val] of Object.entries(selected)) {
        val.forEach((col) => {
            cnt += (col === user_color) ? 1 : 0;
        });
    }
    return cnt;
}


export function anyNonGivens(state) {
    let changes = false;
    for (let i = 0; i < state.board.length; i++) {
        let tileState = state.board[i];
        if (!(tileState.given)) {
            changes = (changes || (tileState.val != 0 || tileState.pencils != 0 || tileState.possibles != 0));
        }
    }
    return changes;
}


export function setGivens(gameState) {
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



export function _idx(r, c) {
    let b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    let i = (r % 3) * 3 + (c % 3);
    return b * 9 + i;
}

export function _idx_to_rc(idx) {
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
export function gameStateForEachRow(gameState, row_idx, callback) {
    for (let c = 0; c < 9; c++) {
        let idx = _idx(row_idx, c);
        callback(gameState[idx], row_idx, c);
    }
}

/*
 * calls given callback on each tile in given column, with arguments
 * (tile, row, col)
 */
export function gameStateForEachCol(gameState, col_idx, callback) {
    for (let r = 0; r < 9; r++) {
        let idx = _idx(r, col_idx);
        callback(gameState[idx], r, col_idx);
    }
}

/*
 * calls given callback on each tile in given box, with arguments
 * (tile, row, col)
 */
export function gameStateForEachBox(gameState, box_idx, callback) {
    for (let i = 0; i < 9; i++) {
        let idx = 9 * box_idx + i;
        let [r, c] = _idx_to_rc(idx)
        callback(gameState[idx], r, c);
    }
}

/*
 * calls given callback on each tile in given cage, with arguments
 * (tile, row, col)
 */
export function gameStateForEachCage(gameState, cage_idx, callback) {
    cage = gameState.cages[cage_idx];
    for (let i = 0; i < cage.tiles.length; i++) {
        let idx = cage.tiles[i];
        let [r, c] = _idx_to_rc(idx)
        callback(gameState[idx], r, c);
    }
}


export const NOT_DONE = 1;
export const NOT_RIGHT = 2;
export const RIGHT = 3;


export function checkState(gameState) {
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
        if (m != 0x1ff) {
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
        if (m != 0x1ff) {
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
        if (m != 0x1ff) {
            return NOT_RIGHT;
        }
    }
    // check cages
    for (let c = 0; c < gameState.cages.length; c++) {
        let cage = gameState.cages[c];
        let m = 0;
        let s = 0;
        for (let i = 0; i < cage.tiles.length; i++) {
            let val = gameBoard[cage.tiles[i]];
            if (val == 0) {
                return NOT_DONE;
            }
            if ((m & (1 << (val - 1))) != 0) {
                return NOT_RIGHT;
            }

            m |= (1 << (val - 1));
            s += val;
        }
        if (s != cage.sum) {
            return NOT_RIGHT;
        }
    }
    return RIGHT;
}

// check if we have game over
export function checkGameOver(gameState) {
    return checkState(gameState) == RIGHT;
}

export function isCageTotalCell(gameState, idx) {
    const cage_idx = gameState.board[idx].cage_idx;
    return cage_idx !== -1 && gameState.cages[cage_idx].tiles[0] === idx;
}

// reorders cage_idxs, removing cages which are no longer present on the board anywhere
export function organizeCages(gameState) {
    let cage_idx_map = new Map();
    let new_cage_list = [];
    let n_cages = 0;

    for (let i = 0; i < 81; i++) {
        let c_idx = gameState.board[i].cage_idx;
        if (c_idx === -1) {
            continue;
        }

        let new_cage;
        if (!cage_idx_map.has(c_idx)) {
            cage_idx_map.set(c_idx, n_cages);
            new_cage = n_cages;
            n_cages++;

            new_cage_list.push({
                sum: gameState.cages[c_idx].sum,
                tiles: [i]
            });
        }
        else {
            new_cage = cage_idx_map.get(c_idx);
            new_cage_list[new_cage].tiles.push(i);
        }
        gameState.board[i].cage_idx = new_cage;
    }

    gameState.cages = new_cage_list;
}

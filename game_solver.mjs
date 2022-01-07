import { _idx, _idx_to_rc } from './src/game_logic.mjs';

export const NO_SOLUTIONS = 0;
export const NO_UNIQUE_SOLUTION = 1;


function initializeEasyGame(gameState) {
    for (let i = 0; i < 8; i++) {
        gameState.board[_idx(i, 0)].val = i + 1;
        gameState.board[_idx(i, 1)].val = (i + 3) % 9 + 1;
        gameState.board[_idx(i, 2)].val = (i + 6) % 9 + 1;

        gameState.board[_idx(i, 3)].val = (i + 1) % 9 + 1;
        gameState.board[_idx(i, 4)].val = (i + 4) % 9 + 1;
        gameState.board[_idx(i, 5)].val = (i + 7) % 9 + 1;

        gameState.board[_idx(i, 6)].val = (i + 2) % 9 + 1;
        gameState.board[_idx(i, 7)].val = (i + 5) % 9 + 1;
        gameState.board[_idx(i, 8)].val = (i + 8) % 9 + 1;
    }
    gameState.board.forEach((tile) => {
        if (tile.val) tile.given = true;
    });
}


function initializeHardGame(gameState) {
	gameState.board[2].val = 3;
	gameState.board[4].val = 2;
	gameState.board[6].val = 7;
	gameState.board[7].val = 1;
	gameState.board[8].val = 5;

	gameState.board[9].val = 7;
	gameState.board[14].val = 1;
	gameState.board[17].val = 2;

	gameState.board[18].val = 2;
	gameState.board[19].val = 1;
	gameState.board[25].val = 6;

	gameState.board[28].val = 9;
	gameState.board[33].val = 3;

	gameState.board[36].val = 3;
	gameState.board[37].val = 2;
	gameState.board[41].val = 4;

	gameState.board[45].val = 1;
	gameState.board[49].val = 3;
	gameState.board[50].val = 8;
	gameState.board[52].val = 2;

	gameState.board[55].val = 3;
	gameState.board[57].val = 8;

	gameState.board[63].val = 2;
	gameState.board[65].val = 6;
	gameState.board[66].val = 9;
	gameState.board[68].val = 3;

	gameState.board[72].val = 5;
	gameState.board[74].val = 1;
	gameState.board[75].val = 4;
	gameState.board[76].val = 7;
	gameState.board[77].val = 2;
    gameState.board[78].val = 3;
    gameState.board[80].val = 6;
    
    gameState.board.forEach((tile) => {
        if (tile.val) tile.given = true;
    });
}


function initializeKillerGame(gameState) {
    gameState.board[0].cage_idx = 0;
    gameState.board[1].cage_idx = 0;
    gameState.cages.push({
        sum: 11,
        tiles: [0, 1]
    });

    gameState.board[2].cage_idx = 1;
    gameState.board[9].cage_idx = 1;
    gameState.cages.push({
        sum: 5,
        tiles: [2, 9]
    });

    gameState.board[10].cage_idx = 2;
    gameState.board[11].cage_idx = 2;
    gameState.board[14].cage_idx = 2;
    gameState.board[18].cage_idx = 2;
    gameState.board[21].cage_idx = 2;
    gameState.cages.push({
        sum: 26,
        tiles: [10, 11, 14, 18, 21]
    });

    gameState.board[19].cage_idx = 3;
    gameState.board[20].cage_idx = 3;
    gameState.cages.push({
        sum: 9,
        tiles: [19, 20]
    });

    gameState.board[3].cage_idx = 4;
    gameState.board[4].cage_idx = 4;
    gameState.cages.push({
        sum: 15,
        tiles: [3, 4]
    });

    gameState.board[5].cage_idx = 5;
    gameState.board[12].cage_idx = 5;
    gameState.cages.push({
        sum: 12,
        tiles: [5, 12]
    });

    gameState.board[13].cage_idx = 6;
    gameState.board[16].cage_idx = 6;
    gameState.board[37].cage_idx = 6;
    gameState.cages.push({
        sum: 22,
        tiles: [13, 16, 37]
    });

    gameState.board[22].cage_idx = 7;
    gameState.board[23].cage_idx = 7;
    gameState.board[26].cage_idx = 7;
    gameState.cages.push({
        sum: 14,
        tiles: [22, 23, 26]
    });

    gameState.board[6].cage_idx = 8;
    gameState.cages.push({
        sum: 1,
        tiles: [6]
    });

    gameState.board[7].cage_idx = 9;
    gameState.board[8].cage_idx = 9;
    gameState.cages.push({
        sum: 11,
        tiles: [7, 8]
    });

    gameState.board[15].cage_idx = 10;
    gameState.board[36].cage_idx = 10;
    gameState.cages.push({
        sum: 7,
        tiles: [15, 36]
    });

    gameState.board[17].cage_idx = 11;
    gameState.board[24].cage_idx = 11;
    gameState.cages.push({
        sum: 13,
        tiles: [17, 24]
    });

    gameState.board[25].cage_idx = 12;
    gameState.board[46].cage_idx = 12;
    gameState.board[47].cage_idx = 12;
    gameState.board[49].cage_idx = 12;
    gameState.cages.push({
        sum: 23,
        tiles: [25, 46, 47, 49]
    });

    gameState.board[27].cage_idx = 13;
    gameState.board[28].cage_idx = 13;
    gameState.board[30].cage_idx = 13;
    gameState.board[33].cage_idx = 13;
    gameState.cages.push({
        sum: 16,
        tiles: [27, 28, 30, 33]
    });

    gameState.board[29].cage_idx = 14;
    gameState.board[32].cage_idx = 14;
    gameState.board[35].cage_idx = 14;
    gameState.board[56].cage_idx = 14;
    gameState.cages.push({
        sum: 22,
        tiles: [29, 32, 35, 56]
    });

    gameState.board[38].cage_idx = 15;
    gameState.board[41].cage_idx = 15;
    gameState.cages.push({
        sum: 14,
        tiles: [38, 41]
    });

    gameState.board[45].cage_idx = 16;
    gameState.board[48].cage_idx = 16;
    gameState.cages.push({
        sum: 4,
        tiles: [45, 48]
    });

    gameState.board[31].cage_idx = 17;
    gameState.board[34].cage_idx = 17;
    gameState.board[55].cage_idx = 17;
    gameState.cages.push({
        sum: 14,
        tiles: [31, 34, 55]
    });

    gameState.board[39].cage_idx = 18;
    gameState.board[40].cage_idx = 18;
    gameState.cages.push({
        sum: 3,
        tiles: [39, 40]
    });

    gameState.board[50].cage_idx = 19;
    gameState.board[52].cage_idx = 19;
    gameState.board[53].cage_idx = 19;
    gameState.cages.push({
        sum: 18,
        tiles: [50, 52, 53]
    });

    gameState.board[42].cage_idx = 20;
    gameState.board[43].cage_idx = 20;
    gameState.board[63].cage_idx = 20;
    gameState.board[64].cage_idx = 20;
    gameState.cages.push({
        sum: 22,
        tiles: [42, 43, 63, 64]
    });

    gameState.board[44].cage_idx = 21;
    gameState.cages.push({
        sum: 3,
        tiles: [44]
    });

    gameState.board[51].cage_idx = 22;
    gameState.board[65].cage_idx = 22;
    gameState.board[72].cage_idx = 22;
    gameState.cages.push({
        sum: 14,
        tiles: [51, 65, 72]
    });

    gameState.board[54].cage_idx = 23;
    gameState.cages.push({
        sum: 3,
        tiles: [54]
    });

    gameState.board[73].cage_idx = 24;
    gameState.board[76].cage_idx = 24;
    gameState.cages.push({
        sum: 11,
        tiles: [73, 76]
    });

    gameState.board[74].cage_idx = 25;
    gameState.board[77].cage_idx = 25;
    gameState.cages.push({
        sum: 11,
        tiles: [74, 77]
    });

    gameState.board[57].cage_idx = 26;
    gameState.board[58].cage_idx = 26;
    gameState.board[59].cage_idx = 26;
    gameState.cages.push({
        sum: 21,
        tiles: [57, 58, 59]
    });

    gameState.board[66].cage_idx = 27;
    gameState.board[67].cage_idx = 27;
    gameState.board[68].cage_idx = 27;
    gameState.cages.push({
        sum: 9,
        tiles: [66, 67, 68]
    });

    gameState.board[75].cage_idx = 28;
    gameState.board[78].cage_idx = 28;
    gameState.cages.push({
        sum: 14,
        tiles: [75, 78]
    });

    gameState.board[60].cage_idx = 29;
    gameState.board[61].cage_idx = 29;
    gameState.cages.push({
        sum: 12,
        tiles: [60, 61]
    });

    gameState.board[62].cage_idx = 30;
    gameState.board[69].cage_idx = 30;
    gameState.cages.push({
        sum: 8,
        tiles: [62, 69]
    });

    gameState.board[70].cage_idx = 31;
    gameState.board[71].cage_idx = 31;
    gameState.cages.push({
        sum: 13,
        tiles: [70, 71]
    });

    gameState.board[79].cage_idx = 32;
    gameState.board[80].cage_idx = 32;
    gameState.cages.push({
        sum: 4,
        tiles: [79, 80]
    });
}



// bit to be set in solver state array to indicate that this cell is a pset, not
// a given/found value
const PSET_BIT = 0x200;

/*
 * p-sets (possibility sets) are sets of numbers 1 - 9
 */
function pSetInit() {
    return 0x1ff;
}

function pSetAdd(pset, val) {
    return pset | (1 << (val - 1));
}

function pSetRemove(pset, val) {
    return pset & ~(1 << (val - 1));
}

function pSetIncludes(pset, val) {
    return (pset & (1 << (val - 1))) !== 0;
}

function pSetSize(pset) {
    // max bitcount = 10 (with top bit), then subtract 1 for the top bit
    let cnt = (pset & 0x155) + ((pset >> 1) & 0x155);
    cnt = (cnt & 0x333) + ((cnt >> 2) & 0x033);
    cnt = (cnt & 0xf0f) + ((cnt >> 4) & 0x00f);
    cnt = (cnt & 0x0ff) + ((cnt >> 8) & 0x0ff);
    return cnt - 1;
}

// only to be called when pset contains exactly one digit, returns that digit
function pSetResolve(pset) {
    // remove PSET_BIT bit
    pset &= 0x1ff;
    let pos = !(pset & 0x155) + ((!(pset & 0x333)) << 1) + ((!(pset & 0xf0f)) << 2) + ((pset & 0x100) >> 5);
    return pos + 1;
}

function pSetForEach(pset, callback) {
    for (let i = 1; i <= 9; i++) {
        if (pSetIncludes(pset, i)) {
            callback(i);
        }
    }
}

function pSetToString(pset) {
    let str = "";
    for (let i = 1; i <= 9; i++) {
        if (pSetIncludes(pset, i)) {
            str += i.toString() + ", ";
        }
    }
    return "(" + str.substr(0, str.length - 2) + ")";
}


function forEachBoxSum(sum, n_digits, exclude_mask, callback, digit_list=[]) {
    if (n_digits === 0) {
        if (sum === 0) {
            callback(digit_list);
        }
        return;
    }
    if (sum < 0) {
        return;
    }

    pSetForEach(~exclude_mask, (lowest_val) => {
        // exclude this val and all vals lower than it
        let new_mask = exclude_mask | ((1 << lowest_val) - 1);
        forEachBoxSum(sum - lowest_val, n_digits - 1, new_mask, callback, [...digit_list, lowest_val]);
    });
}


function createSolverState(gameState) {
    let arr = [];
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
            let idx = _idx(r, c);
			let val = gameState.board[idx].val;
			if (val === 0) {
				val = pSetInit() | PSET_BIT;
			}
			arr.push({
                val: val,
                cage_idx: gameState.board[idx].cage_idx
            });
		}
	}

    const cages = gameState.cages;
    let new_cages = [];
    for (let i = 0; i < cages.length; i++) {
        let new_tiles = [];
        for (let j = 0; j < cages[i].tiles.length; j++) {
            let [r, c] = _idx_to_rc(cages[i].tiles[j]);
            new_tiles.push(r * 9 + c);
        }

        new_cages.push({
            sum: cages[i].sum,
            tiles: new_tiles
        });
    }

    return {
        arr: arr,
        cages: new_cages
    };
}


function tileIsResolved(tile) {
	return (tile.val & PSET_BIT) === 0;
}


function eliminateTile(arr, idx, num) {
	let tile = arr[idx];
	if (tileIsResolved(tile)) {
		// already resolved
		return false;
	}
	if (pSetIncludes(tile.val, num)) {
        // the number was a possibility here before
        arr[idx].val = pSetRemove(tile.val, num);
		return true;
	}
	// the number already wasn't a possibility
	return false;
}

// returns true if anything was eliminated, false otherwise
function eliminate(state) {
    let arr = state.arr;
    let cages = state.cages;

	let changed = false;
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile)) {
				// not resolved
				continue;
			}

			// go through box
			let br = Math.floor(r / 3) * 3;
			let bc = Math.floor(c / 3) * 3;

			for (let _r = 0; _r < 3; _r++) {
				for (let _c = 0; _c < 3; _c++) {
					changed = eliminateTile(arr, (br + _r) * 9 + (bc + _c), tile.val) || changed;
				}
			}

			// go through column
			for (let _r = 0; _r < 9; _r++) {
				changed = eliminateTile(arr, _r * 9 + c, tile.val) || changed;
			}

			// go through row
			for (let _c = 0; _c < 9; _c++) {
				changed = eliminateTile(arr, r * 9 + _c, tile.val) || changed;
			}

            // go through cage
            if (tile.cage_idx !== -1) {
                for (let _c = 0; _c < cages[tile.cage_idx].tiles.length; _c++) {
                    changed = eliminateTile(arr, cages[tile.cage_idx].tiles[_c], tile.val) || changed;
                }
            }
		}
	}

    for (let c = 0; c < cages.length; c++) {
        let cage = cages[c];

        let exclude_mask = 0;
        let sum = cage.sum;
        let n_free_tiles = 0;
        for (let i = 0; i < cage.tiles.length; i++) {
            let tile = arr[cage.tiles[i]];
            if (tileIsResolved(tile)) {
                exclude_mask = pSetAdd(exclude_mask, tile.val);
                sum -= tile.val;
            }
            else {
                n_free_tiles++;
            }
        }

        let possible = 0;
        forEachBoxSum(sum, n_free_tiles, exclude_mask, (digits) => {
            let mask = 0;
            digits.forEach((digit) => {
                mask = pSetAdd(mask, digit);
            });

            possible |= mask;
        });

        for (let i = 0; i < cage.tiles.length; i++) {
            let tile_idx = cage.tiles[i];
            let tile = arr[tile_idx];

            if (!tileIsResolved(tile)) {
                tile.val &= PSET_BIT | possible;
            }
        }
    }

	return changed;
}

// returns true if anything was resolved (i.e. one possibility left can be resolved)
function resolveGame(arr) {
	let changed = false;
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile) && pSetSize(tile.val) === 1) {
				arr[r * 9 + c].val = pSetResolve(tile.val);
				changed = true;
			}
		}
	}
	return changed;
}

function anyContradictions(state) {
    let arr = state.arr;
    let cages = state.cages;

	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile) && pSetSize(tile.val) === 0) {
				return true;
			}
		}
	}

	// check to see if correct
	// check rows
	for (let r = 0; r < 9; r++) {
		let m = 0;
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile)) {
				continue;
			}
			let mask = (1 << (tile.val - 1));
			if ((m & mask) !== 0) {
				return true;
			}
			m |= mask;
		}
	}
	// check cols
	for (let c = 0; c < 9; c++) {
		let m = 0;
		for (let r = 0; r < 9; r++) {
			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile)) {
				continue;
			}
			let mask = (1 << (tile.val - 1));
			if ((m & mask) !== 0) {
				return true;
			}
			m |= mask;
		}
	}
	// check boxes
	for (let b = 0; b < 9; b++) {
		let m = 0;
		for (let i = 0; i < 9; i++) {
			let r = Math.floor(b / 3) * 3 + Math.floor(i / 3);
			let c = (b % 3) * 3 + (i % 3);

			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile)) {
				continue;
			}
			let mask = (1 << (tile.val - 1));
			if ((m & mask) !== 0) {
				return true;
			}
			m |= mask;
		}
	}
	// check cages
    for (let c = 0; c < cages.length; c++) {
        let cage = cages[c];
        let all_resolved = true;
        let sum = 0;
        let m = 0;

        for (let i = 0; i < cage.tiles.length; i++) {
            let tile = arr[cage.tiles[i]];
            if (!tileIsResolved(tile)) {
                all_resolved = false;
                continue;
            }

            let mask = (1 << (tile.val - 1));
			if ((m & mask) !== 0) {
				return true;
			}
			m |= mask;

            sum += tile.val;
            if (sum > cage.sum) {
                return true;
            }
        }

        if (all_resolved && sum !== cage.sum) {
            return true;
        }
    }
	return false;
}

function isSolved(arr) {
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile)) {
				return false;
			}
		}
	}
	return true;
}

// finds good tile to guess an answer to
function findBestGuessTile(arr) {
	let min_poss = 10;
	let best_idx = -1;
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile)) {
				let l = pSetSize(tile.val);
				if (l < min_poss) {
					min_poss = l;
					best_idx = r * 9 + c;
				}
			}
		}
	}
	return best_idx;
}


function stateDeepCopy(state) {
    let newBoard = [];
    state.arr.forEach((tile) => {
        newBoard.push({...tile});
    });
	return {
        arr: newBoard,
        // no need to copy cages because they are const
        cages: state.cages
    };
}


function printGame({arr, cages}) {
	for (let r = 0; r < 9; r++) {
		let str = "";
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (tileIsResolved(tile)) {
				str += tile.val.toString() + "           ";
			}
			else {
				str += "[";
				for (let i = 1; i <= 9; i++) {
					if (pSetIncludes(tile.val, i)) {
						str += i.toString();
					}
					else {
						str += " ";
					}
				}
				str += "] ";
            }
            
            if (c % 3 === 2) {
                str += "  ";
            }
        }
        if (r === 2 || r === 5) {
            str += "\n";
        }
		console.log(str);
	}
	console.log();
}

function findSoln(state, depth) {
    let arr = state.arr;

	while ((eliminate(state) || resolveGame(arr)) && !anyContradictions(state));

	if (anyContradictions(state)) {
		return NO_SOLUTIONS;
	}
	if (isSolved(arr)) {
		return state;
	}
	let idx = findBestGuessTile(arr);
	let possibleSolns = [];
	let no_unique = false;
	pSetForEach(arr[idx].val, (poss) => {
		// if we already have more than 1 solution, no need to try and find even more
		if (!no_unique && possibleSolns.length <= 1) {
			let state_copy = stateDeepCopy(state);
			state_copy.arr[idx].val = poss;
			let sln = findSoln(state_copy, depth + 1);
			if (sln === NO_SOLUTIONS) {
			}
			else if (sln === NO_UNIQUE_SOLUTION) {
				no_unique = true;
			}
			else {
				// there may still be more solutions, so we must check to make sure this
				// solution is unique
				possibleSolns.push(sln);
			}
		}
	});
	if (no_unique || possibleSolns.length > 1) {
		return NO_UNIQUE_SOLUTION;
	}
	else if (possibleSolns.length === 0) {
		return NO_SOLUTIONS;
	}
	return possibleSolns[0];
}

export async function solveGame(gameState) {
    initializeKillerGame(gameState);
    let state = createSolverState(gameState);
    let soln = findSoln(state, 0);
    return soln;
}



function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}



const CONTINUE = -1;
const FOUND_RESTRICTION = -2;


const ROWS = 0;
const COLS = 1;
const BOXES = 2;

// type is one of ROWS, COLS, BOXES, idx is [0-8]
function constraintIdx(type, idx) {
    return (type * 9) + idx;
}

// returns pair [type, idx], inverse of constraintIdx
function idxToConstraints(idx) {
    return [ Math.floor(idx / 9), idx % 9 ];
}


/*
 * loop through all elements of a given constraint. The arguments to loopFn will be
 * (row, column, idx), where (row, column) are the coordinates of the current tile on
 * the board, and idx is the index of the tile within the given constraint ([0-8] unique)
 */
function constraintForEach(type, idx, loopFn) {
    if (type === ROWS) {
        for (let c = 0; c < 9; c++) {
            loopFn(idx, c, c);
        }
    }
    else if (type === COLS) {
        for (let r = 0; r < 9; r++) {
            loopFn(r, idx, r);
        }
    }
    else {
        for (let i = 0; i < 9; i++) {
            let r = Math.floor(idx / 3) * 3 + Math.floor(i / 3);
            let c = (idx % 3) * 3 + (i % 3);
            loopFn(r, c, i);
        }
    }
}

/*
 * loops through each constraint condition (rows, cols, & boxes) and first
 * calls initFn with parameters (constraint_type, item_idx), where for
 *    constraint_type = ROWS -> item_idx = row index (0-8, counting from top)
 *    constraint_type = COLS -> item_idx = column index (0-8, counting from left)
 *    constraint_type = BOXES -> item_idx = box index (0-8, counting from top left, row-major)
 * and calls loopFn for each cell within the constraint with parameters
 * (row_idx, col_idx, item_idx, constraint_type), where (row_idx, col_idx) are the coordinates
 * of the current cell
 * after iteration through a constraint condition, termFn is called with the same parameters as
 * initFn
 */
function forEachConstraint(initFn, loopFn, termFn=() => {}) {
    // rows
    for (let r = 0; r < 9; r++) {
        initFn(ROWS, r);
        for (let c = 0; c < 9; c++) {
            loopFn(r, c, r, ROWS);
        }
        termFn(ROWS, r);
    }
    // cols
    for (let c = 0; c < 9; c++) {
        initFn(COLS, c);
        for (let r = 0; r < 9; r++) {
            loopFn(r, c, c, COLS);
        }
        termFn(COLS, c);
    }
    // boxes
    for (let b = 0; b < 9; b++) {
        initFn(BOXES, b);
        for (let i = 0; i < 9; i++) {
            let r = Math.floor(b / 3) * 3 + Math.floor(i / 3);
            let c = (b % 3) * 3 + (i % 3);
            loopFn(r, c, b, BOXES);
        }
        termFn(BOXES, b);
    }
}

/*
 * checks for naked singles in the rows/boxes/columns
 */
function nakedSingles(arr) {
    let num_arr;
    let found_tiles = [];
    forEachConstraint(() => {
        num_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        loc_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }, (r, c) => {
        let idx = r * 9 + c;
        let itm = arr[idx];
        if (!tileIsResolved(itm)) {
            pSetForEach(itm, (possibility) => {
                num_arr[possibility - 1]++;
                loc_arr[possibility - 1] = idx;
            });
        }
    }, () => {
        for (let i = 0; i < 9; i++) {
            if (num_arr[i] === 1) {
                //console.log(i + 1, "->", loc_arr[i]);
                found_tiles.push(loc_arr[i]);
            }
        }
    });
    if (found_tiles.length > 0) {
        return randomElement(found_tiles);
    }
    return CONTINUE;
}


function hiddenSingles(arr) {
    let singles = [];
    for (let i = 0; i < arr.length; i++) {
        let itm = arr[i];
        if (!tileIsResolved(itm)) {
            if (pSetSize(itm) === 1) {
                singles.push(i);
            }
        }
    }
    if (singles.length > 0) {
        return randomElement(singles);
    }
    return CONTINUE;
}


/*
 * finds all covers of some subset of n numbers [1-9] that use exactly n tiles,
 * returning the results as a list 
 */
function _find_n_way_covers(arr, constraint_type, item_idx) {
    let cover_list = [];

    constraintForEach(constraint_type, item_idx, (r, c) => {
        let idx = r * 9 + c;
        let itm = arr[idx];
        if (!tileIsResolved(itm)) {
            let pset = itm;
            let setSize = pSetSize(pset);
            let tile_list = [];

            // count # of possible sets that are subsets of this one
            constraintForEach(constraint_type, item_idx, (r, c, cIdx) => {
                let idx = r * 9 + c;
                let otherPset = arr[idx];
                if (!tileIsResolved(otherPset)) {
                    if (!((~pset) & otherPset)) {
                        // otherPset is a subset of pset
                        tile_list.push(cIdx);
                    }
                }
            });

            if (tile_list.length === setSize) {
                // naked set of size <setSize>
                cover_list.push([constraint_type, item_idx, pset, tile_list]);
            }
        }
    });

    return cover_list;
}


function nakedSets(arr) {

    // maps constraint index to number set
    let nakedPairList = [];

    for (let idx = 0; idx < 9; idx++) {
        nakedPairList = nakedPairList.concat(_find_n_way_covers(arr, ROWS, idx));
        nakedPairList = nakedPairList.concat(_find_n_way_covers(arr, COLS, idx));
        nakedPairList = nakedPairList.concat(_find_n_way_covers(arr, BOXES, idx));
    }

    let changed = false;

    nakedPairList.forEach(([ type, item_idx, pset, tile_list ]) => {
        console.log(type === ROWS ? "row" : type === COLS ? "col" : "box",
                item_idx, pSetToString(pset), tile_list);
        constraintForEach(type, item_idx, (r, c, cIdx) => {
            let idx = r * 9 + c;
            if (!tileIsResolved(arr[idx]) && !tile_list.includes(cIdx)) {
                let prevSet = arr[idx];
                // remove all tiles which are in the tileSet
                arr[idx] &= PSET_BIT | ~pset;
                changed = changed || (prevSet !== arr[idx]);
            }
        });
    });

    return changed ? FOUND_RESTRICTION : CONTINUE;
}


/*
 * within one constraint, converts the elements from the mapping
 * tile_idx => possible value set, to
 * possible value => tile_idxs
 * 
 * this function is an involution (it is its own inverse)
 */
function _poss_to_assoc(arr, constraint_idx, item_idx) {
    let new_arr = [];
    
    constraintForEach(constraint_idx, item_idx, (r, c, idx) => {
        let cur_val = idx + 1;
        let assoc_bvec = PSET_BIT;

        constraintForEach(constraint_idx, item_idx, (r, c, cIdx) => {
            let arr_idx = r * 9 + c;
            if (!tileIsResolved(arr[arr_idx])) {
                assoc_bvec |= ((arr[arr_idx] >> (cur_val - 1)) & 1) << cIdx;
            }
            else if (arr[arr_idx] === cur_val) {
                assoc_bvec = cIdx + 1;
            }
        });

        new_arr.push(assoc_bvec);
    });

    constraintForEach(constraint_idx, item_idx, (r, c, c_idx) => {
        let idx = r * 9 + c;
        arr[idx] = new_arr[c_idx];
    });
}


function hiddenSets(arr) {

    // maps constraint index to number set
    let hiddenSetList = [];

    for (let idx = 0; idx < 9; idx++) {
        _poss_to_assoc(arr, ROWS, idx);
        hiddenSetList = hiddenSetList.concat(_find_n_way_covers(arr, ROWS, idx));
        _poss_to_assoc(arr, ROWS, idx);

        _poss_to_assoc(arr, COLS, idx);
        hiddenSetList = hiddenSetList.concat(_find_n_way_covers(arr, COLS, idx));
        _poss_to_assoc(arr, COLS, idx);

        _poss_to_assoc(arr, BOXES, idx);
        hiddenSetList = hiddenSetList.concat(_find_n_way_covers(arr, BOXES, idx));
        _poss_to_assoc(arr, BOXES, idx);
    }

    let changed = false;

    hiddenSetList.forEach(([ type, item_idx, cIdxSet, p_list ]) => {
        console.log(type === ROWS ? "row" : type === COLS ? "col" : "box",
                item_idx, pSetToString(cIdxSet), p_list);

        // form a pset bitmask from p_list (list of digit indices [0-8] for each digit in the
        // hidden set)
        let pset = PSET_BIT;
        p_list.forEach((numIdx) => pset |= (1 << numIdx));
        console.log(pset.toString(2));

        // go through and eliminate all other possibilities in each tile of the cIdxSet
        constraintForEach(type, item_idx, (r, c, cIdx) => {
            let idx = r * 9 + c;
            if (!tileIsResolved(arr[idx]) && pSetIncludes(cIdxSet, cIdx + 1)) {
                let prevSet = arr[idx];
                // remove all tiles which are in the tileSet
                arr[idx] &= pset;
                console.log(cIdx, prevSet.toString(2), "=>", arr[idx].toString(2));
                changed = changed || (prevSet !== arr[idx]);
            }
        });
    });

    return changed ? FOUND_RESTRICTION : CONTINUE;
}



const strategies = [
    nakedSingles,
    hiddenSingles,
    nakedSets,
    hiddenSets
];

const strategy_strings = [
    "There is a naked single",
    "There is a hidden single",
    "There is a naked set",
    "There is a hidden set"
];


export function findHint(gameState) {
    if (gameState.cages.length !== 0) {
        return -1;
    }

    let arr = createSolverState(gameState);
    eliminate(arr);
    let max_strat = 0;
    console.log("hint");
    printGame(arr);

    for (let i = 0; i < strategies.length; i++) {
        let res = strategies[i](arr);
        if (res >= 0) {
            console.log("done");
            printGame(arr);
            return {
                tile_idx: res,
                verbal_hint: strategy_strings[max_strat]
            };
        }
        if (res === CONTINUE) {
            continue;
        }
        if (res === FOUND_RESTRICTION) {
            // restart search
            console.log("found res");
            // printGame(arr);
            max_strat = i;
            i = -1;
            continue;
        }
    }

    return -1;
}


const { _idx } = require('./public/game_logic');

const NO_SOLUTIONS = 0;
const NO_UNIQUE_SOLUTION = 1;


function initializeEasyGame(gameState) {
	gameState[2].val = 3;
	gameState[4].val = 2;
	gameState[6].val = 7;
	gameState[8].val = 5;

	gameState[9].val = 7;
	gameState[14].val = 1;

	gameState[18].val = 2;
	gameState[25].val = 6;

	gameState[28].val = 9;
	gameState[33].val = 3;

	gameState[37].val = 2;
	gameState[41].val = 4;

	gameState[45].val = 1;
	gameState[49].val = 3;
	gameState[50].val = 8;

	gameState[57].val = 8;

	gameState[63].val = 2;
	gameState[65].val = 6;
	gameState[66].val = 9;
	gameState[68].val = 3;

	gameState[72].val = 5;
	gameState[74].val = 1;
	gameState[76].val = 7;
    gameState[80].val = 6;
    
    gameState.forEach((tile) => {
        if (tile.val) tile.given = true;
    });
}

function createSolverState(gameState) {
    let arr = [];
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			let val = gameState[_idx(r, c)].val;
			if (val == 0) {
				val = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			}
			arr.push(val);
		}
	}
    return arr;
}


function tileIsResolved(tile) {
	return !Array.isArray(tile);
}


function eliminateTile(arr, idx, num) {
	let tile = arr[idx];
	if (tileIsResolved(tile)) {
		// already resolved
		return false;
	}
	if (tile.includes(num)) {
		// the number was a possibility here before
		arr[idx] = tile.filter((val) => val !== num);
		return true;
	}
	// the number already wasn't a possibility
	return false;
}

// returns true if anything was eliminated, false otherwise
function eliminate(arr) {
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
					changed = eliminateTile(arr, (br + _r) * 9 + (bc + _c), tile) || changed;
				}
			}

			// go through column
			for (let _r = 0; _r < 9; _r++) {
				changed = eliminateTile(arr, _r * 9 + c, tile) || changed;
			}

			// go through row
			for (let _c = 0; _c < 9; _c++) {
				changed = eliminateTile(arr, r * 9 + _c, tile) || changed;
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
			if (!tileIsResolved(tile) && tile.length === 1) {
				arr[r * 9 + c] = tile[0];
				changed = true;
			}
		}
	}
	return changed;
}

function anyContradictions(arr) {
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (!tileIsResolved(tile) && tile.length === 0) {
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
			let mask = (1 << (tile - 1));
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
			let mask = (1 << (tile - 1));
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
			let mask = (1 << (tile - 1));
			if ((m & mask) !== 0) {
				return true;
			}
			m |= mask;
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
				let l = tile.length;
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
	let n = [];
	state.forEach((tile) => {
		if (tileIsResolved(tile)) {
			n.push(tile);
		}
		else {
			n.push([...tile]);
		}
	});
	return n;
}


function printGame(arr) {
	for (let r = 0; r < 9; r++) {
		let str = "";
		for (let c = 0; c < 9; c++) {
			let tile = arr[r * 9 + c];
			if (tileIsResolved(tile)) {
				str += tile.toString() + "           ";
			}
			else {
				str += "[";
				for (let i = 1; i <= 9; i++) {
					if (tile.includes(i)) {
						str += i.toString();
					}
					else {
						str += " ";
					}
				}
				str += "] ";
			}
		}
		console.log(str);
	}
	console.log();
}

function findSoln(arr) {

	while ((eliminate(arr) || resolveGame(arr)) && !anyContradictions(arr));

	if (anyContradictions(arr)) {
		return NO_SOLUTIONS;
	}
	if (isSolved(arr)) {
		return arr;
	}
	let idx = findBestGuessTile(arr);
	let possibleSolns = [];
	let no_unique = false;
	arr[idx].forEach((poss) => {
		// if we already have more than 1 solution, no need to try and find even more
		if (!no_unique && possibleSolns.length <= 1) {
			let arrCpy = stateDeepCopy(arr);
			arrCpy[idx] = poss;
			let sln = findSoln(arrCpy);
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

async function solveGame(gameState) {
    initializeEasyGame(gameState);
    let arr = createSolverState(gameState);
    let soln = findSoln(arr);
    return soln;
}



function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


const ROWS = 1;
const COLS = 1;
const BOXES = 1;

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
            itm.forEach((possibility) => {
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
    return -1;
}


const strategies = [
    nakedSingles
];


function findHint(gameState) {
    let arr = createSolverState(gameState);
    eliminate(arr);

    for (let i = 0; i < strategies.length; i++) {
        let res = strategies[i](arr);
        if (res !== -1) {
            return res;
        }
    }

    return -1;
}


exports.NO_SOLUTIONS = NO_SOLUTIONS;
exports.NO_UNIQUE_SOLUTION = NO_UNIQUE_SOLUTION;
exports._idx = _idx;
exports.solveGame = solveGame;
exports.findHint = findHint;

module.exports = exports;


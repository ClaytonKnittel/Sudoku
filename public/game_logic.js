

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

function copyGameState(oldState) {
    let newState = [];
    oldState.forEach((tileState) => {
        newState.push({...tileState});
    })
    return newState;
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
    for (let i = 0; i < state.length; i++) {
        let tileState = state[i];
        if (!(tileState.given)) {
            changes = (changes || (tileState.val != 0 || tileState.pencils != 0 || tileState.possibles != 0));
        }
    }
    return changes;
}


function setGivens(gameState) {
    let gsc = copyGameState(gameState);
    // go through setGivenList and make all tiles givens
    gsc.forEach((tileState) => {
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


const NOT_DONE = 1;
const NOT_RIGHT = 2;
const RIGHT = 3;


function checkState(gameState) {
    // check rows
    for (let r = 0; r < 9; r++) {
        let m = 0;
        for (let c = 0; c < 9; c++) {
            let val = gameState[_idx(r, c)].val;
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
            let val = gameState[_idx(r, c)].val;
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

            let val = gameState[_idx(r, c)].val;
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


exports.initGameState = initGameState;
exports.copyGameState = copyGameState;
exports.deleteAllSelected = deleteAllSelected;
exports.dupArrayMap = dupArrayMap;
exports.numSelected = numSelected;
exports.anyNonGivens = anyNonGivens;
exports.setGivens = setGivens;
exports._idx = _idx;
exports.NOT_DONE = NOT_DONE;
exports.NOT_RIGHT = NOT_RIGHT;
exports.RIGHT = RIGHT;
exports.checkState = checkState;



// tile select array is array of bitvectors of selected tiles

function make_empty_tile_select_arr() {
    return [0, 0, 0];
}

// makes tile select array with given tile selected
function make_tile_select_arr(tile) {
    let idx = tile / 32;
    let bit = tile % 32;

    arr = [0, 0, 0];
    arr[idx] = 1 << bit;
    return arr;
}

function select_tile(prev_arr, tile) {
    let idx = tile / 32;
    let bit = tile % 32;

    arr = prev_arr.copy();
    arr[idx] |= 1 << bit;
    return arr;
}

function unselect_tile(prev_arr, tile) {
    let idx = tile / 32;
    let bit = tile % 32;

    arr = prev_arr.copy();
    arr[idx] &= ~(1 << bit);
    return arr;
}

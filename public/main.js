
var socketio = io.connect();


// global var, whatever
let g_key_callback = () => {};
let g_keyup_callback = () => {};
let g_click_outside = () => {};


/*
 * min distance (in pixels) mouse must be drug from the position it was clicked to consider it a drag
 */
const MOUSE_DRAG_MIN_DIST = 5;

const hinted_color = "#9f9f9f";

const user_colors = [
    {
        color: "#195f7d",
        selected_color: "#6cdaff"
    },
    {
        color: "#7d1638",
        selected_color: "#ff6ca2"
    },
    {
        color: "#7d6a16",
        selected_color: "#ffe26c"
    },
    {
        color: "#247a48",
        selected_color: "#7cffa1"
    }
];

const highlight_all_col = "#b2b2b2";



function average_color(color_list) {
    const re = /#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/;
    let r = 0, g = 0, b = 0;
    color_list.forEach((color) => {
        let res = re.exec(color);
        r += parseInt(res[1], 16);
        g += parseInt(res[2], 16);
        b += parseInt(res[3], 16);
    });
    r = Math.floor(r / color_list.length);
    g = Math.floor(g / color_list.length);
    b = Math.floor(b / color_list.length);
    return "#" + r.toString(16).padStart(2, "0") +
                 g.toString(16).padStart(2, "0") +
                 b.toString(16).padStart(2, "0");
}



function Pencils(props) {
    const styles4 = [
        {top: 0, left: 0},
        {top: 0, right: 0},
        {bottom: 0, left: 0},
        {bottom: 0, right: 0}
    ];
    const styles6 = [
        {top: 0, left: 0},
        {top: 0, left: "50%", transform: "translateX(-50%)"},
        {top: 0, right: 0},
        {bottom: 0, left: 0},
        {bottom: 0, left: "50%", transform: "translateX(-50%)"},
        {bottom: 0, right: 0}
    ];
    const styles8 = [
        {top: 0, left: 0},
        {top: 0, left: "33.333%", transform: "translateX(-50%)"},
        {top: 0, left: "66.666%", transform: "translateX(-50%)"},
        {top: 0, right: 0},
        {bottom: 0, left: 0},
        {bottom: 0, left: "33.333%", transform: "translateX(-50%)"},
        {bottom: 0, left: "66.666%", transform: "translateX(-50%)"},
        {bottom: 0, right: 0}
    ];
    const styles9 = [
        {top: 0, left: 0},
        {top: 0, left: "25%", transform: "translateX(-50%)"},
        {top: 0, left: "50%", transform: "translateX(-50%)"},
        {top: 0, left: "75%", transform: "translateX(-50%)"},
        {top: 0, right: 0},
        {bottom: 0, left: 0},
        {bottom: 0, left: "33.333%", transform: "translateX(-50%)"},
        {bottom: 0, left: "66.666%", transform: "translateX(-50%)"},
        {bottom: 0, right: 0}
    ];

    let count = 0;
    for (let i = 0; i < 9; i++) {
        count += ((props.bits >> i) & 1);
    }

    let color_style = user_colors[props.color];

    let styles;
    if (count <= 4) {
        styles = styles4;
    }
    else if (count <= 6) {
        styles = styles6;
    }
    else if (count <= 8) {
        styles = styles8;
    }
    else {
        styles = styles9;
    }

    let lis = [];
    let n = 0;
    for (let i = 0; i < 9; i++) {
        if (((props.bits >> i) & 1) === 1) {
            lis.push(<span key={i} className="pencil" style={{...color_style, ...styles[n]}}>{i + 1}</span>);
            n++;
        }
    }
    return (<div className="pencils">
        {lis}
    </div>);
}

function Possibles(props) {
    let color_style = user_colors[props.color];

    let lis = [];
    for (let i = 0; i < 9; i++) {
        if (((props.bits >> i) & 1) === 1) {
            lis.push(<span key={i} className="possible" style={color_style}>{i + 1}</span>);
        }
    }
    return (<div className="possibles">
        {lis}
    </div>);
}


function Tile(props) {
    let state = props.gameState[props.idx];

    let val = state.val;
    let incorrect = (val < 0);
    val = Math.abs(val);

    let pencils = state.pencils;
    let possibles = state.possibles;
    let given = state.given;

    let selected = props.selected;
    let setSelected = props.setSelected;

    let empty = (val == 0) && (pencils == 0) && (possibles == 0);

    let sel_style = {};
    let cols = [];
    if (props.idx in selected) {
        // TODO iterate & average
        let col_idxs = selected[props.idx];
        col_idxs.forEach((idx) => {
            cols.push(user_colors[idx].selected_color);
        });
    }
    if (state.hinted) {
        cols.push(hinted_color);
    }
    if (cols.length > 0) {
        let col = average_color(cols);
        sel_style = {
            backgroundColor: col
        };
    }

    let color_style = {
        color: (given ? "#000000" : (incorrect ? "#afafaf"
                    : (state.user_color >= 0 ? user_colors[state.user_color].color : "#000000")))
    };

    if (props.highlight_all == val && !(props.idx in selected)) {
        sel_style = {
            backgroundColor: highlight_all_col
        };
    }

    React.useEffect(() => {
        window.addEventListener('mousemove', (event) => {
            if (document.getElementById(`tile_${props.idx}`).contains(event.target)) {
                props.drag.current(props.idx, event.pageX, event.pageY);
            }
        });
    }, []);

    return (
        <span id={`tile_${props.idx}`} className={`tile ${empty ? ' empty' : ''}`} style={sel_style} onMouseDown={() => {
                setSelected(props.idx);
            }}>
            <div className={`number_cell${empty ? '' : ' nonempty'}${given ? ' given' : (val !== 0 ? ' guess' : '')}`}>
                {val === 0 ? (pencils !== 0 ? (possibles !== 0 ?
                                <div><Pencils bits={pencils} color={state.user_color}/><Possibles bits={possibles}/></div>
                                : <Pencils bits={pencils} color={state.user_color}/>)
                        : (possibles !== 0 ? <Possibles bits={possibles} color={state.user_color}/>
                                : <div style={{display: 'none'}}/>))
                : <div style={color_style}>{val}</div>}
            </div>
        </span>);
}

function Box(props) {
    let idx_off = parseInt(props.idx_off);
    let sel = props.selected;
    return (<div className='box'>
        <div className='box-row'>
            <Tile val='0' state={props.state} idx={idx_off + 0} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
            <Tile val='0' state={props.state} idx={idx_off + 1} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
            <Tile val='0' state={props.state} idx={idx_off + 2} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
        </div>

        <div className='box-row'>
            <Tile val='0' state={props.state} idx={idx_off + 3} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
            <Tile val='0' state={props.state} idx={idx_off + 4} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
            <Tile val='0' state={props.state} idx={idx_off + 5} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
        </div>

        <div className='box-row'>
            <Tile val='0' state={props.state} idx={idx_off + 6} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
            <Tile val='0' state={props.state} idx={idx_off + 7} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
            <Tile val='0' state={props.state} idx={idx_off + 8} gameState={props.gameState} selected={sel} setSelected={props.setSelected} highlight_all={props.highlight_all} drag={props.drag} />
        </div>
    </div>);
}



function Sudoku(props) {
    let shiftHeld = React.useRef(false);
    let mouseHeld = React.useRef(false);
    let mouseClickPos = React.useRef(0);
    let mouseDragCb = React.useRef(() => {});

    let gameState = props.gameState;
    let setGameState = props.setGameState;

    let selected = props.selected;
    let setSelected = props.setSelected;

    let finished = props.finished;

    let selectTile = (idx) => {
        let selectedDup = dupArrayMap(selected);
        let is_in = (idx in selectedDup);
        let is_in_lis = false;
        if (is_in) {
            let user_colors = selectedDup[idx];
            is_in_lis = false;
            user_colors.forEach((user_color) => {
                is_in_lis = is_in_lis || (user_color === props.user_color);
            });
        }
        if (is_in_lis) {
            let new_lis = selectedDup[idx].filter((color) => color !== props.user_color);
            if (new_lis.length > 0) {
                selectedDup[idx] = new_lis;
            }
            else {
                delete selectedDup[idx];
            }
        }
        if (!shiftHeld.current) {
            deleteAllSelected(selectedDup, props.user_color);
        }
        if (!is_in_lis || (!shiftHeld.current && numSelected(selected, props.user_color) > 1)) {
            if (!(idx in selectedDup)) {
                selectedDup[idx] = [props.user_color];
            }
            else {
                selectedDup[idx].push(props.user_color);
            }
        }

        setSelected(selectedDup);
    };

    mouseDragCb.current = (idx, mx, my) => {
        if (!mouseHeld.current) {
            return;
        }
        if (mouseClickPos.current !== 0) {
            let [ox, oy] = mouseClickPos.current;
            let dx = (mx - ox);
            let dy = (my - oy);
            if ((dx * dx) + (dy * dy) <= MOUSE_DRAG_MIN_DIST * MOUSE_DRAG_MIN_DIST) {
                // less than the min distance away from the click position
                return;
            }
            else {
                mouseClickPos.current = 0;
            }
        }
        let is_in = (idx in selected);
        if (is_in) {
            let user_colors = selected[idx];
            let is_in_lis = false;
            user_colors.forEach((user_color) => {
                is_in_lis = is_in_lis || (user_color === props.user_color);
            });
            if (!is_in_lis) {
                let selectedDup = dupArrayMap(selected);
                // only add to the list if it wasn't already in there
                selectedDup[idx].push(props.user_color);
                setSelected(selectedDup);
            }
        }
        else {
            let selectedDup = dupArrayMap(selected);
            selectedDup[idx] = [props.user_color];
            setSelected(selectedDup);
        }

    };

    let new_key_cb = (e) => {
        let newState = copyGameState(gameState);

        if (e.key === "Shift") {
            shiftHeld.current = true;
        }

        if (finished) {
            return;
        }

        if (e.key === "Backspace") {
            for (const idx in selected) {
                let user_colors = selected[idx];
                if (user_colors == props.user_color && !newState[idx].given) {
                    newState[idx].val = 0;
                }
            }
            setGameState(newState);
            return;
        }

        let num = parseInt(e.key);
        if (Number.isNaN(num) || !Number.isInteger(num)) {
            return;
        }
        if (num < 1 || num > 9) {
            return;
        }

        let all_on;
        if (props.state === 0) {
            all_on = true;
            for (const idx in selected) {
                let user_colors = selected[idx];
                if (user_colors.includes(props.user_color) && !newState[idx].given) {
                    all_on = all_on && (newState[idx].val == num);
                }
            }
            if (all_on) {
                num = 0;
            }
            for (const idx in selected) {
                let user_colors = selected[idx];
                if (user_colors.includes(props.user_color)) {
                    newState[idx].val = num;
                    newState[idx].user_color = props.user_color;
                }
            }
            setGameState(newState);
        }
        else {
            switch (props.mode) {
                case 0:
                    all_on = true;
                    for (const idx in selected) {
                        let user_colors = selected[idx];
                        if (user_colors.includes(props.user_color) && !newState[idx].given) {
                            all_on = all_on && (newState[idx].val == num);
                        }
                    }
                    if (all_on) {
                        num = 0;
                    }
                    for (const idx in selected) {
                        let user_colors = selected[idx];
                        if (user_colors.includes(props.user_color) && !newState[idx].given) {
                            newState[idx].val = num;
                            newState[idx].user_color = props.user_color;
                        }
                    }
                    // check if any cells are hinted
                    newState.forEach((tile, idx) => {
                        tile.hinted = false;
                    });
                    break;
                case 1:
                    all_on = true;
                    for (const idx in selected) {
                        let user_colors = selected[idx];
                        if (user_colors.includes(props.user_color) && !newState[idx].given) {
                            all_on = all_on && ((newState[idx].pencils & (1 << (num - 1))) != 0);
                        }
                    }
                    for (const idx in selected) {
                        let user_colors = selected[idx];
                        if (user_colors.includes(props.user_color) && !newState[idx].given) {
                            if (all_on) {
                                newState[idx].pencils &= ~(1 << (num - 1));
                                newState[idx].user_color = props.user_color;
                            }
                            else {
                                newState[idx].pencils |= (1 << (num - 1));
                                newState[idx].user_color = props.user_color;
                            }
                        }
                    }
                    break;
                case 2:
                    all_on = true;
                    for (const idx in selected) {
                        let user_colors = selected[idx];
                        if (user_colors.includes(props.user_color) && !newState[idx].given) {
                            all_on = all_on && ((newState[idx].possibles & (1 << (num - 1))) != 0);
                        }
                    }
                    for (const idx in selected) {
                        let user_colors = selected[idx];
                        if (user_colors.includes(props.user_color) && !newState[idx].given) {
                            if (all_on) {
                                newState[idx].possibles &= ~(1 << (num - 1));
                                newState[idx].user_color = props.user_color;
                            }
                            else {
                                newState[idx].possibles |= (1 << (num - 1));
                                newState[idx].user_color = props.user_color;
                            }
                        }
                    }
                    break;
            }
            setGameState(newState);
        }
    };

    let new_keyup_cb = (e) => {

        if (e.key === "Shift") {
            shiftHeld.current = false;
        }
    };

    let click_outside = (e) => {
        mouseClickPos.current = [e.pageX, e.pageY];
        if (!document.getElementById('board').contains(e.target)){
            let selectedDup = {...selected};
            deleteAllSelected(selectedDup, props.user_color);
            setSelected(selectedDup);
        }
    }

    document.removeEventListener('keydown', g_key_callback);
    document.addEventListener('keydown', new_key_cb);
    g_key_callback = new_key_cb;

    document.removeEventListener('keyup', g_keyup_callback);
    document.addEventListener('keyup', new_keyup_cb);
    g_keyup_callback = new_keyup_cb;

    window.removeEventListener('mousedown', g_click_outside);
    window.addEventListener('mousedown', click_outside);
    g_click_outside = click_outside;


    React.useEffect(() => {
        window.addEventListener('mousedown', (event) => {
            mouseHeld.current = true;
        });

        window.addEventListener('mouseup', (event) => {
            mouseHeld.current = false;
        });
    }, []);

    // highlight clicked tiles
    let clicked_tile = -1;
    let highlight_all = -1;
    for (const idx in selected) {
        let ar = selected[idx];
        if (ar.includes(props.user_color) && clicked_tile !== -2) {
            clicked_tile = (clicked_tile === -1 ? idx : -2);
        }
    }

    if (clicked_tile >= 0 && gameState[clicked_tile].val != 0) {
        highlight_all = gameState[clicked_tile].val;
    }

    return (<div id='board' className='board'>
        <div className='board-row'>
            <Box state={props.state} idx_off={0}  gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
            <Box state={props.state} idx_off={9}  gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
            <Box state={props.state} idx_off={18} gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
        </div>

        <div className='board-row'>
            <Box state={props.state} idx_off={27} gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
            <Box state={props.state} idx_off={36} gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
            <Box state={props.state} idx_off={45} gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
        </div>

        <div className='board-row'>
            <Box state={props.state} idx_off={54} gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
            <Box state={props.state} idx_off={63} gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
            <Box state={props.state} idx_off={72} gameState={gameState} selected={selected} setSelected={selectTile} highlight_all={highlight_all} drag={mouseDragCb} />
        </div>
    </div>);
}




function Ctrl(props) {

    React.useEffect(() => {
        
        document.addEventListener('keydown', (e) => {
            if (e.key == 'a') {
                props.setMode(0);
            }
            else if (e.key == 's') {
                props.setMode(1);
            }
            else if (e.key == 'd') {
                props.setMode(2);
            }
        });

    }, []);

    if (props.state === 0) {
        return (<div className="ctrls">
            <div style={{visibility: 'hidden'}} className={`modeButton${props.mode == 0 ? ' selectedMode' : ''}`} onClick={() => props.setMode(0)}>guess</div>
            <div className={`modeButton selectedMode`}>enter</div>
            <div className={`modeButton`} onClick={() => props.beginGame()}>start</div>
        </div>);
    }
    else if (props.state === 1) {
        return (
            <div className="ctrls">
                <div className={`modeButton${props.mode == 0 ? ' selectedMode' : ''}`} onClick={() => props.setMode(0)}>guess</div>
                <div className={`modeButton${props.mode == 1 ? ' selectedMode' : ''}`} onClick={() => props.setMode(1)}>pencil</div>
                <div className={`modeButton${props.mode == 2 ? ' selectedMode' : ''}`} onClick={() => props.setMode(2)}>possible</div>
            </div>
        );
    }
}


function clearState(gameState, setGameState, setBoth, finished, resetFn) {
    let state;
    if (finished) {
        resetFn();
    }
    else if (!anyNonGivens(gameState)) {
        // set all givens back to non-givens
        state = copyGameState(gameState);
        for (let i = 0; i < state.length; i++) {
            let tileState = state[i];
            tileState.given = false;
        }
        setBoth(0, state);
    }
    else {
        state = copyGameState(gameState);
        for (let i = 0; i < state.length; i++) {
            let tileState = state[i];
            if (!(tileState.given)) {
                state[i] = initTile();
            }
        }
        setGameState(state);
    }
}


function ClearButton({ gameState, setGameState, state, setBoth, finished, resetFn }) {
    return (<div className="clearButton" onClick={() => {
        clearState(gameState, setGameState, setBoth, finished, resetFn);
    }}>
        {finished ? "reset" : ((anyNonGivens(gameState) || state == 0) ? "clear" : "re-enter")}
    </div>);
}


function CheckButton({ gameState }) {
    return (<div className="checkButton" onClick={() => {
        let res = checkState(gameState);
        if (res == NOT_DONE) {
            alert("Not done yet!");
            socketio.emit("verify_cells", {token: getToken()});
        }
        else if (res == NOT_RIGHT) {
            alert("Not quite right!");
            socketio.emit("verify_cells", {token: getToken()});
        }
        else {
            alert("Correct!");
        }
    }}>
        check
    </div>);
}

function HintButton() {
    return (<div className="hintButton" onClick={() => {
        socketio.emit("give_hint", { token: getToken() });
    }}>hint</div>);
}

function UndoButton() {
    return (<div className="undoButton" onClick={() => {
        socketio.emit("undo", { token: getToken() });
    }}>undo (n)</div>);
}

function RedoButton() {
    return (<div className="redoButton" onClick={() => {
        socketio.emit("redo", { token: getToken() });
    }}>redo (m)</div>);
}

function GameClock({ startTime, endTime, finished }) {
    let now = new Date().getTime();
    let [force, setForce] = React.useState(0);

    let style = {
        fontSize: "30px"
    };
    if (finished) {
        style.color = "green";
    }

    if (startTime === -1) {
        return (<div></div>);
    }
    else {
        let displayTime;
        if (endTime === -1) {
            displayTime = now - startTime;
        }
        else {
            displayTime = endTime - startTime;
        }
        let secs = Math.floor(displayTime / 1000);
        let mins = Math.floor(secs / 60);
        secs %= 60;
        let str = mins.toString() + ":" + secs.toString(10).padStart(2, "0");
        
        let remainder = 1000 - (displayTime % 1000);
        setTimeout(function() {
            // force update this component
            setForce(!force);
        }, remainder);
        return (<div style={style}>{str}</div>);
    }
}


function getToken() {
    if (window.localStorage.getItem("token") === null) {
        return "";
    }
    else {
        return window.localStorage.token;
    }
}


function Screen() {
    // game create/game play
    let [state, setState] = React.useState(0);
    // for game play, 0-2
    let [mode, setMode] = React.useState(0);

    let [gameState, setGameState] = React.useState(initGameState());

    let [selected, setSelected] = React.useState({});

    let [starttime, setStarttime] = React.useState(-1);
    let [endtime, setEndtime] = React.useState(-1);

    let user_color = React.useRef(-1);
    // to be set when a solution has been found
    let [finished, setFinished] = React.useState(false);

    React.useEffect(() => {
        socketio.on("login_response", (data) => {
            let user = data.user;
            user_color.current = user.color;
            window.localStorage.token = data.token;
        });
        socketio.on("update", (data) => {
            setGameState(data.gameState);
            setState(data.state);
            setSelected(data.selected);
            setStarttime(data.starttime);
            setEndtime(data.endtime);
            setFinished(data.finished);
        });
        socketio.on("fetch_response", (data) => {
            setGameState(data.gameState);
            setState(data.state);
            setSelected(data.selected);
            setStarttime(data.starttime);
            setEndtime(data.endtime);
            setFinished(data.finished);
        });
        socketio.on("no_solutions", () => {
            alert("warning: this puzzle appears to have no solutions");
        });
        socketio.on("multiple_solutions", () => {
            alert("warning: this puzzle appears to have multiple solutions");
        });

        let token = window.localStorage.getItem("token");
        if (token === null) {
            token = "";
        }
        socketio.emit("login", {
            token: token
        });
        // fetch current game state
        socketio.emit("fetch", {});

        document.addEventListener('keydown', (event) => {
            if (event.key == 'n') {
                socketio.emit("undo", { token: getToken() });
            }
            else if (event.key == 'm') {
                socketio.emit("redo", { token: getToken() });
            }
        });

    }, []);

    let changeGameState = (newState) => {
        setGameState(newState);
        socketio.emit("update", {
            old_state: gameState,
            new_state: newState,
            state: state,
            token: getToken()
        });
    };

    let setBoth = (newState, newGameState) => {
        setState(newState);
        setGameState(newGameState);
        socketio.emit("update", {
            old_state: gameState,
            new_state: newGameState,
            state: newState,
            token: getToken()
        });
    }

    let changeSelected = (selected_set) => {
        setSelected(selected_set);
        socketio.emit("update", {
            selected: selected_set,
            token: getToken()
        });
    }


    let beginGame = () => {
        let gsc = setGivens(gameState);
        setBoth(1, gsc);
    };

    let resetFn = () => {
        setState(0);
        setGameState(initGameState());
        socketio.emit("reset", {
            token: getToken()
        });
    }

    React.useEffect(() => {
        if (state == 0) {
            setMode(0);
        }
    }, [state]);

    return (<div>
        <div className="sudokuContainer">
            <Sudoku gameState={gameState} setGameState={changeGameState} state={state} mode={mode}
                    user_color={user_color.current} selected={selected} setSelected={changeSelected}
                    finished={finished} />
        </div>
        <ClearButton gameState={gameState} setGameState={changeGameState} state={state} setBoth={setBoth}
                    finished={finished} resetFn={resetFn}/>
        <CheckButton gameState={gameState}/>
        <HintButton />
        <UndoButton />
        <RedoButton />
        <GameClock startTime={starttime} endTime={endtime} finished={finished} />
        <Ctrl state={state} beginGame={beginGame} mode={mode} setMode={setMode}/>
    </div>);
}


document.addEventListener('keydown', g_key_callback);
ReactDOM.render(<Screen />, document.getElementById('main'));



var socketio = io.connect();


// global var, whatever
let g_key_callback = () => {};
let g_keyup_callback = () => {};
let g_click_outside = () => {};


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
            lis.push(<span key={i} className="pencil" style={styles[n]}>{i + 1}</span>);
            n++;
        }
    }
    return (<div className="pencils">
        {lis}
    </div>);
}

function Possibles(props) {
    let lis = [];
    for (let i = 0; i < 9; i++) {
        if (((props.bits >> i) & 1) === 1) {
            lis.push(<span key={i} className="possible">{i + 1}</span>);
        }
    }
    return (<div className="possibles">
        {lis}
    </div>);
}


function Tile(props) {
    let state = props.gameState[props.idx];
    let val = state.val;
    let pencils = state.pencils;
    let possibles = state.possibles;
    let given = state.given;

    /*
    let [val, setVal] = React.useState(parseInt(props.val));
    // true if this tile is a given digit (cannot modify it, is darker than the rest)
    let [given, setGiven] = React.useState(false);

    // use bitfields for the 9 numbers
    let [pencils, setPencils] = React.useState(0);
    let [possibles, setPossibles] = React.useState(0);*/

    let selected = props.selected;
    let setSelected = props.setSelected;

    let empty = (val == 0) && (pencils == 0) && (possibles == 0);

    // let newSetVal = (newVal) => {
    //     if (val == newVal) {
    //         setVal(0);
    //     }
    //     else {
    //         setVal(newVal);
    //     }
    // };
    // let setPenc = (val) => {
    //     setPencils(pencils ^ (1 << (val - 1)));
    // };
    // let setPoss = (val) => {
    //     setPossibles(possibles ^ (1 << (val - 1)));
    // };

    let isSelected = selected.has(props.idx);
    if (isSelected) {
        // if (props.state == 0) {
        //     props.setChangeCB(props.idx, () => {
        //         if (val != 0) {
        //             setGiven(true);
        //         }
        //     }, newSetVal, setPenc, setPoss);
        // }
        // else {
        //     if (given) {
        //         props.setChangeCB(props.idx, () => {}, () => {}, () => {}, () => {});
        //     }
        //     else {
        //         props.setChangeCB(props.idx, () => {}, newSetVal, setPenc, setPoss);
        //     }
        // }
    }

    return (
        <span className={`tile${isSelected ? ' selected' : ''}${empty ? ' empty' : ''}`} onClick={() => {
                setSelected(props.idx);
            }}>
            <div className={`number_cell${empty ? '' : ' nonempty'}${given ? ' given' : (val !== 0 ? ' guess' : '')}`}>
                {val === 0 ? (pencils !== 0 ? (possibles !== 0 ? <div><Pencils bits={pencils}/><Possibles bits={possibles}/></div> : <Pencils bits={pencils}/>)
                               : (possibles !== 0 ? <Possibles bits={possibles}/> : <div style={{display: 'none'}}/>))
                    : val}
            </div>
        </span>);
}

function Box(props) {
    let idx_off = parseInt(props.idx_off);
    let sel = props.selected;
    return (<div className='box'>
        <div className='box-row'>
            <Tile val='0' state={props.state} idx={idx_off + 0} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 1} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 2} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
        </div>

        <div className='box-row'>
            <Tile val='0' state={props.state} idx={idx_off + 3} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 4} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 5} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
        </div>

        <div className='box-row'>
            <Tile val='0' state={props.state} idx={idx_off + 6} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 7} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 8} gameState={props.gameState} selected={sel} setSelected={props.setSelected}></Tile>
        </div>
    </div>);
}

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

function Sudoku(props) {
    let selectedMap = React.useRef(new Set());
    let [garb, setGarb] = React.useState(0);
    let shiftHeld = React.useRef(false);

    let gameState = props.gameState;
    let setGameState = props.setGameState;

    let selected = selectedMap.current;

    let selectTile = (idx) => {
        if (!(idx in selected)) {
            if (!shiftHeld.current) {
                selected.clear();
            }
            selected.add(idx);
            // force update
            setGarb(!garb);
        }
    };

    let new_key_cb = (e) => {
        let newState = copyGameState(gameState);

        if (e.key === "Backspace") {
            selected.forEach((idx) => {
                if (!newState[idx].given) {
                    newState[idx].val = 0;
                }
            });
            setGameState(newState);
            return;
        }
        if (e.key === "Shift") {
            shiftHeld.current = true;
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
            selected.forEach((idx) => {
                if (!newState[idx].given) {
                    all_on = all_on && (newState[idx].val == num);
                }
            });
            if (all_on) {
                num = 0;
            }
            selected.forEach((idx) => {
                newState[idx].val = num;
            });
            setGameState(newState);
        }
        else {
            switch (props.mode) {
                case 0:
                    all_on = true;
                    selected.forEach((idx) => {
                        if (!newState[idx].given) {
                            all_on = all_on && (newState[idx].val == num);
                        }
                    });
                    if (all_on) {
                        num = 0;
                    }
                    selected.forEach((idx) => {
                        if (!newState[idx].given) {
                            newState[idx].val = num;
                        }
                    });
                    break;
                case 1:
                    all_on = true;
                    selected.forEach((idx) => {
                        if (!newState[idx].given) {
                            all_on = all_on && ((newState[idx].pencils & (1 << (num - 1))) != 0);
                        }
                    });
                    selected.forEach((idx) => {
                        if (!newState[idx].given) {
                            if (all_on) {
                                newState[idx].pencils &= ~(1 << (num - 1));
                            }
                            else {
                                newState[idx].pencils |= (1 << (num - 1));
                            }
                        }
                    });
                    break;
                case 2:
                    all_on = true;
                    selected.forEach((idx) => {
                        if (!newState[idx].given) {
                            all_on = all_on && ((newState[idx].possibles & (1 << (num - 1))) != 0);
                        }
                    });
                    selected.forEach((idx) => {
                        if (!newState[idx].given) {
                            if (all_on) {
                                newState[idx].possibles &= ~(1 << (num - 1));
                            }
                            else {
                                newState[idx].possibles |= (1 << (num - 1));
                            }
                        }
                    });
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
        if (!document.getElementById('board').contains(e.target)){
            selected.clear();
            // force update
            setGarb(!garb);
        }
    }

    document.removeEventListener('keydown', g_key_callback);
    document.addEventListener('keydown', new_key_cb);
    g_key_callback = new_key_cb;

    document.removeEventListener('keyup', g_keyup_callback);
    document.addEventListener('keyup', new_keyup_cb);
    g_keyup_callback = new_keyup_cb;

    window.removeEventListener('click', g_click_outside);
    window.addEventListener('click', click_outside);
    g_click_outside = click_outside;

    return (<div id='board' className='board'>
        <div className='board-row'>
            <Box state={props.state} idx_off={0}  gameState={gameState} selected={selected} setSelected={selectTile} />
            <Box state={props.state} idx_off={9}  gameState={gameState} selected={selected} setSelected={selectTile} />
            <Box state={props.state} idx_off={18} gameState={gameState} selected={selected} setSelected={selectTile} />
        </div>

        <div className='board-row'>
            <Box state={props.state} idx_off={27} gameState={gameState} selected={selected} setSelected={selectTile} />
            <Box state={props.state} idx_off={36} gameState={gameState} selected={selected} setSelected={selectTile} />
            <Box state={props.state} idx_off={45} gameState={gameState} selected={selected} setSelected={selectTile} />
        </div>

        <div className='board-row'>
            <Box state={props.state} idx_off={54} gameState={gameState} selected={selected} setSelected={selectTile} />
            <Box state={props.state} idx_off={63} gameState={gameState} selected={selected} setSelected={selectTile} />
            <Box state={props.state} idx_off={72} gameState={gameState} selected={selected} setSelected={selectTile} />
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


function clearState(gameState, setGameState, setBoth) {
    let state;
    if (!anyNonGivens(gameState)) {
        state = initGameState();
        setBoth(0, state);
    }
    else {
        state = copyGameState(gameState);
        for (let i = 0; i < state.length; i++) {
            let tileState = state[i];
            if (!(tileState.given)) {
                tileState.val = 0;
                tileState.pencils = 0;
                tileState.possibles = 0;
                state[i] = tileState;
            }
        }
        setGameState(state);
    }
}


function ClearButton({ gameState, setGameState, state, setBoth }) {
    return (<div className="clearButton" onClick={() => {
        clearState(gameState, setGameState, setBoth);
    }}>
        {(anyNonGivens(gameState) && state == 1) ? "clear" : "reset"}
    </div>);
}

const NOT_DONE = 1;
const NOT_RIGHT = 2;
const RIGHT = 3;

function idx(r, c) {
    let b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    let i = (r % 3) * 3 + (c % 3);
    return b * 9 + i;
}

function checkState(gameState) {
    console.log(gameState);
    // check rows
    for (let r = 0; r < 9; r++) {
        let m = 0;
        for (let c = 0; c < 9; c++) {
            let val = gameState[idx(r, c)].val;
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
            let val = gameState[idx(r, c)].val;
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

            let val = gameState[idx(r, c)].val;
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


function CheckButton({ gameState }) {
    return (<div className="checkButton" onClick={() => {
        let res = checkState(gameState);
        if (res == NOT_DONE) {
            alert("Not done yet!");
        }
        else if (res == NOT_RIGHT) {
            alert("Not quite right!");
        }
        else {
            alert("Correct!");
        }
    }}>
        check
    </div>);
}


function setGivens(gameState) {
    let gsc = copyGameState(gameState);
    // go through setGivenList and make all tiles givens
    gsc.forEach((tileState) => {
        if (tileState.val != 0) {
            tileState.given = true;
        }
    });
    return gsc;
}


function Screen() {
    // game create/game play
    let [state, setState] = React.useState(0);
    // for game play, 0-2
    let [mode, setMode] = React.useState(0);

    let [gameState, setGameState] = React.useState(initGameState());

    let userId = React.useRef(-1);

    React.useEffect(() => {
        socketio.on("login_response", (data) => {
            let user = data.user;
            userId.current = user.id;
            window.localStorage.token = data.token;
        });
        socketio.on("update", (data) => {
            setGameState(data.gameState);
            setState(data.state);
            console.log(data.gameState);
        });
        socketio.on("fetch_response", (data) => {
            setGameState(data.gameState);
            setState(data.state);
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
    }, []);

    let changeGameState = (newState) => {
        setGameState(newState);
        let token;
        if (window.localStorage.getItem("token") === null) {
            token = "";
        }
        else {
            token = window.localStorage.token;
        }
        socketio.emit("update", {
            old_state: gameState,
            new_state: newState,
            state: state,
            token: token
        });
    };

    let setBoth = (newState, newGameState) => {
        setState(newState);
        setGameState(newGameState);
        let token;
        if (window.localStorage.getItem("token") === null) {
            token = "";
        }
        else {
            token = window.localStorage.token;
        }
        socketio.emit("update", {
            old_state: gameState,
            new_state: newGameState,
            state: newState,
            token: token
        });
    }


    let beginGame = () => {
        let gsc = setGivens(gameState);
        setBoth(1, gsc);
    };

    React.useEffect(() => {
        if (state == 0) {
            setMode(0);
        }
    }, [state]);

    return (<div>
        <div className="sudokuContainer">
            <Sudoku gameState={gameState} setGameState={changeGameState} state={state} mode={mode} />
        </div>
        <ClearButton gameState={gameState} setGameState={changeGameState} state={state} setBoth={setBoth}/>
        <CheckButton gameState={gameState}/>
        <Ctrl state={state} beginGame={beginGame} mode={mode} setMode={setMode}/>
    </div>);
}


document.addEventListener('keydown', g_key_callback);
ReactDOM.render(<Screen />, document.getElementById('main'));




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
    let [val, setVal] = React.useState(parseInt(props.val));
    // true if this tile is a given digit (cannot modify it, is darker than the rest)
    let [given, setGiven] = React.useState(false);

    // use bitfields for the 9 numbers
    let [pencils, setPencils] = React.useState(0);
    let [possibles, setPossibles] = React.useState(0);

    let selected = props.selected;
    let setSelected = props.setSelected;

    let empty = (val == 0) && (pencils == 0) && (possibles == 0);

    let newSetVal = (newVal) => {
        if (val == newVal) {
            setVal(0);
        }
        else {
            setVal(newVal);
        }
    };
    let setPenc = (val) => {
        setPencils(pencils ^ (1 << (val - 1)));
    };
    let setPoss = (val) => {
        setPossibles(possibles ^ (1 << (val - 1)));
    };

    let isSelected = selected.has(props.idx);
    if (isSelected) {
        if (props.state == 0) {
            props.setChangeCB(props.idx, () => {
                if (val != 0) {
                    setGiven(true);
                }
            }, newSetVal, setPenc, setPoss);
        }
        else {
            if (given) {
                props.setChangeCB(props.idx, () => {}, () => {}, () => {}, () => {});
            }
            else {
                props.setChangeCB(props.idx, () => {}, newSetVal, setPenc, setPoss);
            }
        }
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
            <Tile val='0' state={props.state} idx={idx_off + 0} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 1} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 2} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
        </div>

        <div className='box-row'>
            <Tile val='0' state={props.state} idx={idx_off + 3} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 4} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 5} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
        </div>

        <div className='box-row'>
            <Tile val='0' state={props.state} idx={idx_off + 6} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 7} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' state={props.state} idx={idx_off + 8} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
        </div>
    </div>);
}

function Sudoku(props) {
    let selectedMap = React.useRef(new Set());
    let setVal = React.useRef([]);
    let setPencil = React.useRef([]);
    let setPossible = React.useRef([]);
    let [garb, setGarb] = React.useState(0);
    let setGivenList = React.useRef(new Map());
    let shiftHeld = React.useRef(false);

    let selected = selectedMap.current;

    let modCCB = (idx, setGivenFn, setValFn, setPencilFn, setPossibleFn) => {
        if (props.state == 0) {
            setGivenList.current.set(idx, setGivenFn);
        }
        if (shiftHeld.current) {
            setVal.current.push(setValFn);
            setPencil.current.push(setPencilFn);
            setPossible.current.push(setPossibleFn);
        }
        else {
            setVal.current = [setValFn];
            setPencil.current = [setPencilFn];
            setPossible.current = [setPossibleFn];
        }
    };

    React.useEffect(() => {
        if (props.state === 1) {
            // go through setGivenList and make all tiles givens
            setGivenList.current.forEach((setGiven, idx) => {
                setGiven();
            });
        }
    }, [props.state]);

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

        if (e.key === "Backspace") {
            setVal.current(0);
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
        if (props.state === 0) {
            setVal.current.forEach((fn) => fn(num));
        }
        else {
            switch (props.mode) {
                case 0:
                    setVal.current.forEach((fn) => fn(num));
                    break;
                case 1:
                    setPencil.current.forEach((fn) => fn(num));
                    break;
                case 2:
                    setPossible.current.forEach((fn) => fn(num));
                    break;
            }
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
            <Box state={props.state} idx_off={0}  selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box state={props.state} idx_off={9}  selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box state={props.state} idx_off={18} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
        </div>

        <div className='board-row'>
            <Box state={props.state} idx_off={27} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box state={props.state} idx_off={36} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box state={props.state} idx_off={45} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
        </div>

        <div className='board-row'>
            <Box state={props.state} idx_off={54} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box state={props.state} idx_off={63} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box state={props.state} idx_off={72} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
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


function ClearButton() {
    return (<div className="clearButton">
        clear
    </div>);
}


function Screen() {
    // game create/game play
    let [state, setState] = React.useState(0);
    // for game play, 0-2
    let [mode, setMode] = React.useState(0);

    let beginGame = () => {

        setState(1);
    };

    return (<div>
        <div className="sudokuContainer">
            <Sudoku state={state} mode={mode} />
        </div>
        <ClearButton />
        <Ctrl state={state} beginGame={beginGame} mode={mode} setMode={setMode}/>
    </div>);
}


document.addEventListener('keydown', g_key_callback);
ReactDOM.render(<Screen />, document.getElementById('main'));


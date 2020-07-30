

// global var, whatever
let g_key_callback = () => {};


function Pencils(props) {
    return (<div className="pencils">
        {props.bits}
    </div>);
}

function Possibles(props) {
    return (<div className="possibles">
        {props.bits}
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

    let setPenc = (val) => {
        console.log(pencils);
        setPencils(pencils ^ (1 << (val - 1)));
    };
    let setPoss = (val) => {
        console.log(possibles);
        setPossibles(possibles ^ (1 << (val - 1)));
    };

    let isSelected = selected.has(props.idx);
    if (isSelected) {
        props.setChangeCB(setVal, setPenc, setPoss);
    }

    return (
        <span className={`tile${isSelected ? ' selected' : ''}${empty ? ' empty' : ''}`} onClick={() => {
                setSelected(props.idx);
            }}>
            <div className={`number_cell${empty ? '' : ' nonempty'}${val !== 0 ? ' guess' : ''}`}>
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
            <Tile val='0' idx={idx_off + 0} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' idx={idx_off + 1} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' idx={idx_off + 2} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
        </div>

        <div className='box-row'>
            <Tile val='0' idx={idx_off + 3} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' idx={idx_off + 4} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' idx={idx_off + 5} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
        </div>

        <div className='box-row'>
            <Tile val='0' idx={idx_off + 6} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' idx={idx_off + 7} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' idx={idx_off + 8} selected={sel} setSelected={props.setSelected} setChangeCB={props.setChangeCB} ></Tile>
        </div>
    </div>);
}

function Sudoku(props) {
    let selectedMap = React.useRef(new Set());
    let setVal = React.useRef(() => {});
    let setPencil = React.useRef(() => {});
    let setPossible = React.useRef(() => {});
    let [garb, setGarb] = React.useState(0);

    let selected = selectedMap.current;

    let modCCB = (setValFn, setPencilFn, setPossibleFn) => {
        console.log('y');
        setVal.current = setValFn;
        setPencil.current = setPencilFn;
        setPossible.current = setPossibleFn;
    };

    let selectTile = (idx) => {
        if (!(idx in selected)) {
            selected.clear();
            selected.add(idx);
            // force update
            setGarb(!garb);
        }
    };

    let new_key_cb = (e) => {

        if (e.key === "Backspace") {
            setVal(0);
            return;
        }

        let num = parseInt(e.key);
        if (Number.isNaN(num) || !Number.isInteger(num)) {
            return;
        }
        if (num < 1 || num > 9) {
            return;
        }
        switch (props.mode) {
            case 0:
                setVal.current(num);
                break;
            case 1:
                setPencil.current(num);
                break;
            case 2:
                setPossible.current(num);
                break;
        }
    };

    document.removeEventListener('keydown', g_key_callback);
    document.addEventListener('keydown', new_key_cb);
    g_key_callback = new_key_cb;

    return (<div className='board'>
        <div className='board-row'>
            <Box idx_off={0}  selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box idx_off={9}  selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box idx_off={18} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
        </div>

        <div className='board-row'>
            <Box idx_off={27} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box idx_off={36} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box idx_off={45} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
        </div>

        <div className='board-row'>
            <Box idx_off={54} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box idx_off={63} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
            <Box idx_off={72} selected={selected} setSelected={selectTile} setChangeCB={modCCB} />
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

    return (
        <div className="ctrls">
            <div className={`modeButton${props.mode == 0 ? ' selectedMode' : ''}`} onClick={() => props.setMode(0)}>guess</div>
            <div className={`modeButton${props.mode == 1 ? ' selectedMode' : ''}`} onClick={() => props.setMode(1)}>pencil</div>
            <div className={`modeButton${props.mode == 2 ? ' selectedMode' : ''}`} onClick={() => props.setMode(2)}>possible</div>
        </div>
    );
}


function Screen() {
    let [mode, setMode] = React.useState(0);

    return (<div>
        <Sudoku mode={mode} />
        <Ctrl mode={mode} setMode={setMode}/>
    </div>);
}


document.addEventListener('keydown', g_key_callback);
ReactDOM.render(<Screen />, document.getElementById('main'));


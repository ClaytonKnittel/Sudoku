

function Tile(props) {
    let [selected, setSelected] = React.useState(false);
    let [val, setVal] = React.useState(parseInt(props.val));

    return (
        <span className={`tile${selected ? ' selected' : ''}${val == 0 ? ' empty' : ''}`} onClick={() => {
                props.changeCB();
                setSelected(true);
                props.setChangeCB(() => () => setSelected(false), setVal);
            }}>
            <div className={`number_cell ${val == 0 ? '' : 'nonempty guess'}`}>{val == 0 ? '' : val}</div>
        </span>);
}

function Box(props) {
    return (<div className='box'>
        <div className='box-row'>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
        </div>

        <div className='box-row'>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
        </div>

        <div className='box-row'>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='0' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
        </div>
    </div>);
}

function Sudoku() {
    let [changeCB, setChangeCB] = React.useState(() => () => {});
    let [modCCB, setModCCB] = React.useState(() => () => {});


    React.useEffect(() => {
        let setVal = () => {};

        setModCCB(() => (unselectFn, tileChangeCB) => {
            setChangeCB(unselectFn);
    
            setVal = tileChangeCB;
        });

        document.addEventListener('keydown', (e) => {

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
            setVal(num);
        });
    }, []);

    return (<div className='board'>
        <div className='board-row'>
            <Box changeCB={changeCB} setChangeCB={modCCB} />
            <Box changeCB={changeCB} setChangeCB={modCCB} />
            <Box changeCB={changeCB} setChangeCB={modCCB} />
        </div>

        <div className='board-row'>
            <Box changeCB={changeCB} setChangeCB={modCCB} />
            <Box changeCB={changeCB} setChangeCB={modCCB} />
            <Box changeCB={changeCB} setChangeCB={modCCB} />
        </div>

        <div className='board-row'>
            <Box changeCB={changeCB} setChangeCB={modCCB} />
            <Box changeCB={changeCB} setChangeCB={modCCB} />
            <Box changeCB={changeCB} setChangeCB={modCCB} />
        </div>
    </div>);
}

ReactDOM.render(<Sudoku />, document.getElementById('main'));


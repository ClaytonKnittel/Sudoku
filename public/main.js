

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
            <Tile val='1' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='2' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='3' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
        </div>

        <div className='box-row'>
            <Tile val='4' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='5' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='6' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
        </div>

        <div className='box-row'>
            <Tile val='7' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='8' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
            <Tile val='9' changeCB={props.changeCB} setChangeCB={props.setChangeCB} ></Tile>
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
            if (e.key === "1") {
                console.log('to 1');
                setVal(1);
            }
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


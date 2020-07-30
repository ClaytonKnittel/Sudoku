

function Test() {
    const [username, setUsername] = React.useState('test');

    return (<div>{username}</div>);
}

ReactDOM.render(<Test />, document.getElementById('main'));

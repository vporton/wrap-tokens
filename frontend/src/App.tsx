import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Manage Smart Crypto Funds</h1>
        <p>ERC-20 token address: <Address/></p>
        <p>ERC-1155 locker contract address: <Uint256/></p>
        <p>
          Amount: <Amount/>
          <input type="button" value="Swap ERC-1155 to ERC-20"/>
          <input type="button" value="Swap ERC-20 to ERC-1155"/>
        </p>
      </header>
    </div>
  );
}

function Address() {
  return (
    <span className="Address">
      <input type="text" maxLength={42} size={50}/>
    </span>
  )
}

function Uint256() {
  return (
    <span className="Uint256">
      <input type="text" maxLength={78} size={92}/>
    </span>
  )
}

function Amount() {
  return (
    <span className="Amount">
      <input type="number"/>
    </span>
  )
}

export default App;

import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Manage Smart Crypto Funds</h1>
        <p>ERC-20 token address: <input type="text" maxLength={42} size={50}/></p>
        <p>ERC-1155 locker contract address: <input type="text" maxLength={78} size={92}/></p>
        <p>
          Amount: <input type="number"/>
          <input type="button" value="Swap ERC-1155 to ERC-20"/>
          <input type="button" value="Swap ERC-20 to ERC-1155"/>
        </p>
      </header>
    </div>
  );
}

export default App;

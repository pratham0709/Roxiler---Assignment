// src/App.js

import React from 'react';
import TransactionTable from './components/TransactionTable';
import './index.css';
import Footer from './components/Footer';

function App() {
  return (
    <div >
      <div className="bg-richblack-900">
        <TransactionTable />
      </div>
    </div>
  );
}

export default App;

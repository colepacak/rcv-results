import React from 'react';
import ReactDOM from 'react-dom';

import Board from './components/Board.js';

var results = require('./test-results.json');

export default ReactDOM.render((
  <Board
    candidates={results.candidates}
    rounds={results.rounds}
    currentRound={0}
  />
), document.getElementById('react-mount'));

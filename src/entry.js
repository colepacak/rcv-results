import React from 'react';
import ReactDOM from 'react-dom';

import Board from './components/Board/index.js';

var results = require('./test-results.json');

let participants = [
  { name: 'Larry' },
  { name: 'Curly' },
  { name: 'Moe' },
  { name: 'Shemp' }
];

export default ReactDOM.render((
  <Board
    candidates={results.candidates}
    rounds={results.rounds}
    participants={participants}
    currentRound={0}
    cellWidth={30}
  />
), document.getElementById('react-mount'));

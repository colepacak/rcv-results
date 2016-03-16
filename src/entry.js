import React from 'react';
import ReactDOM from 'react-dom';

import Board from './components/Board/index.js';

var results = require('./data/results-voteList2.json');

let participants = [
  { name: 'Larry', index: 0 },
  { name: 'Curly', index: 1 },
  { name: 'Moe', index: 2 },
  { name: 'Shemp', index: 3 }
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

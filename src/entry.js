import React from 'react';
import ReactDOM from 'react-dom';

import RCVResults from './components/RCVResults/index.js';

var results = require('./data/results-voteList5.json');

let participants = [
  { name: 'Larry', index: 0 },
  { name: 'Curly', index: 1 },
  { name: 'Moe', index: 2 },
  { name: 'Shemp', index: 3 }
];

export default ReactDOM.render((
  <RCVResults
    candidates={results.candidates}
    rounds={results.rounds}
    participants={participants}
    currentRound={0}
    cellWidth={30}
    transitionDuration={400}
  />
), document.getElementById('react-mount'));

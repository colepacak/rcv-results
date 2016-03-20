import React from 'react';
import classNames from 'classnames';
import { assign, inRange, pickBy, map, includes } from 'lodash';

import Row from './../Row/index.js';
import Participant from './../Participant/index.js';

export default class Board extends React.Component {

  static propTypes = {
    candidates: React.PropTypes.array,
    rounds: React.PropTypes.array,
    currentRound: React.PropTypes.number
  };

  state = {
    observers: {
      ArrangeInitialParticipants: []
    },
    direction: 'forward'
  };

  componentWillMount() {
    this.setState({ currentRound: this.props.currentRound });
  }

  componentDidMount() {
    let observers = assign({}, this.state.observers);
    observers.ArrangeInitialParticipants = this._getCompsByType('Row');
    this.setState({ observers: observers }, function() {
      this._arrangeInitialParticipants();
    });
  }

  _buildRows() {
    return this.props.candidates.map((c, i) => {
      return (
        <Row
          key={i}
          ref={'rcvRow' + i}
          index={i}
          name={c}
          rounds={this.props.rounds}
          currentRound={this.state.currentRound}
          direction={this.state.direction}
          numHeaderCells={3}
          cellWidth={this.props.cellWidth}
          getParticipant={this._getParticipantByIndex.bind(this)}
          getSiblings={this._getSiblingRows.bind(this, i)}
          transitionDuration={this.props.transitionDuration}
        />
      )
    });
  }

  _buildRoundButtons() {
    let previousClasses = classNames('waves-effect', 'waves-light', 'btn', { disabled: this.state.currentRound === 0 });
    let nextClasses = classNames('waves-effect', 'waves-light', 'btn', { disabled: this.state.currentRound === this.props.rounds.length - 1 });
    return (
      <div className="round-buttons row">
        <a className={previousClasses} onClick={this._changeRound.bind(this, -1, 'backward')}>-</a>
        <span>Current Round: {this.state.currentRound}</span>
        <a className={nextClasses} onClick={this._changeRound.bind(this, 1, 'forward')}>+</a>
      </div>
    )
  }

  _changeRound(increment, direction) {
    let currentRound = this.state.currentRound + increment;
    if (inRange(currentRound, 0, this.props.rounds.length)) {
      this.setState({
        currentRound: currentRound,
        direction: direction
      });
    }
  }

  _getSiblingRows(index) {
    return this._getCompsByType('Row').filter(r => r.props.index !== index);
  }

  _getParticipantByIndex(index) {
    return this._getCompsByType('Participant').find(p => p.props.index === index);
  }

  _getCompsByType(type) {
    let rowsObj = pickBy(this.refs, function(value, key) {
      return key.substring(0, (3 + type.length)) === 'rcv' + type;
    });
    return map(rowsObj, (value, key) => value);
  }

  _buildParticipants() {
    return this.props.participants.map((p, i) => {
      return (
        <Participant
          key={i}
          ref={'rcvParticipant' + i}
          index={p.index}
          name={p.name}
          posTop={i * this.props.cellWidth }
          posLeft={'auto'}
          transitionStepDuration={this.props.transitionDuration / 2}
        />
      )
    });
  }

  //_getActiveParticipants(currentRound, direction = 'forward') {
  //  let increment;
  //  if (direction === 'forward') {
  //    increment = -1;
  //  } else if (direction === 'backward') {
  //    increment = 1;
  //  } else {
  //    throw new Error('RcvResultsInvalidDirectionArg:Board._getActiveParticipants');
  //  }
  //
  //  let activeParticipants = [];
  //  if (currentRound === 0 && direction === 'forward') {
  //    activeParticipants = this._getCompsByType('Participant');
  //  } else {
  //    let previousLoser;
  //    let activeIndexes;
  //    if (direction === 'forward') {
  //      previousLoser = this.props.rounds[currentRound + increment].loser;
  //      activeIndexes = this.props.rounds[currentRound + increment].votes.find(v => v.name === previousLoser).count;
  //    } else {
  //      previousLoser = this.props.rounds[currentRound].loser;
  //      activeIndexes = this.props.rounds[currentRound].votes.find(v => v.name === previousLoser).count;
  //    }
  //    activeIndexes.forEach(a => {
  //      activeParticipants.push(this.refs['rcvParticipant' + a]);
  //    }, this);
  //  }
  //  return activeParticipants;
  //}

  _arrangeInitialParticipants() {
    let index = 0;
    recursiveRelease.call(this, index);

    function recursiveRelease() {
      let vote = this.props.rounds[this.props.currentRound].votes[index];

      let payload = {
        action: 'ArrangeInitialParticipants',
        name: vote.name,
        participants: vote.count
      };
      this._notifyObservers(payload);

      index++;
      if (index < this.props.rounds.length) {
        recursiveRelease.call(this, index);
      }
    }
  }

  _notifyObservers(payload) {
    this.state.observers[payload.action].forEach(r => {
      r['_on' + payload.action](payload);
    });
  }

  render() {
    let rows = this._buildRows();
    let roundButtons = this._buildRoundButtons();
    let participants = this._buildParticipants();
    return (
      <div>
        <h1>placeholder header</h1>
        <div className="rcv-results-container">
          <div className="row">
            <table className="row-container col s10">
              <tbody>
                {rows}
              </tbody>
            </table>

            <div className="participants">
              {participants}
            </div>

          </div>
          {roundButtons}
        </div>
      </div>
    )
  }
}

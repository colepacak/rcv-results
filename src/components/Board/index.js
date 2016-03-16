import React from 'react';
import classNames from 'classnames';
import { inRange, pickBy, map, includes } from 'lodash';

import Row from './../Row/index.js';
import Lane from './../Lane/index.js';
import Participant from './../Participant/index.js';

export default class Board extends React.Component {
  /**
   * - render board component
   * - board creates a row for each candidate
   * - row consists of an index and name
   * - the lane is off to the side
   *
   * STEP 1: check
   * - board notifies rows of current round
   * - each row responds and shows its participants indexes
   *
   * STEP 2:
   * -round 0 begins, filter out loser from previous round (not needed)
   *
   * - each row is registered as observer of lane
   * - when lane receives a list of particpants, it notifies the rows
   * - a row responds to lane after consulting its index for a round
   */

  static propTypes = {
    candidates: React.PropTypes.array,
    rounds: React.PropTypes.array,
    currentRound: React.PropTypes.number
  };

  state = {
    isReady: false,
    activeParticipants: []
  };

  componentWillMount() {
    this.setState({ currentRound: this.props.currentRound });
  }

  componentDidMount() {
    this.setState({
      isReady: true,
      activeParticipants: this._getActiveParticipants(this.props.currentRound, 'forward')
    });
  }

  _buildRows() {
    // give each row only the round info it needs
    return this.props.candidates.map((c, i) => {
      let rounds = this.props.rounds.map(r => {
        return r.votes.find(v => {
          return v.name === c;
        }).count;
      });

      return (
        <Row
          key={i}
          ref={'rcvRow' + i}
          index={i}
          name={c}
          rounds={rounds}
          currentRound={this.state.currentRound}
          numHeaderCells={3}
          cellWidth={this.props.cellWidth}
          getParticipantComps={this._getCompsByType.bind(this, 'Participant')}
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
        activeParticipants: this._getActiveParticipants(currentRound, direction)
      });
    }
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
        />
      )
    });
  }

  _getActiveParticipants(currentRound, direction = 'forward') {
    let increment;
    if (direction === 'forward') {
      increment = -1;
    } else if (direction === 'backward') {
      increment = 1;
    } else {
      throw new Error('RcvResultsInvalidDirectionArg:Board._getActiveParticipants');
    }

    let activeParticipants = [];
    if (currentRound === 0 && direction === 'forward') {
      activeParticipants = this._getCompsByType('Participant');
    } else {
      let previousLoser;
      let activeIndexes;
      if (direction === 'forward') {
        previousLoser = this.props.rounds[currentRound + increment].loser;
        activeIndexes = this.props.rounds[currentRound + increment].votes.find(v => v.name === previousLoser).count;
      } else {
        previousLoser = this.props.rounds[currentRound].loser;
        activeIndexes = this.props.rounds[currentRound].votes.find(v => v.name === previousLoser).count;
      }
      activeIndexes.forEach(a => {
        activeParticipants.push(this.refs['rcvParticipant' + a]);
      }, this);
    }
    return activeParticipants;
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

            <div className="col s2">
              <Lane
                ref="lane"
                currentRound={this.state.currentRound}
                numParticipants={this.props.participants.length}
                cellWidth={this.props.cellWidth}
                getRowComps={this._getCompsByType.bind(this, 'Row')}
                getParticipantComps={this._getCompsByType.bind(this, 'Participant')}
                boardIsReady={this.state.isReady}
                rounds={this.props.rounds}
                activeParticipants={this.state.activeParticipants}
              />
            </div>

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
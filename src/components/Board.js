import React from 'react';
import classNames from 'classnames';

import Row from './Row.js';

export default class Board extends React.Component {
  /**
   * - render board component
   * - board creates a row for each candidate
   * - row consists of an index and name
   * - the lane is off to the side
   *
   * STEP 1:
   * - board notifies rows of current round
   * - each row responds and shows its participants indexes
   *
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

  componentWillMount() {
    this.setState({ currentRound: this.props.currentRound })
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
          index={i}
          name={c}
          rounds={rounds}
          currentRound={this.state.currentRound}
        />
      )
    });
  }

  _buildRoundButtons() {
    let previousClasses = classNames('waves-effect', 'waves-light', 'btn', { disabled: this.state.currentRound === 0 });
    let nextClasses = classNames('waves-effect', 'waves-light', 'btn', { disabled: this.state.currentRound === this.props.rounds.length - 1 });
    return (
      <div className="round-buttons">
        <a className={previousClasses} onClick={this._changeRound.bind(this, -1)}>-</a>
        <span>Current Round: {this.state.currentRound}</span>
        <a className={nextClasses} onClick={this._changeRound.bind(this, 1)}>+</a>
      </div>
    )
  }

  _changeRound(increment) {
    this.setState({ currentRound: this.state.currentRound + increment })
  }

  render() {
    let rows = this._buildRows();
    let roundButtons = this._buildRoundButtons();
    return (
      <div>
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
        {roundButtons}
      </div>
    )
  }
}
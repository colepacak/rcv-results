import React from 'react';
import { includes, assign } from 'lodash';

import './../../styles/rcv-styles.scss';

export default class Row extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    name: React.PropTypes.string,
    rounds: React.PropTypes.array
  };

  state = { activeParticipants: [] };

  _getOpenSlotPos() {
    return {
      top: this.props.index * this.props.cellWidth,
      left: (this.props.cellWidth * this.props.numHeaderCells) + (this.props.cellWidth * this.state.activeParticipants.length)
    };
  }

  _claimParticipant(index) {
    if (includes(this.props.rounds[this.props.currentRound], index)) {
      let match = this.props.getParticipantComps().find(p => p.props.index === index);

      let openSlotPos = this._getOpenSlotPos();
      match.moveTo(openSlotPos);

      let activeParticipants = assign([], this.state.activeParticipants);
      activeParticipants.push(match);
      this.setState({ activeParticipants: activeParticipants });
    }
  }

  _releaseParticipant(index) {
    // Index in context of activeParticipants
    let matchIndex;
    let match = this.state.activeParticipants.find((a, i) => {
      matchIndex = i;
      return a.props.index === index
    });

    if (match) {
      let activeParticipants = assign([], this.state.activeParticipants);

      // Filter out participant that matches notification criteria
      let filteredParticipants = activeParticipants.filter(a => a.props.index !== match.props.index);
      this.setState({ activeParticipants: filteredParticipants });

      // Reposition participants to occupy newly opened space
      activeParticipants.forEach((a, i) => {
        if (i > matchIndex) {
          a.moveTo({ top: a.state.posTop, left: a.state.posLeft - this.props.cellWidth });
        }
      }, this);
    }
  }

  render() {
    let openSlotPos = this._getOpenSlotPos();
    return (
      <tr className="rcv-row">
        <td className="index">{this.props.index}</td>
        <td className="name">{this.props.name}</td>
        <td className="participant-indexes">
          {
            this.props.rounds[this.props.currentRound].map((participant, i) => {
              return (<span key={i}>{participant}</span>)
            })
          }
        </td>
        <td>{'top:' + openSlotPos.top + ', left: ' + openSlotPos.left}</td>
        <td className="loading-zone"></td>
      </tr>
    )
  }
}
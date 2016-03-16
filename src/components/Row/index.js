import React from 'react';
import { includes } from 'lodash';

import './../../styles/rcv-styles.scss';

export default class Row extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    name: React.PropTypes.string,
    rounds: React.PropTypes.array
  };

  state = { numParticipants: 0 };

  componentWillReceiveProps(nextProps) {
    //if (nextProps.loser === this.props.name) {
    //  this.setState({ numParticipants: 0 });
    //}
  }

  _getOpenSlotPos() {
    return {
      top: this.props.index * this.props.cellWidth,
      left: (this.props.cellWidth * this.props.numHeaderCells) + (this.props.cellWidth * this.state.numParticipants)
    };
  }

  _claimParticipant(index) {
    if (includes(this.props.rounds[this.props.currentRound], index)) {
      let match = this.props.getParticipantComps().find(p => p.props.index === index);

      let openSlotPos = this._getOpenSlotPos();
      match.moveTo(openSlotPos);
      this.setState({ numParticipants: this.state.numParticipants + 1 });
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
import React from 'react';
import { includes } from 'lodash';

import './../../styles/rcv-styles.scss';

export default class Row extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    name: React.PropTypes.string,
    rounds: React.PropTypes.array
  };

  state = {
    numParticipants: 0,
    openSlotPos: {
      top: 0,
      left: 0
    }
  };

  componentWillMount() {
    this.setState({ openSlotPos: this._getOpenSlotPos() });
  }

  _getOpenSlotPos() {
    return {
      top: this.props.index * this.props.cellWidth,
      left: this.props.cellWidth * this.props.numHeaderCells + this.state.numParticipants
    };
  }

  _claimParticipant(index) {
    if (includes(this.props.rounds[this.props.currentRound], index)) {
      let match = this.props.getParticipantComps().find(p => p.props.index === index);

      // move to open slot
      // update open slot
      //debugger;
      match.moveTo(this.state.openSlotPos);
    }
  }

  render() {
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
        <td>{'top:' + this.state.openSlotPos.top + ', left: ' + this.state.openSlotPos.left}</td>
        <td className="loading-zone"></td>
      </tr>
    )
  }
}
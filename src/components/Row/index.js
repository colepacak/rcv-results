import React from 'react';
import { includes, assign } from 'lodash';

import './../../styles/rcv-styles.scss';

export default class Row extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    name: React.PropTypes.string,
    rounds: React.PropTypes.array
  };

  state = {
    activeParticipants: [],
    observers: {
      ReleaseParticipant: []
    }
  };

  componentWillMount() {
    this.setState({ currentRound: this.props.currentRound });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.currentRound !== nextProps.currentRound) {
      this.setState({ currentRound: nextProps.currentRound }, function() {
        this._releaseParticipants();
      });
    }
  }
  
  _onArrangeInitialParticipants(payload) {
    if (
      this.props.name !== payload.name ||
      !payload.participants.length
    ) {
      return;
    }

    let index = 0;
    recursiveClaimParticipant.call(this, index);

    function recursiveClaimParticipant(index) {
      let p = payload.participants[index];
      let match = this.props.getParticipant(p);

      let openSlotPos = this._getOpenSlotPos();
      match.initialMove(openSlotPos);

      let activeParticipants = assign([], this.state.activeParticipants);
      activeParticipants.push(match);
      this.setState({ activeParticipants: activeParticipants }, function() {
        index++;
        if (index < payload.participants.length) {
          recursiveClaimParticipant.call(this, index);
        }
      });
    }
  }

  _getOpenSlotPos() {
    return {
      top: this.props.index * this.props.cellWidth,
      left: (this.props.cellWidth * this.props.numHeaderCells) + (this.props.cellWidth * this.state.activeParticipants.length)
    };
  }

  _releaseParticipants() {
    let increment = 0;
    if (this.props.direction === 'forward') {
      increment = -1;
    }

    let previousLoser = this.props.rounds[this.state.currentRound + increment].loser;

    if (this.props.name === previousLoser) {
      // release participants to siblings via notification
      let index = 0;
      return recursiveRelease.call(this, index);
    }

    function recursiveRelease(index) {
      let participant = this.state.activeParticipants[index];
      let payload = {
        action: 'ReleaseParticipant',
        index: participant.props.index,
        participant: participant
      };
      return this._notifyObservers(payload)
        .then(this._delay.bind(this, this.props.transitionDuration))
        .then(() => {
          index ++;
          if (index < this.state.activeParticipants.length) {
            return recursiveRelease.call(this, index);
          }
        });

    }
  }

  _notifyObservers(payload) {
    return new Promise((resolve, reject) => {
      this.props.getSiblings().forEach(r => {
        r['_on' + payload.action](payload).then(function() {
          resolve();
        });
      });
    });
  }

  _onReleaseParticipant(payload) {
    return new Promise((resolve, reject) => {
      if (includes(this.props.rounds[this.state.currentRound].votes.find(v => v.name === this.props.name).count, payload.index)) {
        let openSlotPos = this._getOpenSlotPos();
        payload.participant.moveTo(openSlotPos);

        let activeParticipants = assign([], this.state.activeParticipants);
        activeParticipants.push(payload.participant);
        this.setState({ activeParticipants: activeParticipants }, function() {
          resolve();
        });
      }
    });
  }

  _delay(ms) {
    return new Promise((resolve, reject) => {
      let timer = setInterval(() => {
        clearInterval(timer);
        resolve();
      }, ms);
    });
  }

  render() {
    let openSlotPos = this._getOpenSlotPos();
    let participantIndexes = this.props.rounds[this.state.currentRound].votes.find(v => v.name === this.props.name).count;
    return (
      <tr className="rcv-row">
        <td className="index">{this.props.index}</td>
        <td className="name">{this.props.name}</td>
        <td className="participant-indexes">
          {
            participantIndexes.map((participant, i) => {
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
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
        this._arrangeParticipants(this.props.direction);
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

  _arrangeParticipants(direction) {
    if (direction === 'forward') {
      this._releaseParticipants();
    } else if (direction === 'backward') {
      this._requestParticipants();
    } else {
      throw new Error('RcvResultsInvalidDirectionArg:Row._arrangeParticipants');
    }
  }

  /*
   * Releasing participants
   */

  _releaseParticipants() {
    let previousLoser = this.props.rounds[this.state.currentRound - 1].loser;

    if (this.props.name === previousLoser) {
      // release participants to siblings via notification
      let index = this.state.activeParticipants.length - 1;
      return this._recursiveRelease.call(this, index);
    }
  }

  _recursiveRelease(index) {
    let participant = this.state.activeParticipants[index];
    let payload = {
      action: 'ReleaseParticipant',
      index: participant.props.index,
      participant: participant
    };
    return this._notifyObservers(payload)
      .then(this._removeActiveParticipant.bind(this, payload.index))
      .then(this._delay.bind(this, this.props.transitionDuration))
      .then(() => {
        index--;
        if (index >= 0) {
          return this._recursiveRelease.call(this, index);
        }
      });
  }

  /*
   * Requesting participants
   */

  _requestParticipants() {
    let currentLoser = this.props.rounds[this.state.currentRound].loser;
    if (this.props.name === currentLoser) {
      // request participants from siblings
      let neededParticipants = this.props.rounds[this.state.currentRound].votes.find(v => v.name === this.props.name).count
      // let index = neededParticipants.length - 1;
      let index = 0;
      this._recursiveRequest.call(this, neededParticipants, index)
    }
  }

  _recursiveRequest(arr, index) {
    let payload = {
      action: 'RequestParticipant',
      index: arr[index],
      destinationPos: this._getOpenSlotPos()
    };

    return this._notifyObservers(payload)
      .then(this._addActivePartipant.bind(this, payload.index))
      .then(this._delay.bind(this, this.props.transitionDuration))
      .then(() => {
        index++;
        // if (index >= 0) {
        if (index < arr.length) {
          return this._recursiveRequest.call(this, arr, index);
        }
      });
  }

  _getOpenSlotPos() {
    return {
      top: this.props.index * this.props.cellWidth,
      left: (this.props.cellWidth * this.props.numHeaderCells) + (this.props.cellWidth * this.state.activeParticipants.length)
    };
  }

  _addActivePartipant(index) {
    return new Promise((resolve, reject) => {
      let activeParticipants = assign([], this.state.activeParticipants);
      let newParticipant = this.props.getParticipant(index);
      activeParticipants.push(newParticipant);
      return this.setState({ activeParticipants: activeParticipants }, function() {
        resolve();
      });
    });
  }

  _removeActiveParticipant(index) {
    return new Promise((resolve, reject) => {
      let activeParticipants = assign([], this.state.activeParticipants);
      let filtered = activeParticipants.filter(a => a.props.index !== index);
      return this.setState({ activeParticipants: filtered }, function() {
        resolve();
      });
    });
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

  /*
   * Observer notification callbacks
   */

  _onRequestParticipant(payload) {
    return new Promise((resolve, reject) => {
      if (includes(this.props.rounds[this.state.currentRound + 1].votes.find(v => v.name === this.props.name).count, payload.index)) {
        // move the requested participant
        let participant = this.state.activeParticipants.find(a => a.props.index === payload.index);
        participant.moveBackward(payload.destinationPos);

        return this._removeActiveParticipant(payload.index).then(() => {
          resolve();
        });
      }
    });
  }


  _onReleaseParticipant(payload) {
    return new Promise((resolve, reject) => {
      if (includes(this.props.rounds[this.state.currentRound].votes.find(v => v.name === this.props.name).count, payload.index)) {
        let openSlotPos = this._getOpenSlotPos();
        payload.participant.moveForward(openSlotPos);

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

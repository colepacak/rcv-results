import React from 'react';
import { assign } from 'lodash';

import Participant from '../Participant';

export default class Lane extends React.Component {
  static propTypes = {
    numRows: React.PropTypes.number,
    currentRound: React.PropTypes.number
  };

  state = {
    observers: {
      releasingParticipant: []
    },
    activeParticipants: []
  };

  componentWillMount() {
    let observers = assign({}, this.state.observers);

    for (let i = 0; i < this.props.numRows; i++) {
      observers.releasingParticipant.push('rcvRow' + i);
    }

    let activeParticipants = this.props.currentRound === 0 ? this.props.participants : [];
    this.setState({
      observers: observers,
      activeParticipants: activeParticipants
    });
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      console.log('tick');
      clearInterval(this.timer);
    }, 5000)
  }

  _gatherParticipants() {
    // on round change, lane either:
    // #1 load all new participants when round 0
    // OR
    // #2 calls participants to itself who voted for previous round loser
    if (this.props.currentRound === 0) {
      return this.state.activeParticipants.map((p, i) => {
        return (
          <Participant
            key={i}
            index={i}
            name={p.name}
            posTop={i * this.props.cellWidth }
            posLeft={'auto'}
          />
        )
      });
    } else {
      console.log('woof');
    }
  }

  render() {
    let participants = this._gatherParticipants();
    return (
      <div className="lane" style={{height: this.props.cellWidth * this.props.participants.length}}>
        {participants}
      </div>
    )
  }
}

/**
 * on round change:
 * - gather participants
 * - foreach over participants and notify observers that one is being released, included index and ref
 */
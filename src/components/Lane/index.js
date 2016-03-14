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
    }
  };

  componentWillMount() {
    let observers = assign({}, this.state.observers);

    for (let i = 0; i < this.props.numRows; i++) {
      observers.releasingParticipant.push('rcvRow' + i);
    }
    this.setState({ observers: observers });
  }

  componentWillReceiveProps(nextProps) {
  }

  _buildParticipants() {
    if (this.props.currentRound === 0) {
      return this.props.participants.map((p, i) => {
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
    }
    // on round change, lane either:
    // #1 load all new participants when round 0
    // OR
    // #2 calls participants to itself who voted for previous round loser
  }

  render() {
    let participants = this._buildParticipants();
    return (
      <div className="lane" style={{height: this.props.cellWidth * this.props.participants.length}}>
        {participants}
      </div>
    )
  }
}
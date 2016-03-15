import React from 'react';
import { assign } from 'lodash';

export default class Lane extends React.Component {
  static propTypes = {
    //numRows: React.PropTypes.number,
    currentRound: React.PropTypes.number
  };

  state = {
    openSlotPos: {
      top: 0,
      left: 0
    },
    hasMounted: false
  };

  componentWillReceiveProps(nextProps) {
    if (
      this.state.hasMounted &&
      !this.props.boardIsReady &&
      nextProps.boardIsReady
    ) {
      this._arrangeParticipants();
    }
  }

  componentDidMount() {
    let pos = $('.lane', '.rcv-results-container').position();
    this.setState({
      hasMounted: true,
      openSlotPos: pos
    }, function() {
      this._arrangeParticipants();
    });
  }

  _arrangeParticipants() {
    if (this.props.currentRound === 0) {
      this._gatherParticipants()
        .then()
        .then(this._releaseParticipants.bind(this));
    } else {
      // gather, then release
      console.log('not round 0');
    }
  }

  /**
   * i think what will happen is that in round 1 the active particpants
   * will be all props.participants and on round two it will be the guys
   * coming from the loser
   */

  _gatherParticipants() {
    return new Promise((function(resolve, reject) {
      let participants = this.props.getParticipantComps();

      let index = 0;
      moveParticipant.call(this, index);

      function moveParticipant(index) {
        // Move participant to lane
        let participant = participants[index];
        participant.moveTo({
          top: this.state.openSlotPos.top,
          left: this.state.openSlotPos.left
        });

        // update open slot position
        let openSlotPos = assign({}, this.state.openSlotPos);
        openSlotPos.top = openSlotPos.top + this.props.cellWidth;
        this.setState({ openSlotPos: openSlotPos }, function() {
          index++;
          if (index < participants.length) {
            moveParticipant.call(this, index);
          } else {
            resolve();
          }
        });
      }
    }).bind(this));
  }

  _releaseParticipants() {
    // #2 calls participants to itself who voted for previous round loser
    this.props.activeParticipants.forEach(p => {
      let payload = {
        action: 'claimParticipant',
        index: p.props.index
      };
      this._notifyObservers(payload);
    }, this);
  }

  _notifyObservers(payload) {
    this.props.getRowComps().forEach(r => {
      r['_' + payload.action](payload.index);
    });
  }

  render() {
    return (
      <div className="lane" style={{height: this.props.cellWidth * this.props.numParticipants}}>
      </div>
    )
  }
}

/**
 * on round change:
 * - gather participants
 * - foreach over participants and notify observers that one is being released, included index and ref
 */
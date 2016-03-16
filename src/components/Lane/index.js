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
    activeParticipants: []
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ activeParticipants: nextProps.activeParticipants }, function() {
      this._arrangeParticipants();
    });
  }

  componentDidMount() {
    let pos = $('.lane', '.rcv-results-container').position();
    this.setState({ openSlotPos: pos });
  }

  _arrangeParticipants() {
    this._gatherParticipants()
      .then(this._delay.bind(this, 500))
      .then(this._releaseParticipants.bind(this));
  }

  _delay(ms) {
    return new Promise(function(resolve, reject) {
      let timer = setInterval((() => {
        clearInterval(timer);
        resolve();
      }).bind(this), ms);
    });

  }

  /**
   * i think what will happen is that in round 1 the active particpants
   * will be all props.participants and on round two it will be the guys
   * coming from the loser
   */

  _gatherParticipants() {
    return new Promise((function(resolve, reject) {
      // Only grab participant components that correspond with active participants
      //let participants = this.props.getParticipantComps();
      let participants = this.state.activeParticipants;

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
            let pos = $('.lane', '.rcv-results-container').position();
            this.setState({ openSlotPos: pos });
            resolve();
          }
        });
      }
    }).bind(this));
  }

  _releaseParticipants() {
    let index = 0;
    recursiveRelease.call(this, index);

    function recursiveRelease() {
      let p = this.state.activeParticipants[index];

      let payload = {
        action: 'claimParticipant',
        index: p.props.index
      };
      this._notifyObservers(payload);

      index++;
      if (index < this.state.activeParticipants.length) {
        this._delay(100).then(() => {
          recursiveRelease.call(this, index)
        });
      } else {
        /**
         * lane needs to manage it's own set so that it can remove them when done
         */
        this.setState({ activeParticipants: [] });
        //this.props.resetActiveParticipants();
      }
    }
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
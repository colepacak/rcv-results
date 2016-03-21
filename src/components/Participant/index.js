import React from 'react';

export default class Participant extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    name: React.PropTypes.string
  };

  state = {
    posTop: 'auto',
    posLeft: 'auto'
  };

  componentWillMount() {
    this.setState({
      posTop: this.props.posTop,
      posLeft: this.props.posLeft
    });
  }

  initialMove(pos) {
    this.setState({
      posTop: pos.top,
      posLeft: pos.left
    });
  }

  moveForward(pos) {
    return this._moveHorizontal.call(this, pos)
      .then(this._delay.bind(this, this.props.transitionStepDuration))
      .then(this._moveVertical.bind(this, pos));
  }

  moveBackward(pos) {
    return this._moveVertical.call(this, pos)
      .then(this._delay.bind(this, this.props.transitionStepDuration))
      .then(this._moveHorizontal.bind(this, pos));
  }

  _moveHorizontal(pos) {
    return new Promise((resolve, reject) => {
      this.setState({ posLeft: pos.left }, function() {
        resolve();
      });
    });
  }

  _moveVertical(pos) {
    return new Promise((resolve, reject) => {
      this.setState({ posTop: pos.top }, function() {
        resolve();
      });
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
    return (
      <div className="participant" style={{top: this.state.posTop, left: this.state.posLeft}}>
        {this.props.index}
      </div>
    )
  }
}

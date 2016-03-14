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

  moveTo(pos) {
    this.setState({
      posTop: pos.top,
      posLeft: pos.left
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
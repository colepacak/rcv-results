import React from 'react';

export default class Row extends React.Component {
  static propTypes = {
    index: React.PropTypes.number,
    name: React.PropTypes.string,
    rounds: React.PropTypes.array
  };

  render() {
    return (
      <tr>
        <td>{this.props.index}</td>
        <td>{this.props.name}</td>
        <td>
          {
            this.props.rounds[this.props.currentRound].map((participant, i) => {
              return (<span key={i}>{participant}</span>)
            })
          }
        </td>
      </tr>
    )
  }
}
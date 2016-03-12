if (!Date.now) {
  Date.now = function () {
    return new Date().getTime();
  };
}

var Blink = React.createClass({
  displayName: 'Blink',

  getInitialState: function () {
    return { visible: true };
  },
  getDefaultProps: function () {
    return { duration: 500 };
  },
  blink: function () {
    if (!this.isMounted()) return;
    this.setState({ visible: !this.state.visible });
    setTimeout(this.blink, this.props.duration);
  },
  componentDidMount: function () {
    this.blink();
  },
  render: function () {
    var visible = this.state.visible ? 'visible' : 'hidden';
    return React.createElement(
      'span',
      { style: { visibility: visible } },
      this.props.children
    );
  }
});

var Clock = React.createClass({
  displayName: 'Clock',

  getInitialState: function () {
    return {
      hour: '00',
      min: '00',
      suf: 'am'
    };
  },
  componentDidMount: function () {
    this.updateTime();
  },
  updateTime: function () {
    if (!this.isMounted()) return;
    var d = new Date();
    this.setState({
      hour: ('0' + d.getHours()).slice(-2),
      min: ('0' + d.getMinutes()).slice(-2)
    });
  },
  render: function () {
    return React.createElement(
      'h1',
      null,
      this.state.hour,
      React.createElement(
        Blink,
        null,
        ':'
      ),
      this.state.min
    );
  }
});

ReactDOM.render(React.createElement(Clock, null), document.getElementById('react-div'));
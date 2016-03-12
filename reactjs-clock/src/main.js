if (!Date.now) {
  Date.now = function() { return new Date().getTime() }
}

var Blink = React.createClass({
  getInitialState: function() {
    return {visible: true}
  },
  getDefaultProps: function() {
    return {duration: 500}
  },
  blink: function() {
    if (!this.isMounted()) return
    this.setState({visible: !this.state.visible})
    setTimeout(this.blink, this.props.duration)
  },
  componentDidMount: function() {
    this.blink()
  },
  render: function() {
    var visible = this.state.visible ? 'visible': 'hidden'
    return (
      <span style={{visibility: visible}}>
        {this.props.children}
      </span>
    )
  }
})

var Clock = React.createClass({
  getInitialState: function() {
    return {
      hour: '00',
      min: '00',
      suf: 'am'
    }
  },
  componentDidMount: function() {
    this.updateTime()
  },
  updateTime: function() {
    if (!this.isMounted()) return
    var d = new Date()
    this.setState({
      hour: ('0' + d.getHours()).slice(-2),
      min: ('0' + d.getMinutes()).slice(-2),
    })
  },
  render: function() {
    return (<h1>
      {this.state.hour}<Blink>:</Blink>{this.state.min}
    </h1>)
  }
})

ReactDOM.render(
  <Clock />,
  document.getElementById('react-div')
)

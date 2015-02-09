function GameEngine(args) {
  // can't call 'getContext' on a jquery canvas element,
  // so we have to get the real thing.
  this.canvas = args.canvas || document.getElementById('game');
  this.context = args.context || this.canvas.getContext('2d');
  this.listener = args.listener || $(document);
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.period = args.period || 1000 / 30;
  this.handler = args.handler;

  this.handler.keyup = this.handler.keyup || function(){};
  this.handler.keydown = this.handler.keydown || function(){};

  this.listener.keydown(this.keydown.bind(this));
  this.listener.keyup(this.keyup.bind(this));

  this.keys = {};
}

//-- Graphics

GameEngine.prototype.drawPolygon = function(args) {
  var context = this.context,
      points = args.points,
      fillStyle = args.fillStyle;

  if (fillStyle !== undefined)
    context.fillStyle = fillStyle;

  context.beginPath();

  context.moveTo(points[0][0], points[0][1]);
  for (var i = 1; i < points.length; i++)
    context.lineTo(points[i][0], points[i][1]);

  context.fill();
};

GameEngine.prototype.colorBackground = function(args) {
  var fillStyle = args.fillStyle || '#000000';

  this.drawPolygon({
      fillStyle: fillStyle,
      points: [
        [0, 0],
        [this.width, 0],
        [this.width, this.height],
        [0, this.height],]});
};

GameEngine.prototype.

//-- Input

GameEngine.KEY_W = 87;
GameEngine.KEY_A = 65;
GameEngine.KEY_S = 83;
GameEngine.KEY_D = 68;

GameEngine.prototype.keydown = function(event) {
  this.keys[event.which] = true;
  this.handler.keydown(event);
};

GameEngine.prototype.keyup = function(event) {
  delete this.keys[event.which];
  this.handler.keyup(event);
};

//-- Event loop

GameEngine.prototype.registerNextCycle = function() {
  setTimeout(function() {
    var now = new Date().getTime(),
        elapsedTime = (this.lastRenderTime === undefined) ?
            0 : (now - this.lastRenderTime);
    this.lastRenderTime = now;
    this.handler.render(this, elapsedTime);
    this.registerNextCycle();
  }.bind(this), this.period);
};

GameEngine.prototype.beginEventLoop = function() {
  this.registerNextCycle();
};

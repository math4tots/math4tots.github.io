$(document).ready(function() {
  var game = new GameEngine({handler: {
      x: 0,
      y: 0,
      render: function(game, elapsedTime) {

        // update the game state.
        if (game.keys[GameEngine.KEY_W])
          this.y -= 10;
        else if (game.keys[GameEngine.KEY_S])
          this.y += 10;

        // draw
        game.colorBackground({fillStyle: '#000000'});
        game.drawPolygon({
            points: [[this.x, this.y],
                     [this.x + 10, this.y],
                     [this.x, this.y + 10]],
            fillStyle: '#00FF00'
        });
      }
  }});
  game.beginEventLoop();
});

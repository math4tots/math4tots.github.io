var canvas = null, center_x, center_y, width, height

$(document).ready(function() {
    canvas = $("#game_canvas")
    
    width = canvas.width()
    height = canvas.width()
    center_x = width / 2
    center_y = height / 2
    
    console.log(canvas.width())
    
    canvas.drawRect({
        fillStyle : 'black',
        x : center_x, y : center_y,
        width : width,
        height : height
    })
    
    // canvas.drawArc({
    //     draggable: true,
    //     fillStyle: "blue",
    //     x: 100, y: 100,
    //     radius: 50
    // })
})

var canvas,
    Width, Height,
    centerX, centerY,
    period,
    update,
    spacePressed,
    copter,
    pentas,
    score

$(document).ready(function() {
    canvas = $('#game_canvas')
    
    Width = canvas.width()
    Height = canvas.height()
    centerX = Width / 2
    centerY = Height / 2
    
    period = 1000 / 60
    
    initializeLayers()
    
    initializeButtonCallbacks()
    
    spacePressed = false
    
    enterMenu()
    
    beginEventLoop()
})


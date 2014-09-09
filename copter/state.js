function enterMenu() {
    update = updateMenu
    helpText.visible = true
    copter.y = centerY
    canvas.removeLayerGroup('penta')
}

function enterGame() {
    update = updateGame
    helpText.visible = false
    score.text = 0
    pentas = []
}

function initializeButtonCallbacks() {
    $(document).keydown(onKeyDown)
    $(document).keyup(onKeyUp)
}

function onKeyDown(e) {
    // 
    // You may ask, "Why do we check for undefined here?"
    // The reason is that, when the player dies in the game,
    // it is highly likely that they may have been holding onto the
    // spacebar to move the copter up. However, this would cause 
    // the next game to start before the user had a chance to 
    // look at the score.
    // 
    // Using this trick of setting spacePressed as 'undefined'
    // (see function 'updateGame' in 'eventloop.js'), we force the player
    // to life the space key and press the space key again to start
    // a new game. This way, we lower the chance of unintentionally
    // starting the next game.
    //
    
    if (spacePressed !== undefined && e.keyCode === 32)
        spacePressed = true
}

function onKeyUp(e) {
    if (e.keyCode === 32)
        spacePressed = false
}

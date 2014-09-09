function updateMenu() {
    if (spacePressed)
        enterGame()
}

function updateGame() {
    var direction = spacePressed ? -1 : 1
    copter.y = Math.min(
        Height - copter.radius, Math.max(copter.radius,
            copter.y + direction * period * 0.55))
    
    if (Math.random() > 0.95)
        generatePenta()
    
    var new_pentas = []
    for (var i = 0; i < pentas.length; i++)
        if (updatePenta(pentas[i]))
            new_pentas.push(pentas[i])
        else
            canvas.removeLayer(pentas[i].name)
    
    pentas = new_pentas
    
    
    for (var i = 0; i < pentas.length; i++) {
        var p = pentas[i]
        var d = Math.sqrt(
            Math.pow(p.x - copter.x, 2) +
            Math.pow(p.y - copter.y, 2))
        
        if (d < 0.8 * (p.radius + copter.radius)) {
            // Why do we set spacePressed? See function onKeyDown
            spacePressed = undefined
            enterMenu()
            break
        }
    }
}

function updatePenta(penta) {
    penta.x += penta.dx
    penta.y += penta.dy
    penta.rotate = (penta.rotate + penta.dr) % 360
    
    return penta.x >= 0 &&
        penta.x < Width &&
        penta.y >= 0 &&
        penta.y < Height
}

function executeSingleCycle() {
    update()
    render()
}

function registerNextCycle() {
    setTimeout(function() {
        executeSingleCycle()
        registerNextCycle()
    }, period)
}

function beginEventLoop() {
    registerNextCycle()
}


function generatePenta() {
    var y = Math.random() * Height
    var dy = (Math.random() - 0.5) * 5
    
    var x = Width
    // sqrt makes it more likely that the penta moves
    // horizontally faster.
    var dx = - (Math.sqrt(Math.random() + 0.5) * 5)
    
    var r = Math.random() * 360
    var dr = (Math.random() - 0.5) * 5
    
    score.text = parseInt(score.text) + 1
    
    addPenta(x,y,r,dx,dy,dr)
}

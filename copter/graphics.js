function initializeLayers() {
    canvas.addLayer({
        name: 'background',
        type: 'rectangle',
        fillStyle: 'black',
        x: centerX, y: centerY,
        width: Width, height: Height
    })
    
    canvas.addLayer({
        name: 'copter',
        type: 'polygon',
        fillStyle: 'white',
        x: centerX * 0.65, y: centerY,
        radius: 30,
        rotate: 90,
        sides: 3,
    })
    
    canvas.addLayer({
        name: 'helpText',
        type: 'text',
        fillStyle: 'white',
        x: Width * (3/4),
        y: Height / 2,
        fontSize: 24,
        fontFamily: 'Courier',
        text: "Press 'Space'"
    })
    
    canvas.addLayer({
        name: 'score',
        type: 'text',
        fillStyle: 'white',
        x: centerX, y: 24, fontSize: 24,
        fontFamily: 'Courier',
        text: 0,
    })
    
    copter = canvas.getLayer('copter')
    helpText = canvas.getLayer('helpText')
    score = canvas.getLayer('score')
}

function addPenta(x, y, r, dx, dy, dr) {
    var name = 'penta' + (pentas.length + 1)
    
    canvas.addLayer({
        name: name,
        type: 'polygon',
        groups: ['penta'],
        fillStyle: 'white',
        x: x, y: y, rotate: r,
        radius: 30,
        sides: 5,
        
        dx: dx, dy: dy, dr: dr
    })
    
    pentas.push(canvas.getLayer(name))
}

function render() {
    canvas.drawLayers()
}



GPS.initialiseSerial()
basic.forever(function () {
    GPS.updatePosition()
    if (GPS.latitude() > 0) {
        basic.showNumber(GPS.latitude())
    }
})

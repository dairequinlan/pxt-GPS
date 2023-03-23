let bob = 0
basic.forever(function () {
    bob = GPS.anotherOne(bob)
    basic.showNumber(bob)
    basic.pause(100)
})

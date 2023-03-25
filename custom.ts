//% weight=100 color=#0fbc11 icon="\uf3c5"
namespace GPS {
    let _latitude = -1;
    let _longitude = -1;
    let _timestamp = -1;
    let _altitude = -1;
    let _HDOP = -1;
    /* Get Location will query the Serial port 
       and get lines until it gets one with a GNGGA 
       prefix. It will then split it, and parse the 
       location, timestamp, and HDOP into an 
       array and return them. Converts the h/m/s of 
       the timestamp into seconds. */

    //% block
    export function update_position() {
        _latitude = -1;
        _longitude = -1;
        _timestamp = -1;
        _altitude = -1;
        _HDOP = -1;
        //lets get 20 rows and then quit out if we don't find the GNGGA
        for (let i = 0; i < 20; i++) {
            let serialIn = serial.readUntil(serial.delimiters(Delimiters.CarriageReturn));
            let splot = serialIn.split(",");
            if (splot.length > 0 && splot[0].trim() == "$GNGGA") {
                //got ourselves a GNGGA here
                //sample GNGGA string is
                //$GNGGA, 212531.000, 5317.25962, N, 00614.98308, W, 1, 06, 2.9, 1.2, M, 0.0, M,,* 6B
                //described at the end of the file.
                if (splot[2].length > 0) { // looks like we're getting data
                    //Latitude is in ddmm.mmmmmmm format as per spec, Longitude is dddmm.mmmmmmm
                    //so we have to convert into degrees & fractions of a degree
                    _latitude = parseFloat(splot[2].slice(0, 2)) + (parseFloat(splot[2].slice(2)) / 60);
                    _longitude = parseFloat(splot[4].slice(0, 3)) + (parseFloat(splot[4].slice(3)) / 60);
                    //also also if that 5th element is W then the longitude is -longitude
                    //and if the 3rd element is S then ditto for latitude
                    if (splot[5] == "W") _longitude = -_longitude;
                    if (splot[3] == "S") _latitude = -_latitude;

                    //timestamp is HHMMSS and some always zero'd out millis
                    //so lets convert to a seconds timestamp. Problems at midnight but meh
                    _timestamp = (parseInt(splot[1].slice(0, 2)) * 60 * 60) +
                        (parseInt(splot[1].slice(2, 4)) * 60) +
                        (parseInt(splot[1].slice(4, 6)));
                    _HDOP = parseFloat(splot[8]);
                    _altitude = parseFloat(splot[9]);
                    break;
                }
            }
        }
    }

    //% block
    export function latitude(): number {
        return _latitude;
    }

    //% block
    export function longitude(): number {
        return _longitude;
    }

    //% block
    export function timestamp(): number {
        return _timestamp;
    }

    //% block
    export function altitude(): number {
        return _altitude;
    }

    //% block
    export function HDOP(): number {
        return _HDOP;
    }

    /* Quick bit of code to init the Serial port
       to use P0 and P1 and our 9600 GPS Module
       Baud rate */

    //% block
    export function initialiseSerial(): void {
        serial.redirect(
            SerialPin.P0,
            SerialPin.P1,
            BaudRate.BaudRate9600
        );
        serial.setRxBufferSize(128)
    }
}

/*
< 0 > $GNGGA
< 1 > UTC time, the format is hhmmss.sss
< 2 > Latitude, the format is ddmm.mmmmmmm
< 3 > Latitude hemisphere, N or S(north latitude or south latitude)
< 4 > Longitude, the format is dddmm.mmmmmmm
< 5 > Longitude hemisphere, E or W(east longitude or west longitude)
< 6 > GNSS positioning status: 0 not positioned, 1 single point positioning, 2 differential GPS fixed solution, 4 fixed solution, 5 floating point solution
< 7 > Number of satellites used
< 8 > HDOP level precision factor
< 9 > Altitude
< 10 > The height of the earth ellipsoid relative to the geoid
< 11 > Differential time
< 12 > Differential reference base station label
 * Statement end marker
xx XOR check value of all bytes starting from $ to *
< CR > Carriage return, end tag
< LF > line feed, end tag */
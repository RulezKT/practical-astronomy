/* Copyright 2016 Wayne D Grant (www.waynedgrant.com)
   Licensed under the MIT License */

function CoordinateSystems() {}

CoordinateSystems.prototype.decimalDegreesToDegreesMinutesSeconds = function(decimalDegrees) {

    var totalSeconds = decimalDegrees * 3600;
    var seconds = parseFloat(totalSeconds % 60).toFixed(3);

    if (seconds == 60) {
        seconds = 0;
        totalSeconds += 60;
    }

    var minutes = Math.floor(totalSeconds / 60) % 60;

    var degrees = Math.floor(totalSeconds / 3600);

    return new DegreesMinutesSeconds(degrees, minutes, seconds);
}

CoordinateSystems.prototype.degreesMinutesSecondsToDecimalDegrees = function(degreesMinutesSeconds) {

    return (((degreesMinutesSeconds.seconds / 60) + degreesMinutesSeconds.minutes) / 60) + degreesMinutesSeconds.degrees;
}

function DegreesMinutesSeconds(degrees, minutes, seconds) {

    this.degrees = degrees;
    this.minutes = minutes;
    this.seconds = seconds;
}

DegreesMinutesSeconds.prototype.toString = function() {

    var seconds = Math.floor(this.seconds);
    var milliseconds = zeroPad(Math.round((this.seconds % 1) * 1000), 3);

    return this.degrees + "° " + this.minutes + "' " + seconds + "." + milliseconds + "\"";
}

function zeroPad(number, size) {

    var padded = "" + number;

    while (padded.length < size) {
        padded = "0" + padded;
    }

    return padded;
}

/* Copyright 2016 Wayne D Grant (www.waynedgrant.com)
   Licensed under the MIT License */

function AstronomyError(message) {
    this.name = "AstronomyError";
    this.message = (message || "");
}

AstronomyError.prototype = Error.prototype;

function Astronomy() {}

/*
 * 01 - Calendars
 */

Astronomy.prototype.daysInMonth = function(year, month) {

    checkMonthInGregorianCalendar(year, month);

    var days = 31;

    switch(month) {
        case 2: {
            days = isLeapYear(year) ? 29 : 28;
            break;
        }
        case 4:  { days = 30; break; }
        case 6:  { days = 30; break; }
        case 9:  { days = 30; break; }
        case 11: { days = 30; break; }
    }

    return days;
}

/*
 * 02 - The date of Easter
 */

Astronomy.prototype.dateOfEaster = function(year) {

    checkYearInGregorianCalendar(year);

    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = ((19 * a) + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = ((32 + (2 * e) + (2 * i) - h - k) % 7);
    var m = Math.floor((a + (11 * h) + (22 * l)) / 451);

    var month = Math.floor((h + l - (7 * m) + 114) / 31);
    var day = ((h + l - (7 * m) + 114) % 31) + 1;

    return new CalendarDate(year, month, day);
};

/*
 * 03 - Converting the date to the day number
 */

Astronomy.prototype.dateToDayNumber = function(calendarDate) {

    checkDateInGregorianCalendar(calendarDate);

    var a;
    var b;
    var c
    var dayNumber;

    if (calendarDate.month > 2) {
        a = calendarDate.month + 1;
        b = Math.floor(a * 30.6);
        c = b - (isLeapYear(calendarDate.year) ? 62 : 63);
        dayNumber = c + calendarDate.day;
    } else {
        a = calendarDate.month - 1;
        b = a * (isLeapYear(calendarDate.year) ? 62 : 63);
        c = Math.floor(b / 2);
        dayNumber = c + calendarDate.day;
    }

    return dayNumber;
}

Astronomy.prototype.dateToDaysElapsedSinceEpoch = function(calendarDate) {

    checkDateInGregorianCalendar(calendarDate);

    var epochJD = this.dateToJulianDayNumber(new CalendarDate(2009, 12, 31));
    var dateJD = this.dateToJulianDayNumber(calendarDate);

    return dateJD - epochJD
}

/*
 * 04 - Julian dates
 */

Astronomy.prototype.dateToJulianDayNumber = function(calendarDate) {

    var y = calendarDate.year;
    var m = calendarDate.month;

    if (calendarDate.month <= 2) {
        y -= 1;
        m += 12;
    }

    var b = 0;

    if (dateInGregorianCalendar(calendarDate)) {
        var a = Math.floor(y / 100);
        var b = (2 - a + Math.floor(a / 4));
    }

    var c = 0;

    if (y < 0) {
        c = Math.floor((365.25 * y) - 0.75);
    } else {
        c = Math.floor(365.25 * y);
    }

    var d = Math.floor(30.6001 * (m + 1));

    return b + c + d + calendarDate.day + 1720994.5;
}

Astronomy.prototype.dateToModifiedJulianDayNumber = function(calendarDate) {

    return this.dateToJulianDayNumber(calendarDate) - 2400000.5;
}

/*
 * 05 - Converting the Julian date to the Greenwich calendar date
 */

Astronomy.prototype.julianDayNumberToDate = function(julianDayNumber) {

    if (julianDayNumber < 2299160.5) {
        throw new AstronomyError("julian day number must be in Gregorian Calendar, i.e. >= 2299160.5");
    }

    var i = Math.floor(julianDayNumber + 0.5);
    var f = (julianDayNumber + 0.5) - i;

    var a = Math.floor((i - 1867216.25) / 36524.25);
    var b = i + 1 + a - Math.floor(a / 4);
    var c = b + 1524;
    var d = Math.floor((c - 122.1) / 365.25);
    var e = Math.floor(365.25 * d);
    var g = Math.floor((c - e) / 30.6001);

    var day = c - e + f - Math.floor(30.6001 * g);

    var month;

    if (g < 14) {
        month = g - 1;
    }
    else {
        month = g - 13;
    }

    var year;

    if (month > 2) {
        year = d - 4716;
    }
    else {
        year = d - 4715;
    }

    return new CalendarDate(year, month, day);
}

/*
 * 06 - Finding the name of the day of the week
 */

Astronomy.prototype.dateToDayOfWeek = function(calendarDate) {

    checkDateInGregorianCalendar(calendarDate);

    return this.julianDayNumberToDayOfWeek(this.dateToJulianDayNumber(calendarDate));
}

Astronomy.prototype.julianDayNumberToDayOfWeek = function(julianDayNumber) {

    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    var a = (julianDayNumber + 1.5) / 7;
    var n = Math.round((a % 1) * 7);

    return daysOfWeek[n];
}

/*
 * 07 - Converting hours, minutes and seconds to decimal hours
 */

Astronomy.prototype.hoursMinutesSecondsToDecimalHours = function(timeOfDay) {

    var decimalHours =
        (((Math.abs(timeOfDay.seconds) / 60) + Math.abs(timeOfDay.minutes)) / 60) + Math.abs(timeOfDay.hours);

    if ((timeOfDay.hours < 0) || (timeOfDay.minutes < 0) || (timeOfDay.seconds < 0)) {
        decimalHours *= -1;
    }

    return decimalHours;
}

/*
 * 08 - Converting decimal hours to hours, minutes and seconds
 */

Astronomy.prototype.decimalHoursToHoursMinutesSeconds = function(decimalHours) {

    var totalSeconds = Math.abs(decimalHours) * 3600;
    var seconds = parseFloat(totalSeconds % 60).toFixed(3);

    if (seconds == 60) {
        seconds = 0;
        totalSeconds += 60;
    }

    var minutes = Math.floor(totalSeconds / 60) % 60;

    var hours = Math.floor(totalSeconds / 3600);

    if (decimalHours < 0) {
        hours *= -1;
    }

    return new TimeOfDay(hours, minutes, seconds);
}

/*
 * 09 - Converting the local time to Universal Time (UT)
 */

Astronomy.prototype.localTimeToUniversalTime = function(dateAndTime, zoneCorrection, daylightSaving) {

    var calendarDate = dateAndTime.calendarDate;
    var timeOfDay = dateAndTime.timeOfDay;

    var localDecimalTime = this.hoursMinutesSecondsToDecimalHours(timeOfDay);
    var universalDecimalTime = localDecimalTime - zoneCorrection - daylightSaving;
    var greenwichCalendarDay = (universalDecimalTime / 24) + calendarDate.day;
    var julianDayNumber = this.dateToJulianDayNumber(new CalendarDate(calendarDate.year, calendarDate.month, greenwichCalendarDay));
    var greenwichCalendarDate = this.julianDayNumberToDate(julianDayNumber);

    var year = greenwichCalendarDate.year;
    var month = greenwichCalendarDate.month;
    var decimalDay = greenwichCalendarDate.day;
    var day = Math.floor(decimalDay);

    var calendarDate = new CalendarDate(year, month, day);

    var decimalUniversalTime = (decimalDay - day) * 24;
    var timeOfDay = this.decimalHoursToHoursMinutesSeconds(decimalUniversalTime);

    return new DateAndTime(calendarDate, timeOfDay);
}

/*
 * 10 - Converting UT and Greenwich calendar date to local time and date
 */

Astronomy.prototype.universalTimeToLocalTime = function(dateAndTime, zoneCorrection, daylightSaving) {

    var calendarDate = dateAndTime.calendarDate;
    var timeOfDay = dateAndTime.timeOfDay;

    var universalDecimalTime = this.hoursMinutesSecondsToDecimalHours(timeOfDay);
    var localDecimalTime = universalDecimalTime + zoneCorrection + daylightSaving;
    var julianDayNumber = this.dateToJulianDayNumber(new CalendarDate(calendarDate.year, calendarDate.month, calendarDate.day)) + (localDecimalTime / 24);
    var greenwichCalendarDate = this.julianDayNumberToDate(julianDayNumber);

    var year = greenwichCalendarDate.year;
    var month = greenwichCalendarDate.month;
    var decimalDay = greenwichCalendarDate.day;
    var day = Math.floor(decimalDay);

    var calendarDate = new CalendarDate(year, month, day);

    var decimalUniversalTime = (decimalDay - day) * 24;
    var timeOfDay = this.decimalHoursToHoursMinutesSeconds(decimalUniversalTime);

    return new DateAndTime(calendarDate, timeOfDay);
}

/*
 * 12 - Conversion of UT to Greenwich sidereal time (GST)
 */

Astronomy.prototype.universalTimeToGreenwichSiderealTime = function(dateAndTime) {

    var julianDayNumber = this.dateToJulianDayNumber(dateAndTime.calendarDate);
    var s = julianDayNumber - 2451545;
    var t = s / 36525;
    var t0 = reduceValueToZeroToRange((6.697374558 + (2400.051336 * t) + (0.000025862 * t * t)), 24);
    var ut = this.hoursMinutesSecondsToDecimalHours(dateAndTime.timeOfDay);
    var a = ut * 1.002737909;
    var gst = reduceValueToZeroToRange((t0 + a), 24);

    return this.decimalHoursToHoursMinutesSeconds(gst);
}

/*
 * 13 - Conversion of GST to UT
 */

Astronomy.prototype.greenwichSiderealTimeToUniversalTime = function(dateAndTime) {

    var julianDayNumber = this.dateToJulianDayNumber(dateAndTime.calendarDate);
    var s = julianDayNumber - 2451545;
    var t = s / 36525;
    var t0 = reduceValueToZeroToRange((6.697374558 + (2400.051336 * t) + (0.000025862 * t * t)), 24);
    var gst = this.hoursMinutesSecondsToDecimalHours(dateAndTime.timeOfDay);
    var a = reduceValueToZeroToRange((gst - t0), 24);
    var ut = a * 0.9972695663;

    if (ut < 0.065574) { // There are two possible values for UT for the given GST values
        return [this.decimalHoursToHoursMinutesSeconds(ut), this.decimalHoursToHoursMinutesSeconds(ut + 23.934426)];
    } else {
        return this.decimalHoursToHoursMinutesSeconds(ut);
    }
}

/*
 * 14 - Local sidereal time (LST)
 */

Astronomy.prototype.greenwichSiderealTimeToLocalSiderealTime = function(timeOfDay, longitude) {

    var gst = this.hoursMinutesSecondsToDecimalHours(timeOfDay);
    var offset = this.decimalDegreesToDecimalHours(longitude);
    var lst = reduceValueToZeroToRange((gst + offset), 24);

    return this.decimalHoursToHoursMinutesSeconds(lst);
}

/*
 * 15 - Converting LST to GST
 */

Astronomy.prototype.localSiderealTimeToGreenwichSiderealTime = function(timeOfDay, longitude) {

    var lst = this.hoursMinutesSecondsToDecimalHours(timeOfDay);
    var offset = this.decimalDegreesToDecimalHours(longitude);
    var gst = reduceValueToZeroToRange((lst - offset), 24);

    return this.decimalHoursToHoursMinutesSeconds(gst);
}

/*
 * 21 - Converting between decimal degrees and degrees minutes and seconds
 */

Astronomy.prototype.decimalDegreesToDegreesMinutesSeconds = function(decimalDegrees) {

    var totalSeconds = Math.abs(decimalDegrees) * 3600;
    var seconds = parseFloat(totalSeconds % 60).toFixed(3);

    if (seconds == 60) {
        seconds = 0;
        totalSeconds += 60;
    }

    var minutes = Math.floor(totalSeconds / 60) % 60;

    var degrees = Math.floor(totalSeconds / 3600);

    if (decimalDegrees < 0) {
        degrees *= -1;
    }

    return new DegreesMinutesSeconds(degrees, minutes, seconds);
}

Astronomy.prototype.degreesMinutesSecondsToDecimalDegrees = function(degreesMinutesSeconds) {

    var decimalDegrees = (((Math.abs(degreesMinutesSeconds.seconds) / 60) + Math.abs(degreesMinutesSeconds.minutes)) / 60) + Math.abs(degreesMinutesSeconds.degrees);

    if ((degreesMinutesSeconds.degrees < 0) || (degreesMinutesSeconds.minutes < 0) || (degreesMinutesSeconds.seconds < 0)) {
        decimalDegrees *= -1;
    }

    return decimalDegrees;
}

/*
 * 22 - Converting between angles expressed in degrees and angles expressed in hours
 */

Astronomy.prototype.decimalHoursToDecimalDegrees = function(decimalHours) {

    return decimalHours * 15;
}

Astronomy.prototype.decimalDegreesToDecimalHours = function(decimalDegrees) {

    return decimalDegrees / 15;
}

Astronomy.prototype.hoursMinutesSecondsToDegreesMinutesSeconds = function(timeOfDay) {

    var decimalHours = this.hoursMinutesSecondsToDecimalHours(timeOfDay);
    var decimalDegrees = this.decimalHoursToDecimalDegrees(decimalHours);

    return this.decimalDegreesToDegreesMinutesSeconds(decimalDegrees);
}

Astronomy.prototype.degreesMinutesSecondsToHoursMinutesSeconds = function(degreesMinutesSeconds) {

    var decimalDegrees = this.degreesMinutesSecondsToDecimalDegrees(degreesMinutesSeconds);
    var decimalHours = this.decimalDegreesToDecimalHours(decimalDegrees);

    return this.decimalHoursToHoursMinutesSeconds(decimalHours);
}

/*
 * 24 - Converting between right ascension and hour angle
 */

Astronomy.prototype.rightAscensionToHourAngle = function(rightAscension, longitude, dateAndTime, zoneCorrection, daylightSaving) {

    var ut = this.localTimeToUniversalTime(dateAndTime, zoneCorrection, daylightSaving);
    var gst = this.universalTimeToGreenwichSiderealTime(ut);
    var lst = this.greenwichSiderealTimeToLocalSiderealTime(gst, longitude);

    var lstDecimalHours = this.hoursMinutesSecondsToDecimalHours(lst);

    var rightAscensionDecimalHours = this.hoursMinutesSecondsToDecimalHours(rightAscension);

    var hourAngleDecimalHours = lstDecimalHours - rightAscensionDecimalHours;

    if (hourAngleDecimalHours < 0) {
        hourAngleDecimalHours += 24;
    }

    return this.decimalHoursToHoursMinutesSeconds(hourAngleDecimalHours);
}

Astronomy.prototype.hourAngleToRightAscension = function(hourAngle, longitude, dateAndTime, zoneCorrection, daylightSaving) {

    var ut = this.localTimeToUniversalTime(dateAndTime, zoneCorrection, daylightSaving);
    var gst = this.universalTimeToGreenwichSiderealTime(ut);
    var lst = this.greenwichSiderealTimeToLocalSiderealTime(gst, longitude);

    var lstDecimalHours = this.hoursMinutesSecondsToDecimalHours(lst);

    var hourAngleDecimalHours = this.hoursMinutesSecondsToDecimalHours(hourAngle);

    var rightAscensionDecimalHours = lstDecimalHours - hourAngleDecimalHours;

    if (rightAscensionDecimalHours < 0) {
        rightAscensionDecimalHours += 24;
    }

    return this.decimalHoursToHoursMinutesSeconds(rightAscensionDecimalHours);
}

/*
 * 25 - Equatorial to horizon coordinate conversion
 */

Astronomy.prototype.hourAngleEquatorialToHorizonCoordinates = function(hourAngleEquatorialCoordinates, latitude) {

    var hourAngleDecimalHours = this.hoursMinutesSecondsToDecimalHours(hourAngleEquatorialCoordinates.hourAngle);
    var hourAngleDegrees = hourAngleDecimalHours * 15;
    var hourAngleRadians = degreesToRadians(hourAngleDegrees);

    var declinationDecimalDegrees = this.degreesMinutesSecondsToDecimalDegrees(hourAngleEquatorialCoordinates.declination);
    var declinationRadians = degreesToRadians(declinationDecimalDegrees);

    var latitudeRadians = degreesToRadians(latitude);

    var sinAltitude =
        Math.sin(declinationRadians) * Math.sin(latitudeRadians) +
        Math.cos(declinationRadians) * Math.cos(latitudeRadians) * Math.cos(hourAngleRadians);

    var altitudeRadians = Math.asin(sinAltitude);
    var altitudeDegrees = radiansToDegrees(altitudeRadians);

    var y = -Math.cos(declinationRadians) * Math.cos(latitudeRadians) * Math.sin(hourAngleRadians)
    var x = Math.sin(declinationRadians) - Math.sin(latitudeRadians) * sinAltitude;

    var azimuthRadians = Math.atan2(y, x);

    var azimuthDegrees = radiansToDegrees(azimuthRadians);
    azimuthDegrees = azimuthDegrees - (360 * Math.floor(azimuthDegrees / 360));

    return new HorizonCoordinates(
        this.decimalDegreesToDegreesMinutesSeconds(azimuthDegrees),
        this.decimalDegreesToDegreesMinutesSeconds(altitudeDegrees)
    );
}

/*
 * 26 - Horizon to equatorial coordinate conversion
 */

Astronomy.prototype.horizonToHourAngleEquatorialCoordinates = function(horizonCoordinates, latitude) {

    var azimuthDegrees = this.degreesMinutesSecondsToDecimalDegrees(horizonCoordinates.azimuth);
    var azimuthRadians = degreesToRadians(azimuthDegrees);

    var altitudeDegrees = this.degreesMinutesSecondsToDecimalDegrees(horizonCoordinates.altitude);
    var altitudeRadians = degreesToRadians(altitudeDegrees);

    var latitudeRadians = degreesToRadians(latitude);

    var sinDeclination =
        Math.sin(altitudeRadians) * Math.sin(latitudeRadians) +
        Math.cos(altitudeRadians) * Math.cos(latitudeRadians) * Math.cos(azimuthRadians);

    var declinationRadians = Math.asin(sinDeclination);
    var declinationDegrees = radiansToDegrees(declinationRadians);

    var y = -Math.cos(altitudeRadians) * Math.cos(latitudeRadians) * Math.sin(azimuthRadians);
    var x = Math.sin(altitudeRadians) - Math.sin(latitudeRadians) * sinDeclination;

    var hourAngleRadians = Math.atan2(y, x);

    var hourAngleDegrees = radiansToDegrees(hourAngleRadians);
    hourAngleDegrees = hourAngleDegrees - (360 * Math.floor(hourAngleDegrees / 360));

    var hourAngleDecimalHours = this.decimalDegreesToDecimalHours(hourAngleDegrees);

    return new HourAngleEquatorialCoordinates(
        this.decimalHoursToHoursMinutesSeconds(hourAngleDecimalHours),
        this.decimalDegreesToDegreesMinutesSeconds(declinationDegrees));
}

/*
 * 27 - Ecliptic to equatorial coordinate conversion
 */

Astronomy.prototype.meanObliquityOfTheEcliptic = function(calendarDate) {

    var dateJD = this.dateToJulianDayNumber(calendarDate);
    var epochJD = this.dateToJulianDayNumber(new CalendarDate(2000, 1, 1.5));
    var mJD = dateJD - epochJD;

    var T = (mJD / 36525);

    var deArcSecs = T * (46.815 + T * (0.0006 - (T * 0.00181)));
    var deDegrees = deArcSecs / 3600;

    var nutation = this.nutation(calendarDate)
    var nutationInObliquity = nutation.nutationInObliquity;

    var obliquity = 23.43929167 - deDegrees + nutationInObliquity;

    return obliquity;
}

Astronomy.prototype.eclipticToRightAscensionEquatorialCoordinates = function(eclipticCoordinates, calendarDate) {

    var eclipticLongitudeDegrees = this.degreesMinutesSecondsToDecimalDegrees(eclipticCoordinates.eclipticLongitude);
    var eclipticLongitudeRadians = degreesToRadians(eclipticLongitudeDegrees);

    var eclipticLatitudeDegrees = this.degreesMinutesSecondsToDecimalDegrees(eclipticCoordinates.eclipticLatitude);
    var eclipticLatitudeRadians = degreesToRadians(eclipticLatitudeDegrees);

    var obliquityDegrees = this.meanObliquityOfTheEcliptic(calendarDate);
    var obliquityRadians = degreesToRadians(obliquityDegrees);

    var sinDeclination =
        Math.sin(eclipticLatitudeRadians) * Math.cos(obliquityRadians) +
        Math.cos(eclipticLatitudeRadians) * Math.sin(obliquityRadians) * Math.sin(eclipticLongitudeRadians);

    var declinationRadians = Math.asin(sinDeclination);
    var declinationDegrees = radiansToDegrees(declinationRadians);

    var y = Math.sin(eclipticLongitudeRadians) * Math.cos(obliquityRadians) - Math.tan(eclipticLatitudeRadians) * Math.sin(obliquityRadians);
    var x = Math.cos(eclipticLongitudeRadians);

    var rightAscensionRadians = Math.atan2(y, x);

    var rightAscensionDegrees = radiansToDegrees(rightAscensionRadians);
    rightAscensionDegrees = rightAscensionDegrees - (360 * Math.floor(rightAscensionDegrees / 360));

    var rightAscensionDecimalHours = this.decimalDegreesToDecimalHours(rightAscensionDegrees);

    return new RightAscensionEquatorialCoordinates(
        this.decimalHoursToHoursMinutesSeconds(rightAscensionDecimalHours),
        this.decimalDegreesToDegreesMinutesSeconds(declinationDegrees));
}

/*
 * 28 - Equatorial to ecliptic coordinate conversion
 */

Astronomy.prototype.rightAscensionEquatorialToEclipticCoordinates = function(rightAscensionEquatorialCoordinates, calendarDate) {

    var rightAscensionDegrees = this.decimalHoursToDecimalDegrees(this.hoursMinutesSecondsToDecimalHours(rightAscensionEquatorialCoordinates.rightAscension));
    var rightAscensionRadians = degreesToRadians(rightAscensionDegrees);

    var declinationDegrees = this.degreesMinutesSecondsToDecimalDegrees(rightAscensionEquatorialCoordinates.declination);
    var declinationRadians = degreesToRadians(declinationDegrees);

    var obliquityDegrees = this.meanObliquityOfTheEcliptic(calendarDate);
    var obliquityRadians = degreesToRadians(obliquityDegrees);

    var sinEclipticLatitude =
        Math.sin(declinationRadians) * Math.cos(obliquityRadians) -
        Math.cos(declinationRadians) * Math.sin(obliquityRadians) * Math.sin(rightAscensionRadians);

    var eclipticLatitudeRadians = Math.asin(sinEclipticLatitude);
    var eclipticLatitudeDegrees = radiansToDegrees(eclipticLatitudeRadians);

    var y = Math.sin(rightAscensionRadians) * Math.cos(obliquityRadians) + Math.tan(declinationRadians) * Math.sin(obliquityRadians);
    var x = Math.cos(rightAscensionRadians);

    var eclipticLongitudeRadians = Math.atan2(y, x);

    var eclipticLongitudeDegrees = radiansToDegrees(eclipticLongitudeRadians);
    eclipticLongitudeDegrees = eclipticLongitudeDegrees - (360 * Math.floor(eclipticLongitudeDegrees / 360));

    return new EclipticCoordinates(
        this.decimalDegreesToDegreesMinutesSeconds(eclipticLongitudeDegrees),
        this.decimalDegreesToDegreesMinutesSeconds(eclipticLatitudeDegrees)
    )
}

/*
 * 29 - Equatorial to galactic coordinate conversion
 */

Astronomy.prototype.rightAscensionEquatorialToGalacticCoordinates = function(rightAscensionEquatorialCoordinates) {

    var rightAscensionDegrees = this.decimalHoursToDecimalDegrees(this.hoursMinutesSecondsToDecimalHours(rightAscensionEquatorialCoordinates.rightAscension));
    var rightAscensionRadians = degreesToRadians(rightAscensionDegrees);

    var declinationDegrees = this.degreesMinutesSecondsToDecimalDegrees(rightAscensionEquatorialCoordinates.declination);
    var declinationRadians = degreesToRadians(declinationDegrees);

    var sinGalacticLatitude =
        Math.cos(declinationRadians) * Math.cos(degreesToRadians(27.4)) * Math.cos(rightAscensionRadians - degreesToRadians(192.25)) +
        Math.sin(declinationRadians) * Math.sin(degreesToRadians(27.4));

    var galacticLatitudeRadians = Math.asin(sinGalacticLatitude);
    var galacticLatitudeDegrees = radiansToDegrees(galacticLatitudeRadians);

    var y = Math.sin(declinationRadians) - sinGalacticLatitude * Math.sin(degreesToRadians(27.4));
    var x = Math.cos(declinationRadians) * Math.sin(rightAscensionRadians - degreesToRadians(192.25)) * Math.cos(degreesToRadians(27.4));

    var galacticLongitudeDegrees = radiansToDegrees(Math.atan2(y, x)) + 33;
    galacticLongitudeDegrees = galacticLongitudeDegrees - (360 * Math.floor(galacticLongitudeDegrees / 360));

    return new GalacticCoordinates(
        this.decimalDegreesToDegreesMinutesSeconds(galacticLongitudeDegrees),
        this.decimalDegreesToDegreesMinutesSeconds(galacticLatitudeDegrees)
    );
}

/*
 * 30 - Galatic to equatorial coordinate conversion
 */

Astronomy.prototype.galacticToRightAscensionEquatorialCoordinates = function(galacticCoordinates) {

    var galacticLongitudeDegrees = this.degreesMinutesSecondsToDecimalDegrees(galacticCoordinates.galacticLongitude);
    var galacticLongitudeRadians = degreesToRadians(galacticLongitudeDegrees);

    var galacticLatitudeDegrees = this.degreesMinutesSecondsToDecimalDegrees(galacticCoordinates.galacticLatitude);
    var galacticLatitudeRadians = degreesToRadians(galacticLatitudeDegrees);

    var sinDeclination =
        Math.cos(galacticLatitudeRadians) * Math.cos(degreesToRadians(27.4)) * Math.sin(galacticLongitudeRadians - degreesToRadians(33)) +
        Math.sin(galacticLatitudeRadians) * Math.sin(degreesToRadians(27.4));

    var declinationRadians = Math.asin(sinDeclination);
    var declinationDegrees = radiansToDegrees(declinationRadians);

    var y = Math.cos(galacticLatitudeRadians) * Math.cos(galacticLongitudeRadians - degreesToRadians(33));
    var x = Math.sin(galacticLatitudeRadians) * Math.cos(degreesToRadians(27.4)) -
            Math.cos(galacticLatitudeRadians) * Math.sin(degreesToRadians(27.4)) * Math.sin(galacticLongitudeRadians - degreesToRadians(33));

    var rightAscensionDegrees = radiansToDegrees(Math.atan2(y, x)) + 192.25;
    rightAscensionDegrees = rightAscensionDegrees - (360 * Math.floor(rightAscensionDegrees / 360));

    var rightAscensionDecimalHours = this.decimalDegreesToDecimalHours(rightAscensionDegrees);

    return new RightAscensionEquatorialCoordinates(
        this.decimalHoursToHoursMinutesSeconds(rightAscensionDecimalHours),
        this.decimalDegreesToDegreesMinutesSeconds(declinationDegrees)
    );
}

/*
 * 31 - Generalised coordinate transformations
 */

Astronomy.prototype.hourAngleEquatorialToRightAscensionEquatorialCoordinates = function(hourAngleEquatorialCoordinates, longitude, dateAndTime, zoneCorrection, daylightSaving) {

    var hourAngle = hourAngleEquatorialCoordinates.hourAngle;
    var declination = hourAngleEquatorialCoordinates.declination;
    var rightAscension = this.hourAngleToRightAscension(hourAngle, longitude, dateAndTime, zoneCorrection, daylightSaving);

    return new RightAscensionEquatorialCoordinates(rightAscension, declination);
}

Astronomy.prototype.rightAscensionEquatorialToHourAngleEquatorialCoordinates = function(rightAscensionEquatorialCoordinates, longitude, dateAndTime, zoneCorrection, daylightSaving) {

    var rightAscension = rightAscensionEquatorialCoordinates.rightAscension;
    var declination = rightAscensionEquatorialCoordinates.declination;

    var hourAngle = this.rightAscensionToHourAngle(rightAscension, longitude, dateAndTime, zoneCorrection, daylightSaving);

    return new HourAngleEquatorialCoordinates(hourAngle, declination);
}



/*
 * 32 - The angle between two celestial objects
 */

Astronomy.prototype.angleBetweenRightAscensionEquatorialCoordinates = function(rightAscensionEquatorialCoordinates1, rightAscensionEquatorialCoordinates2) {

    var rightAscensionDegrees1 = this.decimalHoursToDecimalDegrees(this.hoursMinutesSecondsToDecimalHours(rightAscensionEquatorialCoordinates1.rightAscension));
    var rightAscensionRadians1 = degreesToRadians(rightAscensionDegrees1);

    var declinationDegrees1 = this.degreesMinutesSecondsToDecimalDegrees(rightAscensionEquatorialCoordinates1.declination);
    var declinationRadians1 = degreesToRadians(declinationDegrees1);

    var rightAscensionDegrees2 = this.decimalHoursToDecimalDegrees(this.hoursMinutesSecondsToDecimalHours(rightAscensionEquatorialCoordinates2.rightAscension));
    var rightAscensionRadians2 = degreesToRadians(rightAscensionDegrees2);

    var declinationDegrees2 = this.degreesMinutesSecondsToDecimalDegrees(rightAscensionEquatorialCoordinates2.declination);
    var declinationRadians2 = degreesToRadians(declinationDegrees2);

    var cosAngle =
       Math.sin(declinationRadians1) * Math.sin(declinationRadians2) +
       Math.cos(declinationRadians1) * Math.cos(declinationRadians2) * Math.cos(rightAscensionRadians1 - rightAscensionRadians2);

    var angleRadians = Math.acos(cosAngle);
    var angleDegrees = radiansToDegrees(angleRadians);

    return this.decimalDegreesToDegreesMinutesSeconds(angleDegrees);
}

Astronomy.prototype.angleBetweenEclipticCoordinates = function(eclipticCoordinates1, eclipticCoordinates2) {

    var eclipticLongitudeDegrees1 = this.degreesMinutesSecondsToDecimalDegrees(eclipticCoordinates1.eclipticLongitude);
    var eclipticLongitudeRadians1 = degreesToRadians(eclipticLongitudeDegrees1);

    var eclipticLatitudeDegrees1 = this.degreesMinutesSecondsToDecimalDegrees(eclipticCoordinates1.eclipticLatitude);
    var eclipticLatitudeRadians1 = degreesToRadians(eclipticLatitudeDegrees1);

    var eclipticLongitudeDegrees2 = this.degreesMinutesSecondsToDecimalDegrees(eclipticCoordinates2.eclipticLongitude);
    var eclipticLongitudeRadians2 = degreesToRadians(eclipticLongitudeDegrees2);

    var eclipticLatitudeDegrees2 = this.degreesMinutesSecondsToDecimalDegrees(eclipticCoordinates2.eclipticLatitude);
    var eclipticLatitudeRadians2 = degreesToRadians(eclipticLatitudeDegrees2);

    var cosAngle =
        Math.sin(eclipticLatitudeRadians1) * Math.sin(eclipticLatitudeRadians2) +
        Math.cos(eclipticLatitudeRadians1) * Math.cos(eclipticLatitudeRadians2) * Math.cos(eclipticLongitudeRadians1 - eclipticLongitudeRadians2);

    var angleRadians = Math.acos(cosAngle);
    var angleDegrees = radiansToDegrees(angleRadians);

    return this.decimalDegreesToDegreesMinutesSeconds(angleDegrees);
}

/*
 * 35 - Nutation
 */

Astronomy.prototype.nutation = function(calendarDate) {

    var dateJD = this.dateToJulianDayNumber(calendarDate);
    var epochJD = this.dateToJulianDayNumber(new CalendarDate(1900, 1, 0.5));

    var tCenturies = (dateJD - epochJD) / 36525;
    var tCenturiesSq = tCenturies * tCenturies;

    var A = 100.0021358 * tCenturies;
    var B = 360 * (A - Math.floor(A));
    var lDegrees = 279.6967 + (0.000303 * tCenturiesSq) + B;
    var lRadians2 = 2 * degreesToRadians(lDegrees);

    var C = 1336.855231 * tCenturies;
    var D = 360 * (C - Math.floor(C));
    var dDegrees = 270.4342 - (0.001133 * tCenturiesSq) + D;
    var dRadians2 = 2 * degreesToRadians(dDegrees);

    var E = 99.99736056 * tCenturies;
    var F = 360 * (E - Math.floor(E));
    var m1Degrees = 358.4758 - (0.00015 * tCenturiesSq) + F;
    var m1Radians = degreesToRadians(m1Degrees);

    var G = 1325.552359 * tCenturies;
    var H = 360 * (G - Math.floor(G));
    var m2Degrees = 296.1046 + (0.009192 * tCenturiesSq) + H;
    var m2Radians = degreesToRadians(m2Degrees);

    var I = 5.372616667 * tCenturies;
    var J = 360 * (I - Math.floor(I));
    var nDegrees = 259.1833 + 0.002078 * tCenturiesSq - J;
    var nRadians = degreesToRadians(nDegrees);

    var nutationInLongitudeArcSecs = (-17.2327 - 0.01737 * tCenturies) * Math.sin(nRadians);
    nutationInLongitudeArcSecs += (-1.2729 - 0.00013 * tCenturies) * Math.sin(lRadians2);
    nutationInLongitudeArcSecs += 0.2088 * Math.sin(2 * nRadians);
    nutationInLongitudeArcSecs -= 0.2037 * Math.sin(dRadians2);
    nutationInLongitudeArcSecs += (0.1261 - 0.00031 * tCenturies) * Math.sin(m1Radians);
    nutationInLongitudeArcSecs += 0.0675 * Math.sin(m2Radians)
    nutationInLongitudeArcSecs -= (0.0497 - 0.00012 * tCenturies) * Math.sin(lRadians2 + m1Radians);
    nutationInLongitudeArcSecs -= 0.0342 * Math.sin(dRadians2 - nRadians);
    nutationInLongitudeArcSecs -= 0.0261 * Math.sin(dRadians2 + m2Radians);
    nutationInLongitudeArcSecs += 0.0214 * Math.sin(lRadians2 - m1Radians);
    nutationInLongitudeArcSecs -= 0.0149 * Math.sin(lRadians2 - dRadians2 + m2Radians);
    nutationInLongitudeArcSecs += 0.0124 * Math.sin(lRadians2 - nRadians)
    nutationInLongitudeArcSecs += 0.0114 * Math.sin(dRadians2 - m2Radians);

    var nutationInObliquityArcSecs = (9.21 + (0.00091 * tCenturies)) * Math.cos(nRadians);
    nutationInObliquityArcSecs += (0.5522 - (0.00029 * tCenturies)) * Math.cos(lRadians2);
    nutationInObliquityArcSecs -= 0.0904 * Math.cos(nRadians * 2);
    nutationInObliquityArcSecs += 0.0884 * Math.cos(dRadians2);
    nutationInObliquityArcSecs += 0.0216 * Math.cos(lRadians2 + m1Radians);
    nutationInObliquityArcSecs += 0.0183 * Math.cos(dRadians2 - nRadians);
    nutationInObliquityArcSecs += 0.0113 * Math.cos(dRadians2 + m2Radians);
    nutationInObliquityArcSecs -= 0.0093 * Math.cos(lRadians2 - m1Radians);
    nutationInObliquityArcSecs -= 0.0066 * Math.cos(lRadians2 - nRadians);

    var nutationInLongitudeDegrees = nutationInLongitudeArcSecs / 3600;
    var nutationInObliquityDegrees = nutationInObliquityArcSecs / 3600;

    return new Nutation(nutationInLongitudeDegrees, nutationInObliquityDegrees);
}

function CalendarDate(year, month, day) {

    this.year = year;
    this.month = month;
    this.day = day;
}

CalendarDate.prototype.toString = function() {

    return this.year + "/" + zeroPad(this.month, 2) + "/" + zeroPad(this.day, 2);
}

function TimeOfDay(hours, minutes, seconds) {

    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
}

TimeOfDay.prototype.toString = function() {

    var hours = zeroPad(this.hours, 2);
    var minutes = zeroPad(this.minutes, 2);
    var seconds = zeroPad(Math.floor(this.seconds), 2);
    var milliseconds = zeroPad(Math.round((this.seconds % 1) * 1000), 3);

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function DateAndTime(calendarDate, timeOfDay) {

    this.calendarDate = calendarDate;
    this.timeOfDay = timeOfDay;
}

DateAndTime.prototype.toString = function() {

    return this.calendarDate + " " + this.timeOfDay;
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

function HourAngleEquatorialCoordinates(hourAngle, declination) {

    this.hourAngle = hourAngle;
    this.declination = declination;
}

HourAngleEquatorialCoordinates.prototype.toString = function() {

    return "H=" + this.hourAngle + ", δ=" + this.declination;
}

function RightAscensionEquatorialCoordinates(rightAscension, declination) {

    this.rightAscension = rightAscension;
    this.declination = declination;
}

RightAscensionEquatorialCoordinates.prototype.toString = function() {

    return "α=" + this.rightAscension + ", δ=" + this.declination;
}

function HorizonCoordinates(azimuth, altitude) {

    this.azimuth = azimuth;
    this.altitude = altitude;
}

HorizonCoordinates.prototype.toString = function() {

    return "A=" + this.azimuth + ", a=" + this.altitude;
}

function EclipticCoordinates(eclipticLongitude, eclipticLatitude) {

    this.eclipticLongitude = eclipticLongitude;
    this.eclipticLatitude = eclipticLatitude;
}

EclipticCoordinates.prototype.toString = function() {

    return "λ=" + this.eclipticLongitude + ", β=" + this.eclipticLatitude;
}

function GalacticCoordinates(galacticLongitude, galacticLatitude) {

    this.galacticLongitude = galacticLongitude;
    this.galacticLatitude = galacticLatitude;
}

GalacticCoordinates.prototype.toString = function() {

    return "l=" + this.galacticLongitude + ", b=" + this.galacticLatitude;
}

function Nutation(nutationInLongitude, nutationInObliquity) {

    this.nutationInLongitude = nutationInLongitude;
    this.nutationInObliquity = nutationInObliquity;
}

Nutation.prototype.toString = function() {

    return "Δψ=" + this.nutationInLongitude + ", Δε=" + this.nutationInObliquity;
}

function checkYearInGregorianCalendar(year) {

    if (year < 1583) {
        throw new AstronomyError("year must be in Gregorian Calendar, i.e. >= 1583");
    }
}

function checkMonthInGregorianCalendar(year, month) {

    if (year < 1583 || (year == 1582 && month < 11)) {
        throw new AstronomyError("month must be in Gregorian Calendar, i.e. >= 1582/11");
    }
}

function checkDateInGregorianCalendar(calendarDate) {

    if (!dateInGregorianCalendar(calendarDate)) {
        throw new AstronomyError("date must be in Gregorian Calendar, i.e. >= 1582/10/15");
    }
}

function isLeapYear(year) {

    return (year % 4 == 0 && !((year % 100 == 0) && (year % 400 != 0)));
}

function daysInYear(year) {

    return isLeapYear(year) ? 366 : 365;
}

function reduceValueToZeroToRange(value, range) {

    return value - (range * Math.floor(value / range));
}

function dateInGregorianCalendar(calendarDate) {

    return (
        calendarDate.year > 1582 ||
        (calendarDate.year == 1582 && calendarDate.month > 10) ||
        (calendarDate.year == 1582 && calendarDate.month == 10 && calendarDate.day >= 15));
}

function zeroPad(number, size) {

    var padded = "" + number;

    while (padded.length < size) {
        padded = "0" + padded;
    }

    return padded;
}

function degreesToRadians(degrees) {

    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {

    return radians / (Math.PI / 180);
}

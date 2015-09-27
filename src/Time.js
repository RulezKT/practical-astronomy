function Time () {}

function TimeError(message) {
    this.name = "TimeError";
    this.message = (message || "");
}

TimeError.prototype = Error.prototype;

/*
 * 1 - Calendars
 */

Time.prototype.daysInMonth = function(year, month) {

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
 * 2 - The date of Easter
 */

Time.prototype.dateOfEaster = function(year) {

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

    return new Date(year, month-1, day);
};

/*
 * 3 - Converting the date to the day number
 */

Time.prototype.dateToDayNumber = function(year, month, day) {

    checkDateInGregorianCalendar(year, month, day);

    var a;
    var b;
    var c
    var dayNumber;

    if (month > 2) {
        a = month + 1;
        b = Math.floor(a * 30.6);
        c = b - (isLeapYear(year) ? 62 : 63);
        dayNumber = c + day;
    } else {
        a = month - 1;
        b = a * 63;
        c = Math.floor(b / 2);
        dayNumber = c + day;
    }

    return dayNumber;
}

Time.prototype.dateToDaysElapsedSinceEpoch = function(year, month, day) {

    checkDateInGregorianCalendar(year, month, day);

    var daysElapsed = 0;

    if (year < 1990) {

        for (var i = 1989; i >= year; i--) {
            daysElapsed -= daysInYear(i);
        }

    } else {

        for (i = 1990; i < year; i++) {
            daysElapsed += daysInYear(i);
        }
    }

    daysElapsed += this.dateToDayNumber(year, month, day);

    return daysElapsed;
}

/*
 * 4 - Julian day numbers
 */

Time.prototype.dateToJulianDayNumber = function(year, month, day) {

    var y = year;
    var m = month;

    if (month <= 2) {
        y -= 1;
        m += 12;
    }

    var b = 0;

    if (dateInGregorianCalendar(year, month, day)) {
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

    return b + c + d + day + 1720994.5;
}

Time.prototype.dateToModifiedJulianDayNumber = function(year, month, day) {

    return this.dateToJulianDayNumber(year, month, day) - 2400000.5;
}

function checkYearInGregorianCalendar(year) {
    if (year < 1583) {
        throw new TimeError("year must be in Gregorian Calendar, i.e. >= 1583");
    }
}

function checkMonthInGregorianCalendar(year, month) {
    if (year < 1583 || (year == 1582 && month < 11)) {
        throw new TimeError("month must be in Gregorian Calendar, i.e. >= 1582/11");
    }
}

function checkDateInGregorianCalendar(year, month, day) {
    if (!dateInGregorianCalendar(year, month, day)) {
        throw new TimeError("date must be in Gregorian Calendar, i.e. >= 1582/10/15");
    }
}

function isLeapYear(year) {
    return (year % 4 == 0 && !((year % 100 == 0) && (year % 400 != 0)));
}

function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function dateInGregorianCalendar(year, month, day) {
    return (year > 1582 || (year == 1582 && month > 10) || (year == 1582 && month == 10 && day >= 15));
}

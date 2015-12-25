function Time() {}

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

    return new CalendarDate(year, month, day);
};

/*
 * 3 - Converting the date to the day number
 */

Time.prototype.dateToDayNumber = function(calendarDate) {

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
        b = a * 63;
        c = Math.floor(b / 2);
        dayNumber = c + calendarDate.day;
    }

    return dayNumber;
}

Time.prototype.dateToDaysElapsedSinceEpoch = function(calendarDate) {

    checkDateInGregorianCalendar(calendarDate);

    var epochJD = this.dateToJulianDayNumber(new CalendarDate(2009, 12, 31));
    var dateJD = this.dateToJulianDayNumber(calendarDate);

    return dateJD - epochJD
}

/*
 * 4 - Julian day numbers
 */

Time.prototype.dateToJulianDayNumber = function(calendarDate) {

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

Time.prototype.dateToModifiedJulianDayNumber = function(calendarDate) {

    return this.dateToJulianDayNumber(calendarDate) - 2400000.5;
}

/*
 * 5 - Converting the Julian day number to the calendar date
 */

Time.prototype.julianDayNumberToDate = function(julianDay) {

    if (julianDay < 2299160.5) {
        throw new TimeError("julian day number must be in Gregorian Calendar, i.e. >= 2299160.5");
    }

    var i = Math.floor(julianDay + 0.5);
    var f = (julianDay + 0.5) - i;

    var a = Math.floor((i - 1867216.25) / 36524.25);
    var b = i + 1 + a - Math.floor(a / 4);
    var c = b + 1524;
    var d = Math.floor((c - 122.1) / 365.25);
    var e = Math.floor(365.25 * d);
    var g = Math.floor((c - e) / 30.6001);

    var day = c - e + f - Math.floor(30.6001 * g);

    if (g < 14) {
        var month = g - 1;
    }
    else {
        var month = g - 13;
    }

    if (month > 2) {
        var year = d - 4716;
    }
    else {
        var year = d - 4715;
    }

    return new CalendarDate(year, month, day);
}

/*
 * 6 - Finding the day of the week
 */

Time.prototype.dateToDayOfWeek = function(calendarDate) {

    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    checkDateInGregorianCalendar(calendarDate);

    jd = this.dateToJulianDayNumber(calendarDate);

    var a = (jd + 1.5) / 7;

    n = Math.round((a % 1) * 7);

    return daysOfWeek[n];
}

function CalendarDate(year, month, day) {
    this.year = year;
    this.month = month;
    this.day = day;
}

CalendarDate.prototype.toString = function() {
    return this.year + "/" + this.month + "/" + this.day;
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

function checkDateInGregorianCalendar(calendarDate) {
    if (!dateInGregorianCalendar(calendarDate)) {
        throw new TimeError("date must be in Gregorian Calendar, i.e. >= 1582/10/15");
    }
}

function isLeapYear(year) {
    return (year % 4 == 0 && !((year % 100 == 0) && (year % 400 != 0)));
}

function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function dateInGregorianCalendar(calendarDate) {
    return (
        calendarDate.year > 1582 ||
        (calendarDate.year == 1582 && calendarDate.month > 10) ||
        (calendarDate.year == 1582 && calendarDate.month == 10 && calendarDate.day >= 15));
}


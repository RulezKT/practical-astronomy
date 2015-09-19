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

    checkYearInGregorianCalendar(year);

    var days = 31;

    switch(month) {
        case 2: {
            days = (year % 4 == 0 && !((year % 100 == 0) && (year % 400 != 0))) ? 29 : 28;
            break;
        }
        case 4: { days = 30; break; }
        case 6: { days = 30; break; }
        case 9: { days = 30; break; }
        case 11: { days = 30; break; }
    }

    return days;
}

/*
 * 2 - The Date of Easter
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

function checkYearInGregorianCalendar(year) {
    if (year < 1583) {
        throw new TimeError("year must be on Gregorian Calendar, i.e. >= 1583");
    }
}

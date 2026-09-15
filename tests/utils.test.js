const test = require('node:test');
const assert = require('node:assert/strict');

const {
    combineDateAndTime,
    formatDate,
    formatDateTime,
    formatPreviousDate,
    getLotteryContext,
    zonedDateTimeToDate
} = require('../js/utils');

test('combines the separate date and time picker values', () => {
    assert.equal(combineDateAndTime('2026-09-15', '16:10'), '2026-09-15T16:10');
    assert.equal(combineDateAndTime('', '16:10'), '');
    assert.equal(combineDateAndTime('2026-09-15', ''), '');
});

test('maps business names to the correct Jira projects', () => {
    assert.equal(getLotteryContext('FK-MI').jiraPrefix, 'FKC');
    assert.equal(getLotteryContext('WV').jiraPrefix, 'WV');
    assert.equal(getLotteryContext('CRO').jiraPrefix, 'CRO');
    assert.equal(getLotteryContext('CRO').timezone, 'Europe/Zagreb');
    assert.equal(getLotteryContext('NGL', 'Sisal TR').jiraPrefix, 'NGL');
    assert.equal(getLotteryContext('NGL', 'SzZrt').jiraPrefix, 'HUN');
    assert.equal(getLotteryContext('NGL', 'UNL').jiraPrefix, 'UNL');
    assert.equal(getLotteryContext('Atlantic City').jiraPrefix, 'ALC');
    assert.equal(getLotteryContext('Atlantic City').fixedDropInBets, true);
    assert.equal(getLotteryContext('Atlantic City').jiraPrefix, 'ALC');
    assert.equal(getLotteryContext('Atlantic City').fixedDropInBets, true);
});

test('converts Israel summer time to North Carolina local time', () => {
    const output = formatDateTime('2026-09-09T13:55', getLotteryContext('NCEL'));
    assert.equal(output, '09/09/2026 06:55 AM (GMT-4)');
});

test('converts Israel summer time to Alberta local time', () => {
    const output = formatDateTime('2026-09-06T11:50', getLotteryContext('AGLC'));
    assert.equal(output, '09/06/2026 02:50 AM (GMT-6)');
});

test('uses European formatting and destination DST for SzZrt', () => {
    const output = formatDateTime('2026-09-10T03:35', getLotteryContext('NGL', 'SzZrt'));
    assert.equal(output, '10/09/2026 02:35 (GMT+2)');
});

test('uses winter DST offsets for both source and destination', () => {
    const output = formatDateTime('2026-01-15T12:00', getLotteryContext('MSL'));
    assert.equal(output, '01/15/2026 05:00 AM (GMT-5)');
});

test('parses Israel wall time independently of the workstation timezone', () => {
    assert.equal(zonedDateTimeToDate('2026-09-10T03:00').toISOString(), '2026-09-10T00:00:00.000Z');
});

test('formats report dates without timezone day shifts', () => {
    assert.equal(formatDate('2026-10-01'), 'October 1st');
    assert.equal(formatDate('2026-10-12'), 'October 12th');
    assert.equal(formatDate('2026-10-23'), 'October 23rd');
});

test('uses the previous US report date for an Israel notification date', () => {
    assert.equal(formatPreviousDate('2026-09-10'), 'September 9th');
    assert.equal(formatPreviousDate('2027-01-01'), 'December 31st');
});

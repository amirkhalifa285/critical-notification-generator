const test = require('node:test');
const assert = require('node:assert/strict');

const {
    generateDepositApprovalImpact,
    generateInterruptionImpact,
    generateRegulatoryReportOpeningHTML,
    generateRegulatoryReportResolvedHTML,
    generateSystemOpeningHTML,
    generateSystemResolvedHTML
} = require('../js/templateGenerator');

test('approved-deposit effect is added only when selected', () => {
    const rejectedIssue = 'Increase in rejected deposits via PayWithMyBank processor';
    const declinedIssue = 'Increase in declined deposits via Paysafe processor';

    assert.equal(
        generateDepositApprovalImpact(rejectedIssue, true),
        'Increase in rejected deposits followed by a decrease in approved deposits via PayWithMyBank processor'
    );
    assert.equal(generateDepositApprovalImpact(rejectedIssue, false), rejectedIssue);
    assert.equal(
        generateDepositApprovalImpact(declinedIssue, true),
        'Increase in declined deposits followed by a decrease in approved deposits via Paysafe processor'
    );
});

test('ongoing regulatory report template lists files on separate lines', () => {
    const output = generateRegulatoryReportOpeningHTML(
        'Daily',
        ['player_account_summary_report', 'player_activity_report'],
        'September 14th',
        '09/15/2026 09:10 AM (GMT-4)'
    );

    assert.match(output, /Missing Regulatory Reports for September 14th/);
    assert.match(output, /The issue was detected at 09\/15\/2026 09:10 AM \(GMT-4\) and is ongoing\./);
    assert.match(output, /The following Daily reports:<br>\s*player_account_summary_report<br>player_activity_report<br>/);
    assert.match(output, /for September 14th are being delayed\./);
    assert.match(output, /Under Aristocrat BI team investigation\./);
});

test('resolved regulatory report template uses resolved timing and impact wording', () => {
    const output = generateRegulatoryReportResolvedHTML(
        'Weekly',
        ['player_account_summary_report'],
        'September 14th',
        '09/15/2026 09:10 AM (GMT-4)',
        '09/15/2026 10:25 AM (GMT-4)'
    );

    assert.match(output, /The issue has been resolved\./);
    assert.match(output, /Start time:<\/u> 09\/15\/2026 09:10 AM \(GMT-4\)\./);
    assert.match(output, /End time:<\/u> 09\/15\/2026 10:25 AM \(GMT-4\)\./);
    assert.match(output, /The following Weekly reports/);
    assert.match(output, /for September 14th were delayed\./);
});

test('interruption impact uses ongoing wording only in the impact description', () => {
    assert.equal(
        generateInterruptionImpact('Interruptions in bets', '10', '5', 'ongoing'),
        'Interruptions in bets (Happening every ~10 minutes and lasts less than ~5 minutes each time, causing a drop in betting activity)'
    );
});

test('interruption impact changes to past tense when resolved', () => {
    assert.equal(
        generateInterruptionImpact('Interruptions in bets via BRIGHTSTAR', '7', '4', 'resolved'),
        'Interruptions in bets via BRIGHTSTAR (Happened every ~7 minutes and lasted less than ~4 minutes each time, causing a drop in betting activity)'
    );
});

test('ongoing template keeps the approved structure and omits a sign-off', () => {
    const output = generateSystemOpeningHTML(
        'Drop in bets via Sisal TR',
        'Drop in bets via Sisal TR',
        '10/09/2026 03:09 (GMT+3)',
        'We have reached out to Sisal TR team and are waiting for their response'
    );

    assert.match(output, /The issue started at .* and is currently ongoing\./);
    assert.match(output, /Further updates will be provided once available\./);
    assert.match(output, /banner-opening\.png/);
    assert.doesNotMatch(output, /Regards/);
});

test('resolved template requires no extra update state or sign-off', () => {
    const output = generateSystemResolvedHTML(
        'Drop in bets via Sisal TR',
        'Drop in bets via Sisal TR',
        '10/09/2026 01:35 (GMT+3)',
        '10/09/2026 05:34 (GMT+3)',
        'Under Aristocrat teams investigation'
    );

    assert.match(output, /The issue has been resolved\./);
    assert.match(output, /Start time:/);
    assert.match(output, /End time:/);
    assert.match(output, /incident report\./);
    assert.match(output, /banner-resolved\.png/);
    assert.doesNotMatch(output, /Regards/);
});

test('custom text that already has punctuation does not get a double period', () => {
    const output = generateSystemOpeningHTML(
        'Hosting website is unavailable.',
        'Hosting website is unavailable.',
        '02/09/2026 03:40 AM (GMT-3)',
        'Known provider issue.'
    );

    assert.doesNotMatch(output, /\.\./);
});

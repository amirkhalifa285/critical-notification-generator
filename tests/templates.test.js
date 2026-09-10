const test = require('node:test');
const assert = require('node:assert/strict');

const {
    generateSystemOpeningHTML,
    generateSystemResolvedHTML
} = require('../js/templateGenerator');

test('ongoing template keeps the approved structure and omits a sign-off', () => {
    const output = generateSystemOpeningHTML(
        'Drop in bets via Sisal TR',
        'Drop in bets via Sisal TR',
        '10/09/2026 03:09 (GMT+3)',
        'We have reached out to Sisal TR team and are waiting for their response'
    );

    assert.match(output, /The issue started at .* and is currently ongoing\./);
    assert.match(output, /Further updates will be provided once available\./);
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

const test = require('node:test');
const assert = require('node:assert/strict');

const { ISSUE_LIST, formatIssueLines, parseIssueLines } = require('../js/issues');

test('round-trips every current issue through the admin text format', () => {
    assert.deepEqual(parseIssueLines(formatIssueLines(ISSUE_LIST), ISSUE_LIST), ISSUE_LIST);
});

test('includes the generic decrease in bets issue with a percentage', () => {
    const issue = ISSUE_LIST.find(item => item.value === 'Decrease in bets via {target}');
    assert.equal(issue.targetLabel, 'Provider / channel');
    assert.equal(issue.requiresPercentage, true);
});

test('parses a new issue with a target and options', () => {
    assert.deepEqual(parseIssueLines('Decrease in deposits via [Payment processor] processor | %'), [{
        value: 'Decrease in deposits via {target} processor',
        label: 'Decrease in deposits via [Payment processor] processor',
        targetLabel: 'Payment processor',
        requiresPercentage: true
    }]);
});

test('gives new interruption issues the optional provider field', () => {
    const [issue] = parseIssueLines('Interruptions in deposits | interruption');
    assert.equal(issue.optionalTargetLabel, 'Provider / channel');
    assert.equal(issue.label, 'Interruptions in deposits [optional provider/channel]');
});

test('rejects unknown options', () => {
    assert.throws(() => parseIssueLines('Drop in bets | sometimes'), /Unknown option/);
});

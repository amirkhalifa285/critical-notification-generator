/**
 * System issue descriptions, from data/issues.json. `{target}` in a value is
 * replaced by the Provider / channel or processor the operator enters.
 */

const ISSUE_LIST = [];

function setIssueData(data) {
    ISSUE_LIST.splice(0, ISSUE_LIST.length, ...data);
}

/*
 * Admin text format, one issue per line, grouped under "# Category" lines:
 *   # Activity
 *   Drop in bets via [Provider / channel]
 *   Decrease in bets via [Provider / channel] | %
 *   Increase in rejected deposits via [Payment processor] processor | ask approved deposits
 *   Interruptions in bets | interruption
 * [Label] marks where the operator's input goes and names the input field.
 */
const ISSUE_FLAGS = {
    '%': 'requiresPercentage',
    'interruption': 'interruption',
    'ask approved deposits': 'approvedDepositsCheck'
};

function formatIssueLines(issues) {
    let currentCategory;
    return issues.flatMap(issue => {
        const lines = [];
        if (issue.category !== currentCategory) {
            currentCategory = issue.category;
            if (currentCategory) lines.push(`# ${currentCategory}`);
        }
        const text = issue.targetLabel
            ? issue.value.replace('{target}', `[${issue.targetLabel}]`)
            : issue.value;
        const flags = Object.entries(ISSUE_FLAGS)
            .filter(([, property]) => issue[property])
            .map(([flag]) => flag);
        lines.push([text, ...flags].join(' | '));
        return lines;
    }).join('\n');
}

/**
 * Parse the admin text back into issues. Labels of unchanged issues are kept
 * so the dropdown wording stays as before.
 */
function parseIssueLines(text, previousIssues = []) {
    let category = '';
    return text.split('\n').map(line => line.trim()).filter(Boolean).flatMap(line => {
        if (line.startsWith('#')) {
            category = line.replace(/^#+/, '').trim();
            return [];
        }
        const [wording, ...flagParts] = line.split('|').map(part => part.trim());
        const issue = {};
        const targetMatch = /\[([^\]]+)\]/.exec(wording);
        if (targetMatch) {
            issue.value = wording.replace(targetMatch[0], '{target}');
            issue.targetLabel = targetMatch[1].trim();
        } else {
            issue.value = wording;
        }
        if (!issue.value) throw new Error(`Missing wording in: ${line}`);

        flagParts.filter(Boolean).forEach(flag => {
            const property = ISSUE_FLAGS[flag.toLowerCase()];
            if (!property) throw new Error(`Unknown option "${flag}" in: ${line}`);
            issue[property] = true;
        });
        if (issue.interruption && !issue.targetLabel) {
            issue.optionalTargetLabel = 'Provider / channel';
        }

        const previous = previousIssues.find(old => old.value === issue.value);
        const label = previous?.label || (issue.optionalTargetLabel
            ? `${issue.value} [optional provider/channel]`
            : wording);
        const { value, ...options } = issue;
        return [{ value, label, ...(category ? { category } : {}), ...options }];
    });
}

if (typeof module !== 'undefined' && module.exports) {
    setIssueData(require('../data/issues.json'));
    module.exports = { ISSUE_LIST, formatIssueLines, parseIssueLines, setIssueData };
}

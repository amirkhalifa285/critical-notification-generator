/**
 * Critical-notification recipient lists transcribed from the NOC playbook.
 *
 * Important: spelling, capitalization, ordering, and duplicate entries are
 * intentionally preserved. The universal NOC Shift Leaders alias is the only
 * exception: it is guaranteed to appear exactly once in each final CC list.
 */

// Recipient data lives in data/recipients.json so it can be edited from the
// admin mode. The browser loads it via loadAppData() in main.js; Node loads it
// directly for the tests.
const NPI_COMMON_RECIPIENTS = { to: [], cc: [] };
const RECIPIENT_LISTS = {};

// Confirmed by the NOC operator; do not infer NPI membership from geography.
const NPI_CUSTOMERS = new Set(['AGLC', 'NCEL', 'VAL', 'WV']);
const REQUIRED_CC_RECIPIENT = 'NOCShiftLeaders@aristocrat.com';

function setRecipientData(data) {
    NPI_COMMON_RECIPIENTS.to = [...data.npiCommon.to];
    NPI_COMMON_RECIPIENTS.cc = [...data.npiCommon.cc];
    Object.keys(RECIPIENT_LISTS).forEach(key => delete RECIPIENT_LISTS[key]);
    Object.assign(RECIPIENT_LISTS, data.lists);
}

function getRecipientKey(environment, nglSite = '') {
    return environment === 'NGL' ? `NGL:${nglSite}` : environment;
}

function getRecipientList(environment, nglSite = '') {
    const key = getRecipientKey(environment, nglSite);
    const customerRecipients = RECIPIENT_LISTS[key];
    if (!customerRecipients) return null;

    const recipients = NPI_CUSTOMERS.has(key)
        ? {
            to: [...NPI_COMMON_RECIPIENTS.to, ...customerRecipients.to],
            cc: [...NPI_COMMON_RECIPIENTS.cc, ...customerRecipients.cc]
        }
        : {
            to: [...customerRecipients.to],
            cc: [...customerRecipients.cc]
        };

    let requiredRecipientFound = false;
    recipients.cc = recipients.cc.filter(address => {
        if (address !== REQUIRED_CC_RECIPIENT) return true;
        if (requiredRecipientFound) return false;
        requiredRecipientFound = true;
        return true;
    });

    if (!requiredRecipientFound) {
        recipients.cc.push(REQUIRED_CC_RECIPIENT);
    }

    return recipients;
}

function formatRecipientList(addresses) {
    return addresses.join('; ');
}

if (typeof module !== 'undefined' && module.exports) {
    setRecipientData(require('../data/recipients.json'));
    module.exports = {
        NPI_COMMON_RECIPIENTS,
        NPI_CUSTOMERS,
        REQUIRED_CC_RECIPIENT,
        RECIPIENT_LISTS,
        formatRecipientList,
        setRecipientData,
        getRecipientKey,
        getRecipientList
    };
}

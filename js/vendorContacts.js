/**
 * Contacts for the vendor/lottery outreach email sent when an external team is
 * contacted about an incident. Addresses are copied exactly from the operator's
 * list; spelling, capitalization, and duplicates are intentionally preserved.
 */

// In the browser recipientLists.js is loaded first and exposes these globally.
const recipientLookup = typeof require === 'function'
    ? require('./recipientLists')
    : { getRecipientKey, getRecipientList };

const OUTREACH_CC = [
    'NOCShiftLeaders@aristocrat.com',
    'noc-ng@aristocrat.com'
];

// Vendor and lottery outreach data lives in data/vendors.json so it can be
// edited from the admin mode.
// VENDOR_CONTACTS: `matches` are lowercase keywords looked up in the external
// team name; `environments` restricts a variant to specific lotteries when one
// vendor has several contact lists.
// LOTTERY_OUTREACH_CONTACTS: dedicated contacts for NG-LOT and USLOT lotteries.
// Lotteries absent from it fall back to the To list of their critical notification.
const VENDOR_CONTACTS = {};
const LOTTERY_OUTREACH_CONTACTS = {};

function setVendorData(data) {
    [VENDOR_CONTACTS, LOTTERY_OUTREACH_CONTACTS].forEach(target => {
        Object.keys(target).forEach(key => delete target[key]);
    });
    Object.assign(VENDOR_CONTACTS, data.vendors);
    Object.assign(LOTTERY_OUTREACH_CONTACTS, data.lotteryOutreach);
}

/**
 * Recipients for contacting the selected lottery itself. Only NG-LOT and USLOT
 * lotteries are contacted this way.
 */
function getLotteryOutreachRecipients(environment, nglSite = '') {
    const key = recipientLookup.getRecipientKey(environment, nglSite);
    const to = LOTTERY_OUTREACH_CONTACTS[key]
        || recipientLookup.getRecipientList(environment, nglSite)?.to;
    return to ? { to: [...to], cc: [...OUTREACH_CC] } : null;
}

function getVendorRecipients(vendorId) {
    const vendor = VENDOR_CONTACTS[vendorId];
    return vendor ? { to: [...vendor.to], cc: [...OUTREACH_CC] } : null;
}

/**
 * Suggest a vendor from the external team name. A variant restricted to the
 * selected environment wins over the vendor's general list.
 */
function suggestVendor(teamName, environment) {
    const name = teamName.trim().toLowerCase();
    if (!name) return '';

    const candidates = Object.entries(VENDOR_CONTACTS)
        .filter(([, vendor]) => vendor.matches.some(keyword => name.includes(keyword)));
    const specific = candidates.find(([, vendor]) => vendor.environments?.includes(environment));
    if (specific) return specific[0];

    const general = candidates.find(([, vendor]) => !vendor.environments);
    return general ? general[0] : '';
}

if (typeof module !== 'undefined' && module.exports) {
    setVendorData(require('../data/vendors.json'));
    module.exports = {
        LOTTERY_OUTREACH_CONTACTS,
        OUTREACH_CC,
        VENDOR_CONTACTS,
        getLotteryOutreachRecipients,
        getVendorRecipients,
        setVendorData,
        suggestVendor
    };
}

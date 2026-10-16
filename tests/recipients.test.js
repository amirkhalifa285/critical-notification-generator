const test = require('node:test');
const assert = require('node:assert/strict');

const {
    NPI_CUSTOMERS,
    RECIPIENT_LISTS,
    REQUIRED_CC_RECIPIENT,
    formatRecipientList,
    getRecipientList
} = require('../js/recipientLists');

test('applies the shared NPI recipients only to the four confirmed customers', () => {
    assert.deepEqual([...NPI_CUSTOMERS], ['AGLC', 'NCEL', 'VAL', 'WV']);

    const ncel = getRecipientList('NCEL');
    assert.equal(ncel.to[0], 'Jennifer.Ekholtz@aristocrat.com');
    assert.equal(ncel.to[1], 'Anat.Landes@aristocrat.com');
    assert.equal(ncel.cc[0], 'i-lotteryleadership@aristocrat.com');

    const nhl = getRecipientList('NHL');
    assert.equal(nhl.to.includes('Jennifer.Ekholtz@aristocrat.com'), false);
    assert.equal(nhl.cc.includes('i-lotteryleadership@aristocrat.com'), false);
});

// Counts are not fixed: lists are edited from the admin mode. Check the
// structure instead, plus the intentional duplicates from the playbook.
test('keeps every recipient list well formed, including intentional duplicates', () => {
    for (const [key, list] of Object.entries(RECIPIENT_LISTS)) {
        assert.ok(Array.isArray(list.to) && Array.isArray(list.cc), `${key} has To and CC`);
        assert.ok(list.to.length + list.cc.length > 0, `${key} is not empty`);
        [...list.to, ...list.cc].forEach(address => {
            assert.match(address, /^[^\s;,]+@[^\s;,]+$/, `${key}: ${address}`);
        });
    }

    assert.equal(RECIPIENT_LISTS.WV.to.filter(address => address === 'tdunford@wvlottery.com').length, 2);
    assert.equal(RECIPIENT_LISTS.PL.to.filter(address => address === 'Trish.Parker@aristocrat.com').length, 2);
});

test('preserves exact unusual playbook addresses instead of correcting them', () => {
    assert.ok(RECIPIENT_LISTS['Atlantic City'].to.includes('it.operations@ALC.ca'));
    assert.ok(RECIPIENT_LISTS['NGL:SzZrt'].cc.includes('oleksandr.astakhov@neogames'));
    assert.ok(RECIPIENT_LISTS.MSL.to.includes('critical.issues@michiganlottery.gov'));
});

test('does not invent lists for customers absent from the playbook tables', () => {
    assert.equal(getRecipientList('NGL', 'OPAP'), null);
});

test('adds the required NOC Shift Leaders alias to every available customer list', () => {
    for (const key of Object.keys(RECIPIENT_LISTS)) {
        const [environment, nglSite = ''] = key.startsWith('NGL:')
            ? ['NGL', key.slice(4)]
            : [key, ''];
        const occurrences = getRecipientList(environment, nglSite).cc
            .filter(address => address === REQUIRED_CC_RECIPIENT).length;
        assert.equal(occurrences, 1, key);
    }
});

test('formats recipient fields for direct paste into Outlook', () => {
    assert.equal(
        formatRecipientList(['first@example.com', 'second@example.com']),
        'first@example.com; second@example.com'
    );
});

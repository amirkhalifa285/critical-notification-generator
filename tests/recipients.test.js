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

test('keeps the playbook entry counts, including intentional duplicates', () => {
    const expectedCounts = {
        MASSL: [17, 9],
        NCEL: [4, 2],
        NHL: [13, 1],
        VAL: [10, 2],
        MSL: [8, 1],
        AGLC: [9, 15],
        WV: [8, 7],
        SZ: [1, 23],
        PL: [36, 7],
        'FK-MI': [8, 12],
        'NGL:Sisal IT': [10, 16],
        'NGL:Sisal TR': [9, 16],
        'NGL:Bitalih': [12, 18],
        'NGL:Hipodrom': [6, 18],
        'NGL:JSC': [8, 16],
        'NGL:Olifeja': [6, 16],
        'NGL:UNL': [3, 16],
        'NGL:Win2Day': [1, 13],
        'NGL:SzZrt': [1, 26],
        CRO: [4, 17],
        'Atlantic City': [2, 21],
        'IGT Georgia': [1, 23]
    };

    for (const [key, [toCount, ccCount]] of Object.entries(expectedCounts)) {
        assert.equal(RECIPIENT_LISTS[key].to.length, toCount, `${key} To count`);
        assert.equal(RECIPIENT_LISTS[key].cc.length, ccCount, `${key} CC count`);
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

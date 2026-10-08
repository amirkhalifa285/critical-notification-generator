const test = require('node:test');
const assert = require('node:assert/strict');

const {
    LOTTERY_OUTREACH_CONTACTS,
    VENDOR_CONTACTS,
    getLotteryOutreachRecipients,
    getVendorRecipients,
    suggestVendor
} = require('../js/vendorContacts');

const OUTREACH_CC = ['NOCShiftLeaders@aristocrat.com', 'noc-ng@aristocrat.com'];

test('keeps the operator-supplied vendor list counts', () => {
    const expectedCounts = {
        Paysafe: 1,
        BtoBet: 1,
        Mkodo: 2,
        FDJ: 1,
        IsoftBet: 1,
        IWG: 2,
        PayPal: 3,
        'Gambyt MSL/NHL': 4,
        'Gambyt MASSL': 4,
        'Brightstar MSL': 6,
        'Brightstar VAL': 5,
        Brightstar: 1,
        Evolution: 1
    };

    assert.deepEqual(Object.keys(VENDOR_CONTACTS).sort(), Object.keys(expectedCounts).sort());
    for (const [id, count] of Object.entries(expectedCounts)) {
        assert.equal(VENDOR_CONTACTS[id].to.length, count, id);
    }
});

test('keeps lottery outreach lists exact, including duplicates', () => {
    assert.equal(LOTTERY_OUTREACH_CONTACTS['NGL:Win2Day'].length, 6);
    assert.equal(LOTTERY_OUTREACH_CONTACTS['NGL:SzZrt'].filter(
        address => address === 'e-channel_operator@szerencsejatek.hu'
    ).length, 2);
    assert.ok(VENDOR_CONTACTS.Evolution.to.includes('SERVICEDESK@EVOLUTION.COM'));
    assert.ok(VENDOR_CONTACTS.IsoftBet.to.includes('isb_techsupport@IGT.com'));
});

test('always CCs NOC Shift Leaders and the NOC mailbox', () => {
    assert.deepEqual(getVendorRecipients('Paysafe').cc, OUTREACH_CC);
    assert.deepEqual(getLotteryOutreachRecipients('NGL', 'JSC').cc, OUTREACH_CC);
});

test('uses dedicated lottery contacts, falling back to the critical To list', () => {
    assert.deepEqual(getLotteryOutreachRecipients('IGT Georgia').to, ['REN.Ops@brightstarlottery.com']);
    assert.deepEqual(getLotteryOutreachRecipients('Atlantic City').to, ['it.operations@ALC.ca']);
    assert.equal(getLotteryOutreachRecipients('NGL', 'Sisal Misli').to[0], 'gloria.balestreri@fluttersea.com');
    assert.equal(getLotteryOutreachRecipients('NGL', 'Sisal TR').to[0], 'valentina.agostini@sisal.it');
    assert.equal(getLotteryOutreachRecipients('NGL', 'OPAP'), null);
});

test('includes the Brightstar escalation path for VAL and MSL', () => {
    const escalation = [
        'Emma.Murray@brightstarlottery.com',
        'Patrick.Cody@brightstarlottery.com',
        'REN.ops@brightstarlottery.com',
        'amanda.johns@brightstarlottery.com',
        'soumya.bhattacharya@brightstarlottery.com'
    ];
    assert.deepEqual(getVendorRecipients('Brightstar VAL').to, escalation);
    assert.deepEqual(getVendorRecipients('Brightstar MSL').to,
        ['michigan.ops@brightstarlottery.com', ...escalation]);
    assert.deepEqual(getVendorRecipients('Brightstar').to, ['REN.Ops@brightstarlottery.com']);
});

test('suggests vendors from the external team name and environment', () => {
    assert.equal(suggestVendor('Paysafe unity support', 'AGLC'), 'Paysafe');
    assert.equal(suggestVendor('Brightstar', 'MSL'), 'Brightstar MSL');
    assert.equal(suggestVendor('Brighstar', 'MSL'), 'Brightstar MSL');
    assert.equal(suggestVendor('Brightstar', 'VAL'), 'Brightstar VAL');
    assert.equal(suggestVendor('Brightstar', 'NCEL'), 'Brightstar');
    assert.equal(suggestVendor('Gambyt', 'MASSL'), 'Gambyt MASSL');
    assert.equal(suggestVendor('Gambyt', 'NHL'), 'Gambyt MSL/NHL');
    assert.equal(suggestVendor('Gambyt', 'AGLC'), '');
    assert.equal(suggestVendor('Unknown provider', 'AGLC'), '');
    assert.equal(suggestVendor('', 'AGLC'), '');
});

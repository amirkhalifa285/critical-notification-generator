const test = require('node:test');
const assert = require('node:assert/strict');

const {
    formatProviderLines,
    getProviderSuggestions,
    parseProviderLines,
    resolveProvider
} = require('../js/providers');
const { suggestVendor } = require('../js/vendorContacts');

test('escalates a subprovider to its provider', () => {
    assert.deepEqual(resolveProvider('SZ', 'Adell'), { provider: 'IsoftBet', internal: false });
    assert.deepEqual(resolveProvider('SZ', 'Red Tiger Casino'), { provider: 'Evolution', internal: false });
    assert.equal(suggestVendor('IsoftBet', 'SZ'), 'IsoftBet');
});

test('matches names regardless of case, spaces, and punctuation', () => {
    assert.equal(resolveProvider('SZ', '1x2_network').provider, 'IsoftBet');
    assert.equal(resolveProvider('SZ', 'synot-abx_play').provider, 'Fusion');
    assert.equal(resolveProvider('SZ', ' adell ').provider, 'IsoftBet');
});

test('maps the same subprovider per environment', () => {
    assert.equal(resolveProvider('SZ', 'Hacksaw').provider, 'IsoftBet');
    assert.equal(resolveProvider('AGLC', 'Hacksaw').provider, 'Fusion');
    assert.equal(resolveProvider('MASSL', 'Hacksaw'), null);
});

test('marks Fusion as internal everywhere', () => {
    assert.equal(resolveProvider('AGLC', 'Pragmatic').internal, true);
    assert.equal(resolveProvider('VAL', 'Scientific Games').internal, true);
    assert.equal(resolveProvider('PL', 'Fusion').internal, true);
    assert.equal(resolveProvider('NHL', 'IWG').internal, false);
});

test('leaves unknown names alone', () => {
    assert.equal(resolveProvider('SZ', 'Unknown studio'), null);
    assert.equal(resolveProvider('SZ', ''), null);
});

test('suggests providers and subproviders of the environment', () => {
    assert.deepEqual(getProviderSuggestions('NHL'), ['IWG']);
    assert.ok(getProviderSuggestions('SZ').includes('Adell'));
    assert.deepEqual(getProviderSuggestions('CRO'), []);
});

test('has outreach contacts for the new providers', () => {
    assert.equal(suggestVendor('Pollard', 'NCEL'), 'Pollard');
    assert.equal(suggestVendor('EQL', 'MSL'), 'EQL');
});

test('round-trips the admin provider text format', () => {
    const providers = { IsoftBet: ['Adell', 'Tom Horn'], IWG: [] };
    assert.equal(formatProviderLines(providers), 'IsoftBet: Adell, Tom Horn\nIWG');
    assert.deepEqual(parseProviderLines('IsoftBet: Adell, Tom Horn\n\nIWG\n'), providers);
});

test('shows the Fusion team contact of a subprovider as a reference', () => {
    const { getSubproviderContactHint } = require('../js/providers');
    assert.equal(
        getSubproviderContactHint('fazi'),
        'FYI this is the contact email for the subprovider: onlinesupport@fazi.rs, feel free to add them to the outreach email'
    );
    assert.match(getSubproviderContactHint('Wazdan'), /subprovider: lt@wazdan\.com; b2b@wazdan\.com, feel free/);
    assert.equal(getSubproviderContactHint('Adell'), '');
});

test('links every subprovider contact to a mapped subprovider', () => {
    const { PROVIDER_DATA } = require('../js/providers');
    const contacts = require('../data/subproviderContacts.json');
    const subproviders = new Set(Object.values(PROVIDER_DATA.environments)
        .flatMap(providers => Object.values(providers).flat()));
    Object.keys(contacts).forEach(name => assert.ok(subproviders.has(name), name));
});

const test = require('node:test');
const assert = require('node:assert/strict');

const { parseAddressList, parseKeywordList } = require('../js/admin');

test('parses one address per line', () => {
    assert.deepEqual(parseAddressList('a@x.com\n\nB.Name@Y.com\n'), ['a@x.com', 'B.Name@Y.com']);
});

test('parses pasted Outlook lists with names and mixed separators', () => {
    const pasted = 'NG_TechOps@aristocrat.com;Liudmyla.Korniienko@aristocrat.com, Tomer Ozeri <Tomer.Ozeri@aristocrat.com>;  \n;daniel.odonoghue@aristocrat.com';
    assert.deepEqual(parseAddressList(pasted), [
        'NG_TechOps@aristocrat.com',
        'Liudmyla.Korniienko@aristocrat.com',
        'Tomer.Ozeri@aristocrat.com',
        'daniel.odonoghue@aristocrat.com'
    ]);
});

test('keeps duplicates and unusual playbook addresses exactly', () => {
    assert.deepEqual(
        parseAddressList('alessandro.galli@sisal.it; alessandro.galli@sisal.it; oleksandr.astakhov@neogames'),
        ['alessandro.galli@sisal.it', 'alessandro.galli@sisal.it', 'oleksandr.astakhov@neogames']
    );
});

test('parses vendor keywords as lowercase', () => {
    assert.deepEqual(parseKeywordList('Brightstar, brighstar ,,'), ['brightstar', 'brighstar']);
});

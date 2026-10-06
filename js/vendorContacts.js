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

// `matches` are lowercase keywords looked up in the external team name.
// `environments` restricts a variant to specific lotteries when one vendor
// has several contact lists.
const VENDOR_CONTACTS = {
    'Paysafe': {
        label: 'Paysafe',
        matches: ['paysafe'],
        to: ['igaminghelp@paysafe.com']
    },
    'BtoBet': {
        label: 'BtoBet',
        matches: ['btobet'],
        to: ['supportbtobet@aristocrat.com']
    },
    'Mkodo': {
        label: 'Mkodo (AGLC hosting provider)',
        matches: ['mkodo'],
        to: ['support@mkodo.com', 'Iain.Murray@mkodo.com']
    },
    'FDJ': {
        label: 'FDJ (games provider)',
        matches: ['fdj'],
        to: ['operations@lfdj.com']
    },
    'IsoftBet': {
        label: 'IsoftBet',
        matches: ['isoftbet'],
        to: ['isb_techsupport@IGT.com']
    },
    'IWG': {
        label: 'IWG',
        matches: ['iwg', 'instant win'],
        to: ['support@instantwingaming.com', 'priority1@instantwingaming.com']
    },
    'PayPal': {
        label: 'PayPal',
        matches: ['paypal'],
        to: ['merchanttechsupport@paypal.com', 'twallace@paypal.com', 'dwheatleytuck@paypal.com']
    },
    'Gambyt MSL/NHL': {
        label: 'Gambyt (MSL + NHL hosting)',
        matches: ['gambyt'],
        environments: ['MSL', 'NHL'],
        to: [
            'sue.crawford@gambyt.com',
            'lawrence.adams@gambyt.com',
            'jessica.martin@gambyt.com',
            'danny.bogus@gambyt.com'
        ]
    },
    'Gambyt MASSL': {
        label: 'Gambyt (MASSL hosting)',
        matches: ['gambyt'],
        environments: ['MASSL'],
        to: [
            'katie.paugh@gambyt.com',
            'Katlin.olmstead@gambyt.com',
            'Paul.Green@gambyt.com',
            'danny.bogus@gambyt.com'
        ]
    },
    'Brightstar MSL': {
        label: 'Brightstar (MSL)',
        matches: ['brightstar', 'brighstar'],
        environments: ['MSL'],
        to: ['michigan.ops@brightstarlottery.com']
    },
    'Brightstar': {
        label: 'Brightstar (general)',
        matches: ['brightstar', 'brighstar'],
        to: ['REN.Ops@brightstarlottery.com']
    },
    'Evolution': {
        label: 'Evolution (games provider)',
        matches: ['evolution'],
        to: ['SERVICEDESK@EVOLUTION.COM']
    }
};

// Dedicated outreach contacts for NG-LOT and USLOT lotteries. Lotteries absent
// from this map fall back to the To list of their critical notification.
const LOTTERY_OUTREACH_CONTACTS = {
    'NGL:JSC': [
        'jsc.oper@jogossantacasa.pt',
        'claudia.duarte@jogossantacasa.pt',
        'alexandre.lopes@jogossantacasa.pt'
    ],
    'NGL:Olifeja': [
        'loreta.balandyte@perlasnetwork.lt',
        'tomas.norusis@perlasnetwork.lt'
    ],
    'NGL:UNL': [
        'Pavel.Solovyov@unl.ua',
        'andrey.bochkovskiy@unl.ua',
        'Olga.Logvinenko@unl.ua',
        'igor.shashkov@unl.ua'
    ],
    'NGL:Win2Day': [
        'operations@win2day.at',
        'valentin.suetzl@win2day.at',
        'florian.ernst@win2day.at',
        'christoph.wehofer@lotterien.at',
        'wolfgang.volgger@win2day.at',
        'fabian.sieghart@win2day.at'
    ],
    'NGL:SzZrt': [
        'it_incmen@szerencsejatek.hu',
        'e-channel_operator@szerencsejatek.hu',
        'e-channel_operator@szerencsejatek.hu'
    ],
    'Atlantic City': ['it.operations@ALC.ca'],
    'IGT Georgia': ['REN.Ops@brightstarlottery.com']
};

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
    module.exports = {
        LOTTERY_OUTREACH_CONTACTS,
        OUTREACH_CC,
        VENDOR_CONTACTS,
        getLotteryOutreachRecipients,
        getVendorRecipients,
        suggestVendor
    };
}

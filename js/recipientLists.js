/**
 * Critical-notification recipient lists transcribed from the NOC playbook.
 *
 * Important: spelling, capitalization, ordering, and duplicate entries are
 * intentionally preserved. The universal NOC Shift Leaders alias is the only
 * exception: it is guaranteed to appear exactly once in each final CC list.
 */

function emailList(value) {
    return value.trim().split(/\s+/);
}

const NPI_COMMON_RECIPIENTS = {
    to: emailList(`
        Jennifer.Ekholtz@aristocrat.com
    `),
    cc: emailList(`
        i-lotteryleadership@aristocrat.com
        TechOps@aristocrat.com
        noc-ng@aristocrat.com
        BATeam@aristocrat.com
        NG_TechOps@aristocrat.com
        NG_ServiceOps@aristocrat.com
        NOCShiftLeaders@aristocrat.com
        Chris.Shaban@aristocrat.com
        Trish.Parker@aristocrat.com
        daniel.odonoghue@aristocrat.com
    `)
};

// Confirmed by the NOC operator; do not infer NPI membership from geography.
const NPI_CUSTOMERS = new Set(['AGLC', 'NCEL', 'VAL', 'WV']);
const REQUIRED_CC_RECIPIENT = 'NOCShiftLeaders@aristocrat.com';

const NGL_STANDARD_CC = emailList(`
    NG_TechOps@aristocrat.com
    liudmyla.korniienko@aristocrat.com
    tomer.ozeri@aristocrat.com
    oleksii.basov@aristocrat.com
    mariia.mosiichuk@aristocrat.com
    bogdan.oliinyk@aristocrat.com
    galit.morash@aristocrat.com
    oleksandr.astakhov@aristocrat.com
    maryna.skliar@aristocrat.com
    NOCShiftLeaders@aristocrat.com
    NG_ServiceOps@aristocrat.com
    noc-ng@aristocrat.com
    mariia.mosiichuk@aristocrat.com
    Chris.Shaban@aristocrat.com
    Trish.Parker@aristocrat.com
    daniel.odonoghue@aristocrat.com
`);

const NGL_TURKEY_STANDARD_CC = emailList(`
    NG_TechOps@aristocrat.com
    Liudmyla.Korniienko@aristocrat.com
    Tomer.Ozeri@aristocrat.com
    oleksii.basov@aristocrat.com
    mariia.mosiichuk@aristocrat.com
    Galit.Morash@aristocrat.com
    Yuliia.Poltavets@aristocrat.com
    Oleksandr.Astakhov@aristocrat.com
    maryna.skliar@aristocrat.com
    Aida.Bachner@aristocrat.com
    Oleksandr.Astakhov@aristocrat.com
    NOCShiftLeaders@aristocrat.com
    NG_ServiceOps@aristocrat.com
    noc-ng@aristocrat.com
    mariia.mosiichuk@aristocrat.com
    Chris.Shaban@aristocrat.com
    Trish.Parker@aristocrat.com
    daniel.odonoghue@aristocrat.com
`);

// Alessandro Galli has two addresses; the operator confirmed both are used
// for each Turkish Sisal group.
const NGL_SISAL_SPORTS_TO = emailList(`
    gloria.balestreri@fluttersea.com
    evren.kiragasi@sisalsans.com
    emre.celik@sisalsans.com
    alessandro.galli@fluttersea.com
    alessandro.galli@sisal.it
    francesca.iannibelli@fluttersea.com
`);

const NGL_SISAL_HORSE_RACING_TO = emailList(`
    emre.celik@sisalsans.com
    gloria.balestreri@fluttersea.com
    alessandro.centaro@fluttersea.com
    alessandro.galli@sisal.it
    alessandro.galli@sisal.it
    alessandro.galli@fluttersea.com
`);

const RECIPIENT_LISTS = {
    'MASSL': {
        to: emailList(`
            daniel.odonoghue@aristocrat.com
            mbracken@masslottery.com
            cteja@masslottery.com
            shawn.thorp@aristocrat.com
            Brian.Smith@aristocrat.com
            anna.pavlenko@aristocrat.com
            MarisaLourdes.Polanco@aristocrat.com
            Trish.Parker@aristocrat.com
            mark.page@aristocrat.com
            Ryan.Eddy@Aristocrat.com
            nate.sullivan@aristocrat.com
            jessie.teague@aristocrat.com
            jrinkacs@masslottery.com
            fcarreiro@masslottery.com
            lgiffen@masslottery.com
            smartins@masslottery.com
            Savannah.Plaisted@aristocrat.com
        `),
        cc: emailList(`
            i-lotteryleadership@aristocrat.com
            TechOps@aristocrat.com
            noc-ng@aristocrat.com
            BATeam@aristocrat.com
            NG_TechOps@aristocrat.com
            NG_ServiceOps@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            Chris.Shaban@aristocrat.com
            Trish.Parker@aristocrat.com
        `)
    },
    'NCEL': {
        to: emailList(`
            Anat.Landes@aristocrat.com
            GamingSupport@lotterync.net
            npicriticalnotification@neopollard.com
            daniel.odonoghue@aristocrat.com
        `),
        cc: emailList(`
            Randy.Spielman@lotterync.net
            DBGAlerts@aristocrat.com
        `)
    },
    'NHL': {
        to: emailList(`
            david.mildenberg@aristocrat.com
            NHiLotteryCriticalIncidentNotification@lottery.nh.gov
            Jenny.Aharonov@aristocrat.com
            Mark.Page@aristocrat.com
            NHLeadership@aristocrat.com
            playersupport@aristocrat.com
            complianceoperations@aristocrat.com
            NHLeadership@aristocrat.com
            playersupport@aristocrat.com
            complianceoperations@aristocrat.com
            Daniel.Silverman@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `),
        cc: emailList(`
            DBGAlerts@aristocrat.com
        `)
    },
    'VAL': {
        to: emailList(`
            lena.benel@aristocrat.com
            Meirav.Hershkovitz@aristocrat.com
            criticalincidentNPi@VALottery.com
            Anat.Landes@aristocrat.com
            andrew.eckard@neopollard.com
            IDSMonitoring@VALOTTERY.COM
            NPiCriticalNotification@neopollard.com
            Ronen.Irani@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `),
        cc: emailList(`
            SCleaton@VALOTTERY.COM
            DBGAlerts@aristocrat.com
        `)
    },
    'MSL': {
        to: emailList(`
            liat.horev@aristocrat.com
            lena.benel@aristocrat.com
            Critical.Issues@michiganlottery.com
            millera17@michigan.gov
            heather.calahan@aristocrat.com
            critical.issues@michiganlottery.gov
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `),
        cc: emailList(`
            DBGAlerts@aristocrat.com
        `)
    },
    'AGLC': {
        to: emailList(`
            NPiNotifications@aglc.ca
            yana.todosiienko@aristocrat.com
            liat.horev@aristocrat.com
            sport-ilottery-criticalnotification@aristocrat.com
            NPiCriticalNotification@neopollard.com
            AGLCchangemanagement@neopollard.com
            Ronen.Irani@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `),
        cc: emailList(`
            audrey.medalsy@neopollard.com
            nolan.beck@neopollard.com
            ohad.shlomoff@aristocrat.com
            yaniv.brosh@aristocrat.com
            daniel.silverman@aristocrat.com
            olga.dmytrenko@aristocrat.com
            vitalii.kuznietsov@aristocrat.com
            alexandr.tatarikov@aristocrat.com
            serhiy.stetsyk@aristocrat.com
            dmytro.lykov@aristocrat.com
            maksym.diachenko@aristocrat.com
            noc@pariplayltd.com
            rebecca.avrahami@aristocrat.com
            ofer.cherkez@aristocrat.com
            Ilan.Probak@aristocrat.com
        `)
    },
    'WV': {
        to: emailList(`
            tdunford@wvlottery.com
            mkline@wvlottery.com
            dlamar@wvlottery.com
            dstroup@wvlottery.com
            rburnside@wvlottery.com
            dbradley@wvlottery.com
            tdunford@wvlottery.com
            dstroup@wvlottery.com
        `),
        cc: emailList(`
            TechOps@aristocrat.com
            Ilan.Probak@aristocrat.com
            NG_ServiceOps@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            NOC-NG@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    },
    'SZ': {
        to: emailList(`
            sazkanotification@aristocrat.com
        `),
        cc: emailList(`
            liudmyla.korniienko@aristocrat.com
            oleksii.basov@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            bogdan.oliinyk@aristocrat.com
            oleksandr.astakhov@aristocrat.com
            maryna.skliar@aristocrat.com
            NG_TechOps@aristocrat.com
            aida.bachner@aristocrat.com
            tomer.ozeri@aristocrat.com
            anastacia.benshalom@aristocrat.com
            Ilan.Probak@aristocrat.com
            kyrylo.plyhunov@aristocrat.com
            kyrylo.filimonov@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            TechOps@aristocrat.com
            NG_ServiceOps@aristocrat.com
            noc-ng@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            Chris.Shaban@aristocrat.com
            Ronen.Irani@aristocrat.com
            Jennifer.Ekholtz@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    },
    'PL': {
        to: emailList(`
            Travis.Clutter@aristocrat.com
            operations@playlive.com
            tajbik.sheikh@livech.com
            steve.nathan@livech.com
            heidi.hamers@livech.com
            erin.youngblood@livech.com
            colleen.richarts@livech.com
            amanda.delizzio@livech.com
            B2B-OPS@aristocrat.com
            Anton.Grinberg@aristocrat.com
            Asif.Rot@aristocrat.com
            Bogdan.Shmorgun@aristocrat.com
            Chen.Dudu@aristocrat.com
            NG_TechOps@aristocrat.com
            Dimitri.DiGiacomo@btobet.com
            Doron.Mor@aristocrat.com
            Ihor.Khoroshok@aristocrat.com
            Ilan.Probak@aristocrat.com
            Ivan.Mekhed@aristocrat.com
            Kostiantyn.Maslovskyi@aristocrat.com
            NOC@aristocrat.com
            Ofer.Moldovan@aristocrat.com
            Oz.Goldberg@aristocrat.com
            Quincy.Raven@aristocrat.com
            Rostyslav.Malakhovskyi@aristocrat.com
            Sagi.Lavian@aristocrat.com
            Stanislav.Sokolov@aristocrat.com
            Vadym.Savchuk@aristocrat.com
            cs-playlive@aristocrat.com
            max.henning@livech.com
            Jeremy.Mumford@aristocrat.com
            Jesus.Menjibar@aristocrat.com
            Ronen.Irani@aristocrat.com
            PlayLive-CriticalNotifications@aristocrat.com
            Trish.Parker@aristocrat.com
            Trish.Parker@aristocrat.com
        `),
        cc: emailList(`
            TechOps@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            eitan.shein@aristocrat.com
            adi.chemerinsky@aristocrat.com
            lee.azran@aristocrat.com
            Chris.Shaban@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    },
    'FK-MI': {
        to: emailList(`
            FKC-Critical-Incident@aristocrat.com
            DL-Firekeepers-Critical-Incident@aristocrat.com
            bjbouschor@firekc.com
            CJHays@firekc.com
            dgarcia@firekc.com
            jkopka@firekc.com
            jwise@firekc.com
            dploehn@firekc.com
        `),
        cc: emailList(`
            TechOps@aristocrat.com
            Ilan.Probak@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            anton.kohutiak@aristocrat.com
            adi.chemerinsky@aristocrat.com
            lee.azran@aristocrat.com
            Chris.Shaban@aristocrat.com
            NG_TechOps@aristocrat.com
            B2B-OPS@aristocrat.com
            Ronen.Irani@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    },
    'NGL:Sisal IT': {
        to: emailList(`
            sjopemi@sisal.it
            svope@sisal.it
            frontend_dgs@sisal.it
            _dlbeintegration@sisal.it
            IT_OPS_Application_Deployment@sisal.it
            IT_OPS_Application_Deployment@sisal.it
            IT_OPS_Content_Delivery@sisal.it
            IT_OPS_Content_Delivery@sisal.it
            IT_OPS_B2C-DSA@sisal.it
            IT_OPS_B2C-DSA@sisal.it
        `),
        cc: NGL_STANDARD_CC
    },
    'NGL:Sisal TR': {
        to: emailList(`
            valentina.agostini@sisal.it
            aurelio.curiale@sisal.it
            lavinia.pecelli@sisal.it
            dario.castronovo@sisal.it
            nese.ciddi@sisalsans.com
            seren.bilge@sisalsans.com
            emre.celik@sisalsans.com
            berfu.kuskonmaz@sisalsans.com
            Ron.Tsadikov@aristocrat.com
        `),
        cc: NGL_STANDARD_CC
    },
    'NGL:Bitalih': {
        to: emailList(`
            francesca.iannibelli@sisal.it
            michele.roncaglia@sisal.it
            rahman@bitalih.com
            valentina.agostini@sisal.it
            aurelio.curiale@sisal.it
            lavinia.pecelli@sisal.it
            dario.castronovo@sisal.it
            nese.ciddi@sisalsans.com
            seren.bilge@sisalsans.com
            emre.celik@sisalsans.com
            berfu.kuskonmaz@sisalsans.com
            Ron.Tsadikov@aristocrat.com
        `),
        cc: NGL_TURKEY_STANDARD_CC
    },
    'NGL:Hipodrom': {
        to: emailList(`
            firstline@hipodrom.com
            gokalp.tufekli@hipodrom.com
            aysu.kirimli@hipodrom.com
            emre.celik@sisalsans.com
            berfu.kuskonmaz@sisalsans.com
            Ron.Tsadikov@aristocrat.com
        `),
        cc: NGL_TURKEY_STANDARD_CC
    },
    'NGL:Sisal Misli': { to: NGL_SISAL_SPORTS_TO, cc: NGL_TURKEY_STANDARD_CC },
    'NGL:Sisal Nesine': { to: NGL_SISAL_SPORTS_TO, cc: NGL_TURKEY_STANDARD_CC },
    'NGL:Sisal Bilyoner': { to: NGL_SISAL_SPORTS_TO, cc: NGL_TURKEY_STANDARD_CC },
    'NGL:Sisal Atili Ganyan': { to: NGL_SISAL_HORSE_RACING_TO, cc: NGL_TURKEY_STANDARD_CC },
    'NGL:Sisal At Yarisi': { to: NGL_SISAL_HORSE_RACING_TO, cc: NGL_TURKEY_STANDARD_CC },
    'NGL:JSC': {
        to: emailList(`
            anastacia.benshalom@aristocrat.com
            celia.godinho@scml.pt
            patricia.silva@scml.pt
            susana.c.rodrigues@scml.pt
            nuno.valentim@scml.pt
            luis.m.tavares@scml.pt
            aida.bachner@aristocrat.com
            sac@nossaaposta.pt
        `),
        cc: NGL_STANDARD_CC
    },
    'NGL:Olifeja': {
        to: emailList(`
            augusta.gikaite@perlasnetwork.lt
            indre.kvikliene@perlasnetwork.lt
            galit.morash@aristocrat.com
            tomas.norusis@perlasnetwork.lt
            Tsvetomir.Sabkov@aristocrat.com
            aida.bachner@aristocrat.com
        `),
        cc: NGL_STANDARD_CC
    },
    'NGL:UNL': {
        to: emailList(`
            pavel.solovyov@unl.ua
            igor.shashkov@unl.ua
            kimunitex@gmail.com
        `),
        cc: NGL_STANDARD_CC
    },
    'NGL:Win2Day': {
        to: emailList(`
            operations@win2day.at
        `),
        cc: emailList(`
            wolfgang.volgger@win2day.at
            valentin.suetzl@win2day.at
            fabian.sieghart@win2day.at
            christoph.wehofer@lotterien.at
            NOCShiftLeaders@aristocrat.com
            NG_TechOps@aristocrat.com
            NG_ServiceOps@aristocrat.com
            noc-ng@aristocrat.com
            Tsvetomir.Sabkov@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            Chris.Shaban@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    },
    'NGL:SzZrt': {
        to: emailList(`
            it_incmen@szerencsejatek.hu
        `),
        cc: emailList(`
            ohad.shlomoff@aristocrat.com
            alexeyd@aristocrat.com
            NG_TechOps@aristocrat.com
            oleksii.basov@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            oleksandr.astakhov@neogames
            yevhen.kuzmin@aristocrat.com
            kateryna.kharchenko@aristocrat.com
            ron.tsadikov@aristocrat.com
            liudmyla.korniienko@aristocrat.com
            yaniv.brosh@aristocrat.com
            aida.bachner@aristocrat.com
            guy.haimovich@aristocrat.com
            avi.cohen@aristocrat.com
            BATeam@aristocrat.com
            tomer.ozeri@aristocrat.com
            yuliia.poltavets@aristocrat.com
            jenny.aharonov@aristocrat.com
            galit.morash@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            NG_ServiceOps@aristocrat.com
            noc-ng@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            Chris.Shaban@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    },
    'CRO': {
        to: emailList(`
            Ivana.Vuletic@lutrija.hr
            Natasa.Bosanac@lutrija.hr
            anastacia.benshalom@aristocrat.com
            aida.bachner@aristocrat.com
        `),
        cc: emailList(`
            NG_TechOps@aristocrat.com
            liudmyla.korniienko@aristocrat.com
            tomer.ozeri@aristocrat.com
            oleksii.basov@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            bogdan.oliinyk@aristocrat.com
            galit.morash@aristocrat.com
            oleksandr.astakhov@aristocrat.com
            maryna.skliar@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            NG_ServiceOps@aristocrat.com
            noc-ng@aristocrat.com
            Tsvetomir.Sabkov@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            Chris.Shaban@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    },
    'Atlantic City': {
        to: emailList(`
            galit.morash@aristocrat.com
            it.operations@ALC.ca
        `),
        cc: emailList(`
            NG_TechOps@aristocrat.com
            aida.bachner@aristocrat.com
            ohad.shlomoff@aristocrat.com
            tomer.ozeri@aristocrat.com
            roman.slyvka@aristocrat.com
            oleksii.basov@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            oleksandr.astakhov@aristocrat.com
            yevhen.kuzmin@aristocrat.com
            kateryna.kharchenko@aristocrat.com
            ron.tsadikov@aristocrat.com
            liudmyla.korniienko@aristocrat.com
            yaniv.brosh@aristocrat.com
            aida.bachner@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            NG_ServiceOps@aristocrat.com
            noc-ng@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            Chris.Shaban@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    },
    'IGT Georgia': {
        to: emailList(`
            GANEOPRODSupportTeam@igt.com
        `),
        cc: emailList(`
            aida.bachner@aristocrat.com
            ohad.shlomoff@aristocrat.com
            tomer.ozeri@aristocrat.com
            roman.slyvka@aristocrat.com
            oleksii.basov@aristocrat.com
            NG_TechOps@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            oleksandr.astakhov@aristocrat.com
            yevhen.kuzmin@aristocrat.com
            kateryna.kharchenko@aristocrat.com
            ron.tsadikov@aristocrat.com
            liudmyla.korniienko@aristocrat.com
            yaniv.brosh@aristocrat.com
            aida.bachner@aristocrat.com
            galit.morash@aristocrat.com
            anastacia.benshalom@aristocrat.com
            NOCShiftLeaders@aristocrat.com
            NG_ServiceOps@aristocrat.com
            noc-ng@aristocrat.com
            mariia.mosiichuk@aristocrat.com
            Chris.Shaban@aristocrat.com
            Trish.Parker@aristocrat.com
            daniel.odonoghue@aristocrat.com
        `)
    }
};

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
    module.exports = {
        NPI_COMMON_RECIPIENTS,
        NPI_CUSTOMERS,
        REQUIRED_CC_RECIPIENT,
        RECIPIENT_LISTS,
        formatRecipientList,
        getRecipientKey,
        getRecipientList
    };
}

/**
 * Utility functions and lottery configuration.
 * Operators always enter incident times in Israel local time. Those wall-clock
 * values are converted to the selected lottery's timezone for the email.
 */

const SOURCE_TIMEZONE = 'Asia/Jerusalem';
const EMAIL_IMAGE_PATHS = [
    'images/banner-opening.png',
    'images/banner-resolved.png'
];
const emailImageSources = new Map();

const LOTTERY_CONFIG = {
    'AGLC': { displayName: 'AGLC', jiraPrefix: 'AGLC', timezone: 'America/Edmonton', format: 'us' },
    'CRO': { displayName: 'CRO', jiraPrefix: 'CRO', timezone: 'Europe/Zagreb', format: 'eu' },
    'FK-MI': { displayName: 'FK-MI', jiraPrefix: 'FKC', timezone: 'America/Detroit', format: 'us' },
    'MASSL': { displayName: 'MASSL', jiraPrefix: 'MASSL', timezone: 'America/New_York', format: 'us' },
    'MSL': { displayName: 'MSL', jiraPrefix: 'MSL', timezone: 'America/Detroit', format: 'us' },
    'NCEL': { displayName: 'NCEL', jiraPrefix: 'NCEL', timezone: 'America/New_York', format: 'us' },
    'NHL': { displayName: 'NHL', jiraPrefix: 'NHL', timezone: 'America/New_York', format: 'us' },
    'PL': { displayName: 'PL', jiraPrefix: 'PL', timezone: 'America/New_York', format: 'us' },
    'SZ': { displayName: 'SZ', jiraPrefix: 'SZ', timezone: 'Europe/Prague', format: 'eu' },
    'VAL': { displayName: 'VAL', jiraPrefix: 'VAL', timezone: 'America/New_York', format: 'us' },
    'WV': { displayName: 'WV', jiraPrefix: 'WV', timezone: 'America/New_York', format: 'us' },
    'IGT Georgia': { displayName: 'IGT Georgia', jiraPrefix: 'GAL', timezone: 'America/New_York', format: 'us', fixedDropInBets: true },
    'Atlantic City': { displayName: 'Atlantic City', jiraPrefix: 'ALC', timezone: 'America/New_York', format: 'us', fixedDropInBets: true },

    // Lotteries operating under NG-LOT. Jira projects are not always NGL.
    'NGL:Sisal IT': { displayName: 'Sisal IT', jiraPrefix: 'NGL', timezone: 'Europe/Rome', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:Sisal TR': { displayName: 'Sisal TR', jiraPrefix: 'NGL', timezone: 'Europe/Istanbul', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:Olifeja': { displayName: 'Olifeja', jiraPrefix: 'NGL', timezone: 'Europe/Vilnius', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:Win2Day': { displayName: 'Win2Day', jiraPrefix: 'NGL', timezone: 'Europe/Vienna', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:OPAP': { displayName: 'OPAP', jiraPrefix: 'NGL', timezone: 'Europe/Athens', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:SzZrt': { displayName: 'SzZrt', jiraPrefix: 'HUN', timezone: 'Europe/Budapest', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:Bitalih': { displayName: 'Bitalih', jiraPrefix: 'NGL', timezone: 'Europe/Istanbul', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:Hipodrom': { displayName: 'Hipodrom', jiraPrefix: 'NGL', timezone: 'Europe/Istanbul', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:JSC': { displayName: 'JSC', jiraPrefix: 'NGL', timezone: 'Europe/Lisbon', format: 'eu', ngLot: true, fixedDropInBets: true },
    'NGL:UNL': { displayName: 'UNL', jiraPrefix: 'UNL', timezone: 'Europe/Kyiv', format: 'eu', ngLot: true, fixedDropInBets: true }
};

/**
 * Resolve the selected form values into one business context.
 */
function getLotteryContext(environment, nglSite = '', customPrefix = '') {
    if (environment === 'other') {
        const jiraPrefix = customPrefix.trim().toUpperCase();
        return jiraPrefix ? {
            displayName: jiraPrefix,
            jiraPrefix,
            timezone: SOURCE_TIMEZONE,
            format: 'eu',
            custom: true
        } : null;
    }

    const key = environment === 'NGL' ? `NGL:${nglSite}` : environment;
    return LOTTERY_CONFIG[key] || null;
}

/**
 * Format a report date without allowing the browser timezone to shift its day.
 */
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return '';

    const date = new Date(Date.UTC(year, month - 1, day));
    const monthName = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });

    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    else if (day % 10 === 2 && day !== 12) suffix = 'nd';
    else if (day % 10 === 3 && day !== 13) suffix = 'rd';

    return `${monthName} ${day}${suffix}`;
}

/**
 * Activity Summary notifications are raised in Israel on the calendar day
 * after the US report date.
 */
function formatPreviousDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return '';

    const previousDate = new Date(Date.UTC(year, month - 1, day));
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    return formatDate(previousDate.toISOString().slice(0, 10));
}

function getZonedParts(date, timezone) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    });

    return Object.fromEntries(
        formatter.formatToParts(date)
            .filter(part => part.type !== 'literal')
            .map(part => [part.type, part.value])
    );
}

/**
 * Interpret a datetime-local value as a wall-clock time in a named timezone.
 * This avoids depending on the workstation's configured timezone.
 */
function zonedDateTimeToDate(datetimeString, timezone = SOURCE_TIMEZONE) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(datetimeString);
    if (!match) return null;

    const [, year, month, day, hour, minute] = match.map(Number);
    const desiredWallTime = Date.UTC(year, month - 1, day, hour, minute, 0);
    let instant = new Date(desiredWallTime);

    // Offset calculation is iterative because the target date can cross a DST
    // boundary relative to the initial UTC guess.
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const parts = getZonedParts(instant, timezone);
        const actualWallTime = Date.UTC(
            Number(parts.year),
            Number(parts.month) - 1,
            Number(parts.day),
            Number(parts.hour),
            Number(parts.minute),
            Number(parts.second)
        );
        const correction = desiredWallTime - actualWallTime;
        if (correction === 0) break;
        instant = new Date(instant.getTime() + correction);
    }

    const finalParts = getZonedParts(instant, timezone);
    const matchesInput = Number(finalParts.year) === year
        && Number(finalParts.month) === month
        && Number(finalParts.day) === day
        && Number(finalParts.hour) === hour
        && Number(finalParts.minute) === minute;

    return matchesInput ? instant : null;
}

function getGMTOffsetForTimezone(date, timezone) {
    const parts = getZonedParts(date, timezone);
    const zonedAsUTC = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second)
    );
    return Math.round((zonedAsUTC - date.getTime()) / 60000);
}

function formatGMTOffset(offsetMinutes) {
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absoluteMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absoluteMinutes / 60);
    const minutes = absoluteMinutes % 60;
    return `${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
}

/**
 * Convert an Israel-local input to the selected lottery's local date and time.
 */
function formatDateTime(datetimeString, lotteryContext) {
    if (!datetimeString || !lotteryContext) return '';

    const date = zonedDateTimeToDate(datetimeString, SOURCE_TIMEZONE);
    if (!date) return '';

    const isUSFormat = lotteryContext.format === 'us';
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: lotteryContext.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: isUSFormat,
        hourCycle: isUSFormat ? undefined : 'h23'
    });
    const parts = Object.fromEntries(
        formatter.formatToParts(date)
            .filter(part => part.type !== 'literal')
            .map(part => [part.type, part.value])
    );

    const dateText = isUSFormat
        ? `${parts.month}/${parts.day}/${parts.year}`
        : `${parts.day}/${parts.month}/${parts.year}`;
    const timeText = isUSFormat
        ? `${parts.hour}:${parts.minute} ${parts.dayPeriod}`
        : `${parts.hour}:${parts.minute}`;
    const offset = formatGMTOffset(getGMTOffsetForTimezone(date, lotteryContext.timezone));

    return `${dateText} ${timeText} (GMT${offset})`;
}

function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result));
        reader.addEventListener('error', () => reject(reader.error));
        reader.readAsDataURL(blob);
    });
}

/**
 * Preload email images as data URLs so pasted Outlook content contains the
 * image itself instead of a link back to the generator.
 */
async function preloadEmailImages() {
    await Promise.all(EMAIL_IMAGE_PATHS.map(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Unable to load email image: ${path}`);
        emailImageSources.set(path, await blobToDataURL(await response.blob()));
    }));
}

function getEmailImageSource(path) {
    return emailImageSources.get(path) || path;
}

function htmlToPlainText(htmlContent) {
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    return container.innerText;
}

function copyToClipboard(htmlContent, successCallback, errorCallback) {
    let copyPromise;

    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([htmlToPlainText(htmlContent)], { type: 'text/plain' });
        copyPromise = navigator.clipboard.write([
            new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })
        ]);
    } else {
        copyPromise = navigator.clipboard.writeText(htmlToPlainText(htmlContent));
    }

    copyPromise
        .then(() => successCallback?.())
        .catch(error => errorCallback?.(error));
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LOTTERY_CONFIG,
        SOURCE_TIMEZONE,
        escapeHTML,
        formatDate,
        formatDateTime,
        formatPreviousDate,
        formatGMTOffset,
        getGMTOffsetForTimezone,
        getLotteryContext,
        getEmailImageSource,
        zonedDateTimeToDate
    };
}

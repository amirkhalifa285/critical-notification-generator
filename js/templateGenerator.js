/**
 * Template Generator
 * Functions to generate email HTML templates
 */

/**
 * Add sentence punctuation without producing duplicate periods for custom text.
 * Values passed into this file have already been HTML escaped.
 */
function withPeriod(value) {
    const trimmedValue = value.trim();
    return /[.!?]$/.test(trimmedValue) ? trimmedValue : `${trimmedValue}.`;
}

function generateBannerHTML(emailType) {
    const isResolved = emailType === 'resolved';
    const path = isResolved ? 'images/banner-resolved.png' : 'images/banner-opening.png';
    const width = isResolved ? 828 : 848;
    const alt = isResolved ? 'Critical Notification - Resolved' : 'Critical Notification';
    const source = typeof getEmailImageSource === 'function' ? getEmailImageSource(path) : path;

    return `<img src="${source}" alt="${alt}" width="${width}" style="display: block; width: 100%; max-width: ${width}px; height: auto; margin: 0 0 20px 0;">`;
}

/**
 * Build the impact-only detail used by interruption notifications.
 */
function generateInterruptionImpact(issueDescription, frequencyMinutes, durationMinutes, emailType) {
    const durationUnit = Number(durationMinutes) === 1 ? 'minute' : 'minutes';
    const timingText = emailType === 'resolved'
        ? `Happened every ~${frequencyMinutes} minutes and lasted less than ~${durationMinutes} ${durationUnit} each time`
        : `Happening every ~${frequencyMinutes} minutes and lasts less than ~${durationMinutes} ${durationUnit} each time`;

    return `${issueDescription} (${timingText}, causing a drop in betting activity)`;
}

/**
 * Generate HTML for an ongoing Report notification
 * @param {string} reportName - Name of the report
 * @param {string} reportDate - Formatted date of the report
 * @returns {string} HTML string
 */
function generateReportOpeningHTML(reportName, reportDate) {
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
        ${generateBannerHTML('ongoing')}
        <p style="margin-bottom: 15px;">This is to inform you that our monitoring systems have detected: The report <b>${reportName}</b> for <b>${reportDate}</b> is being delayed.</p>
        <p style="margin-bottom: 15px;"><u>Impact Description:</u> The report ${reportName} for ${reportDate} is being delayed.</p>
        <p style="margin-bottom: 15px;"><u>Root Cause:</u> Under Aristocrat BI team investigation.</p>
        <p style="margin-bottom: 15px;">Further updates will be provided once available.</p>
    </div>`;
}

/**
 * Generate HTML for Report Resolved notification
 * @param {string} reportName - Name of the report
 * @param {string} reportDate - Formatted date of the report
 * @returns {string} HTML string
 */
function generateReportResolvedHTML(reportName, reportDate) {
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
        ${generateBannerHTML('resolved')}
        <p style="margin-bottom: 15px;">This is to inform you that our monitoring systems have detected: The report <b>${reportName}</b> for <b>${reportDate}</b> is being delayed. <b>The issue has been resolved.</b></p>
        <p style="margin-bottom: 15px;"><u>Impact Description:</u> The report ${reportName} for ${reportDate} is being delayed.</p>
        <p style="margin-bottom: 15px;"><u>Root Cause:</u> Under Aristocrat BI team investigation.</p>
        <p style="margin-bottom: 15px;">More details will be provided in the incident report.</p>
    </div>`;
}

/**
 * Generate HTML for an ongoing System Issue notification
 * @param {string} issueDescription - Description of the issue without precentage
 * @param {string} issueDescriptionWithPercent - Description with percentage (for Impact only)
 * @param {string} startTime - Formatted start time (optional)
 * @param {string} rootCause - Root cause description
 * @returns {string} HTML string
 */
function generateSystemOpeningHTML(issueDescription, issueDescriptionWithPercent, startTime, rootCause) {
    let timeText = '';
    if (startTime) {
        timeText = `<p style="margin-bottom: 15px;">The issue started at ${startTime} and is currently ongoing.</p>`;
    }
    
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
        ${generateBannerHTML('ongoing')}
        <p style="margin-bottom: 15px;">This is to inform you that our monitoring systems have detected: <b>${withPeriod(issueDescription)}</b></p>
        ${timeText}
        <p style="margin-bottom: 15px;"><u>Impact description:</u> ${withPeriod(issueDescriptionWithPercent)}</p>
        <p style="margin-bottom: 15px;"><u>Root cause:</u> ${withPeriod(rootCause || 'Under investigation')}</p>
        <p style="margin-bottom: 15px;">Further updates will be provided once available.</p>
    </div>`;
}

/**
 * Generate HTML for System Issue Resolved notification
 * @param {string} issueDescription - Description without percentage
 * @param {string} issueDescriptionWithPercent - Description with percentage (for Impact only)
 * @param {string} startTime - Formatted start time (optional)
 * @param {string} endTime - Formatted end time (optional)
 * @param {string} rootCause - Root cause description
 * @returns {string} HTML string
 */
function generateSystemResolvedHTML(issueDescription, issueDescriptionWithPercent, startTime, endTime, rootCause) {
    let timeSection = '';
    if (startTime || endTime) {
        timeSection = '<div style="margin-bottom: 15px;">';
        if (startTime) {
            timeSection += `<p style="margin-bottom: 5px;"><u>Start time:</u> ${startTime}.</p>`;
        }
        if (endTime) {
            timeSection += `<p style="margin-bottom: 5px;"><u>End time:</u> ${endTime}.</p>`;
        }
        timeSection += '</div>';
    }
    
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
        ${generateBannerHTML('resolved')}
        <p style="margin-bottom: 15px;">This is to inform you that our monitoring systems have detected: <b>${withPeriod(issueDescription)}</b></p>
        <p style="margin-bottom: 15px;"><b>The issue has been resolved.</b></p>
        ${timeSection}
        <p style="margin-bottom: 15px;"><u>Impact description:</u> ${withPeriod(issueDescriptionWithPercent)}</p>
        <p style="margin-bottom: 15px;"><u>Root cause:</u> ${withPeriod(rootCause || 'Under investigation')}</p>
        <p style="margin-bottom: 15px;">Further updates will be provided in the incident report.</p>
    </div>`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateReportOpeningHTML,
        generateReportResolvedHTML,
        generateSystemOpeningHTML,
        generateSystemResolvedHTML,
        generateInterruptionImpact,
        generateBannerHTML,
        withPeriod
    };
}

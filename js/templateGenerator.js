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
 * Add the approved-deposit effect only to the Impact description while
 * preserving the shorter issue text used by the subject and detection line.
 */
function generateDepositApprovalImpact(issueDescription, approvedDepositsAffected) {
    if (!approvedDepositsAffected) return issueDescription;

    const viaMatch = /^(.*)\s+via\s+(.+)$/i.exec(issueDescription);
    if (!viaMatch) return issueDescription;

    return `${viaMatch[1]} followed by a decrease in approved deposits via ${viaMatch[2]}`;
}

/**
 * Generate HTML for an ongoing Report notification
 * @param {string} reportName - Name of the report
 * @param {string} reportDate - Formatted date of the report
 * @returns {string} HTML string
 */
function generateReportOpeningHTML(reportName, reportDate) {
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; background-color: #ffffff; color: #000000;">
        ${generateBannerHTML('ongoing')}
        This is to inform you that our monitoring systems have detected: The report <b>${reportName}</b> for <b>${reportDate}</b> is being delayed.<br><br>
        <u>Impact Description:</u> The report ${reportName} for ${reportDate} is being delayed.<br><br>
        <u>Root Cause:</u> Under Aristocrat BI team investigation.<br><br>
        Further updates will be provided once available.
    </div>`;
}

/**
 * Generate HTML for Report Resolved notification
 * @param {string} reportName - Name of the report
 * @param {string} reportDate - Formatted date of the report
 * @returns {string} HTML string
 */
function generateReportResolvedHTML(reportName, reportDate) {
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; background-color: #ffffff; color: #000000;">
        ${generateBannerHTML('resolved')}
        This is to inform you that our monitoring systems have detected: The report <b>${reportName}</b> for <b>${reportDate}</b> is being delayed. <b>The issue has been resolved.</b><br><br>
        <u>Impact Description:</u> The report ${reportName} for ${reportDate} is being delayed.<br><br>
        <u>Root Cause:</u> Under Aristocrat BI team investigation.<br><br>
        More details will be provided in the incident report.
    </div>`;
}

function formatReportFilesHTML(reports) {
    return reports.join('<br>');
}

/**
 * Generate an ongoing missing-regulatory-reports notification for B2B customers.
 */
function generateRegulatoryReportOpeningHTML(frequency, reports, reportDate, detectionTime) {
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; background-color: #ffffff; color: #000000;">
        ${generateBannerHTML('ongoing')}
        This is to inform you that our monitoring systems have detected: <b>Missing Regulatory Reports for ${reportDate}.</b><br><br>
        The issue was detected at ${detectionTime} and is ongoing.<br><br>
        <u>Impact description:</u> The following ${frequency} reports:<br>
        ${formatReportFilesHTML(reports)}<br>
        for ${reportDate} are being delayed.<br><br>
        <u>Root Cause:</u> Under Aristocrat BI team investigation.<br><br>
        Further updates will be provided once available.
    </div>`;
}

/**
 * Generate a resolved missing-regulatory-reports notification for B2B customers.
 */
function generateRegulatoryReportResolvedHTML(frequency, reports, reportDate, detectionTime, endTime) {
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; background-color: #ffffff; color: #000000;">
        ${generateBannerHTML('resolved')}
        This is to inform you that our monitoring systems have detected: <b>Missing Regulatory Reports for ${reportDate}.</b><br>
        <b>The issue has been resolved.</b><br><br>
        <u>Start time:</u> ${detectionTime}.<br>
        <u>End time:</u> ${endTime}.<br><br>
        <u>Impact description:</u> The following ${frequency} reports:<br>
        ${formatReportFilesHTML(reports)}<br>
        for ${reportDate} were delayed.<br><br>
        <u>Root Cause:</u> Under Aristocrat BI team investigation.<br><br>
        Further updates will be provided in the incident report.
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
        timeText = `The issue started at ${startTime} and is currently ongoing.<br><br>`;
    }
    
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; background-color: #ffffff; color: #000000;">
        ${generateBannerHTML('ongoing')}
        This is to inform you that our monitoring systems have detected: <b>${withPeriod(issueDescription)}</b><br><br>
        ${timeText}
        <u>Impact description:</u> ${withPeriod(issueDescriptionWithPercent)}<br><br>
        <u>Root cause:</u> ${withPeriod(rootCause || 'Under investigation')}<br><br>
        Further updates will be provided once available.
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
        if (startTime) {
            timeSection += `<u>Start time:</u> ${startTime}.<br>`;
        }
        if (endTime) {
            timeSection += `<u>End time:</u> ${endTime}.<br>`;
        }
        timeSection += '<br>';
    }
    
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; background-color: #ffffff; color: #000000;">
        ${generateBannerHTML('resolved')}
        This is to inform you that our monitoring systems have detected: <b>${withPeriod(issueDescription)}</b><br>
        <b>The issue has been resolved.</b><br><br>
        ${timeSection}
        <u>Impact description:</u> ${withPeriod(issueDescriptionWithPercent)}<br><br>
        <u>Root cause:</u> ${withPeriod(rootCause || 'Under investigation')}<br><br>
        Further updates will be provided in the incident report.
    </div>`;
}

/**
 * Generate the outreach email sent to a vendor or lottery when an external
 * team is contacted. It has no banner; the NOC engineer adds any error-log
 * findings and requests below the generated lines.
 */
function generateVendorOutreachHTML(issueDescription, startTime) {
    return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; background-color: #ffffff; color: #000000;">
        This is to inform you that our monitoring systems have detected: <b>${withPeriod(issueDescription)}</b><br><br>
        The issue started at ${startTime} and is currently ongoing.<br><br>
    </div>`;
}

function generateVendorOutreachSubject(environmentName, issueDescription) {
    return `Aristocrat NOC - ${environmentName} - ${issueDescription}`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateReportOpeningHTML,
        generateReportResolvedHTML,
        generateRegulatoryReportOpeningHTML,
        generateRegulatoryReportResolvedHTML,
        generateSystemOpeningHTML,
        generateSystemResolvedHTML,
        generateInterruptionImpact,
        generateDepositApprovalImpact,
        generateBannerHTML,
        generateVendorOutreachHTML,
        generateVendorOutreachSubject,
        withPeriod
    };
}

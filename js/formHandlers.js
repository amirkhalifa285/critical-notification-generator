/**
 * Form interactions, validation, and live preview generation.
 */

let currentTemplate = 'system';

const elements = {
    envSelect: document.getElementById('environment'),
    customEnvDiv: document.getElementById('customEnvDiv'),
    customEnvInput: document.getElementById('customEnv'),
    nglSiteGroup: document.getElementById('nglSiteGroup'),
    nglSiteSelect: document.getElementById('nglSite'),
    recipientSection: document.getElementById('recipientSection'),
    recipientFields: document.getElementById('recipientFields'),
    recipientSourceLabel: document.getElementById('recipientSourceLabel'),
    recipientMissing: document.getElementById('recipientMissing'),
    toRecipients: document.getElementById('toRecipients'),
    ccRecipients: document.getElementById('ccRecipients'),
    jiraPrefixHint: document.getElementById('jiraPrefixHint'),
    ticketNumber: document.getElementById('ticketNumber'),
    reportSelect: document.getElementById('reportName'),
    customReportDiv: document.getElementById('customReportDiv'),
    customReportInput: document.getElementById('customReport'),
    reportDate: document.getElementById('reportDate'),
    regulatoryFields: document.getElementById('regulatoryFields'),
    reportFrequency: document.getElementById('reportFrequency'),
    missingReports: document.getElementById('missingReports'),
    reportDetectionTime: document.getElementById('reportDetectionTime'),
    reportEndTimeGroup: document.getElementById('reportEndTimeGroup'),
    reportEndTime: document.getElementById('reportEndTime'),
    issueSelect: document.getElementById('issueDescription'),
    customIssueDiv: document.getElementById('customIssueDiv'),
    customIssueInput: document.getElementById('customIssue'),
    nglIssueHint: document.getElementById('nglIssueHint'),
    issueTargetGroup: document.getElementById('issueTargetGroup'),
    issueTargetLabel: document.getElementById('issueTargetLabel'),
    issueTargetInput: document.getElementById('issueTarget'),
    interruptionDetailsGroup: document.getElementById('interruptionDetailsGroup'),
    interruptionFrequency: document.getElementById('interruptionFrequency'),
    interruptionDuration: document.getElementById('interruptionDuration'),
    percentageGroup: document.getElementById('percentageGroup'),
    percentageInput: document.getElementById('percentageInput'),
    startTime: document.getElementById('startTime'),
    endTime: document.getElementById('endTime'),
    rootCauseSelect: document.getElementById('rootCause'),
    externalTeamDiv: document.getElementById('externalTeamDiv'),
    externalTeamInput: document.getElementById('externalTeam'),
    customRootCauseDiv: document.getElementById('customRootCauseDiv'),
    customRootCauseInput: document.getElementById('customRootCause'),
    form: document.getElementById('emailForm'),
    successMessage: document.getElementById('successMessage'),
    previewContent: document.getElementById('previewContent'),
    reportFields: document.getElementById('reportFields'),
    systemFields: document.getElementById('systemFields'),
    endTimeGroup: document.getElementById('endTimeGroup')
};

function getSelectedContext() {
    return getLotteryContext(
        elements.envSelect.value,
        elements.nglSiteSelect.value,
        elements.customEnvInput.value
    );
}

function getEmailType() {
    return document.querySelector('input[name="emailType"]:checked').value;
}

function showPreviewMessage(message) {
    elements.previewContent.innerHTML = `<div class="empty-preview">${escapeHTML(message)}</div>`;
}

/**
 * Switch between Report Delay and System Issue templates.
 */
function selectTemplate(type) {
    currentTemplate = type;
    document.getElementById('reportBtn').classList.toggle('active', type === 'report');
    document.getElementById('systemBtn').classList.toggle('active', type === 'system');
    elements.reportFields.classList.toggle('hidden', type !== 'report');
    elements.systemFields.classList.toggle('hidden', type !== 'system');

    syncEnvironmentAvailability();
    syncEnvironmentControls();
    updatePreview();
}

function syncEnvironmentAvailability() {
    const isReport = currentTemplate === 'report';
    const isRegulatoryReport = elements.reportSelect.value === 'regulatory';
    const hasSelectedReport = Boolean(elements.reportSelect.value);

    Array.from(elements.envSelect.options).forEach(option => {
        if (!option.value) return;
        const supportsSelectedReport = !hasSelectedReport
            ? option.dataset.reportDelay === 'true' || option.dataset.regulatoryReport === 'true'
            : isRegulatoryReport
                ? option.dataset.regulatoryReport === 'true'
                : option.dataset.reportDelay === 'true';
        option.disabled = isReport && !supportsSelectedReport;
    });

    const selectedOption = elements.envSelect.selectedOptions[0];
    if (selectedOption?.disabled) elements.envSelect.value = '';
}

function syncReportTypeFromEnvironment() {
    if (currentTemplate !== 'report' || elements.reportSelect.value) {
        syncEnvironmentControls();
        return;
    }

    const selectedOption = elements.envSelect.selectedOptions[0];
    if (selectedOption?.dataset.regulatoryReport === 'true') {
        elements.reportSelect.value = 'regulatory';
        syncReportControls();
        return;
    }
    if (selectedOption?.dataset.reportDelay === 'true') {
        elements.reportSelect.value = 'Activity Summary Daily';
        syncReportControls();
        return;
    }

    syncEnvironmentControls();
}

function syncRequiredFields() {
    const isReport = currentTemplate === 'report';
    const isSystem = currentTemplate === 'system';
    const isResolved = getEmailType() === 'resolved';
    const isRegulatoryReport = isReport && elements.reportSelect.value === 'regulatory';

    elements.reportSelect.required = isReport;
    elements.reportDate.required = isReport;
    elements.customReportInput.required = isReport && elements.reportSelect.value === 'other';
    elements.reportFrequency.required = isRegulatoryReport;
    elements.missingReports.required = isRegulatoryReport;
    elements.reportDetectionTime.required = isRegulatoryReport;
    elements.reportEndTime.required = isRegulatoryReport && isResolved;
    elements.reportEndTimeGroup.classList.toggle('hidden', !isRegulatoryReport || !isResolved);

    elements.issueSelect.required = isSystem && !getSelectedContext()?.fixedDropInBets;
    elements.startTime.required = isSystem;
    elements.endTime.required = isSystem && isResolved;
    elements.rootCauseSelect.required = isSystem;
    elements.endTimeGroup.classList.toggle('hidden', !isResolved);
}

function syncReportControls() {
    const isRegulatoryReport = currentTemplate === 'report'
        && elements.reportSelect.value === 'regulatory';

    elements.customReportDiv.classList.toggle(
        'show',
        currentTemplate === 'report' && elements.reportSelect.value === 'other'
    );
    elements.regulatoryFields.classList.toggle('hidden', !isRegulatoryReport);
    syncEnvironmentAvailability();
    syncEnvironmentControls();
}

function syncEnvironmentControls() {
    const isOther = elements.envSelect.value === 'other';
    const isNGL = elements.envSelect.value === 'NGL';

    elements.customEnvDiv.classList.toggle('show', isOther);
    elements.customEnvInput.required = isOther;
    elements.nglSiteGroup.classList.toggle('hidden', !isNGL);
    elements.nglSiteSelect.required = isNGL;

    if (!isNGL) elements.nglSiteSelect.value = '';

    const context = getSelectedContext();
    elements.jiraPrefixHint.textContent = context
        ? `Jira ticket: ${context.jiraPrefix}-[number] · Times shown in ${context.timezone}`
        : 'The Jira project prefix is selected automatically.';

    syncExternalTeamSuggestion(context);
    syncRecipientControls();

    syncRequiredFields();
    syncIssueControls();
    syncRootCauseControls();
}

function syncRecipientControls() {
    const environment = elements.envSelect.value;
    const nglSite = elements.nglSiteSelect.value;
    const hasCustomerSelection = environment
        && environment !== 'other'
        && (environment !== 'NGL' || nglSite);

    elements.recipientSection.classList.toggle('hidden', !hasCustomerSelection);
    if (!hasCustomerSelection) {
        elements.toRecipients.value = '';
        elements.ccRecipients.value = '';
        return;
    }

    const recipients = getRecipientList(environment, nglSite);
    const context = getSelectedContext();
    const hasRecipients = Boolean(recipients);

    elements.recipientFields.classList.toggle('hidden', !hasRecipients);
    elements.recipientMissing.classList.toggle('hidden', hasRecipients);

    if (!hasRecipients) {
        elements.toRecipients.value = '';
        elements.ccRecipients.value = '';
        elements.recipientSourceLabel.textContent = 'No addresses were added.';
        elements.recipientMissing.textContent = `No To/CC list for ${context.displayName} appears in the provided playbook.`;
        return;
    }

    elements.toRecipients.value = formatRecipientList(recipients.to);
    elements.ccRecipients.value = formatRecipientList(recipients.cc);
    elements.recipientSourceLabel.textContent = NPI_CUSTOMERS.has(getRecipientKey(environment, nglSite))
        ? 'Includes the shared NPI list and the customer-specific list.'
        : 'Exact customer list from the provided playbook.';
}

async function copyRecipientField(button) {
    const field = document.getElementById(button.dataset.recipientField);
    if (!field?.value) return;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(field.value);
        } else {
            field.focus();
            field.select();
            document.execCommand('copy');
            field.setSelectionRange(0, 0);
        }

        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 1800);
    } catch (error) {
        elements.successMessage.textContent = 'Unable to copy the recipient list. Select the field and copy it manually.';
        elements.successMessage.classList.add('error', 'show');
    }
}

function issueRequiresPercentage() {
    if (getSelectedContext()?.fixedDropInBets) return false;

    if (elements.issueSelect.value === 'other') {
        return elements.customIssueInput.value.toLowerCase().includes('decrease in bets');
    }

    return elements.issueSelect.selectedOptions[0]?.dataset.requiresPercentage === 'true';
}

function issueRequiresTarget() {
    if (getSelectedContext()?.fixedDropInBets) return false;
    return Boolean(elements.issueSelect.selectedOptions[0]?.dataset.targetLabel);
}

function isInterruptionIssue() {
    return !getSelectedContext()?.fixedDropInBets
        && elements.issueSelect.selectedOptions[0]?.dataset.interruption === 'true';
}

function syncIssueControls() {
    const isSystem = currentTemplate === 'system';
    const context = getSelectedContext();
    const hasFixedIssue = context?.fixedDropInBets === true;
    const isCustom = !hasFixedIssue && elements.issueSelect.value === 'other';
    const needsPercentage = isSystem && issueRequiresPercentage();
    const needsTarget = isSystem && issueRequiresTarget();
    const optionalTargetLabel = elements.issueSelect.selectedOptions[0]?.dataset.optionalTargetLabel;
    const showsTarget = needsTarget || (isSystem && Boolean(optionalTargetLabel));
    const targetLabel = elements.issueSelect.selectedOptions[0]?.dataset.targetLabel || optionalTargetLabel;
    const needsInterruptionDetails = isSystem && isInterruptionIssue();

    elements.issueSelect.disabled = hasFixedIssue;
    elements.issueSelect.required = isSystem && !hasFixedIssue;
    elements.nglIssueHint.classList.toggle('hidden', !hasFixedIssue);
    elements.nglIssueHint.textContent = hasFixedIssue
        ? `This lottery always uses “Drop in bets via ${context.displayName}”.`
        : '';
    elements.customIssueDiv.classList.toggle('show', isCustom);
    elements.customIssueInput.required = isSystem && isCustom;
    elements.issueTargetGroup.classList.toggle('show', showsTarget);
    elements.issueTargetInput.required = needsTarget;
    elements.issueTargetLabel.textContent = targetLabel || 'Provider / channel';
    elements.interruptionDetailsGroup.classList.toggle('show', needsInterruptionDetails);
    elements.interruptionFrequency.required = needsInterruptionDetails;
    elements.interruptionDuration.required = needsInterruptionDetails;
    elements.percentageGroup.classList.toggle('hidden', !needsPercentage);
    elements.percentageInput.required = needsPercentage;

    if (!needsPercentage) elements.percentageInput.value = '';
}

function syncRootCauseControls() {
    const isSystem = currentTemplate === 'system';
    const isExternal = elements.rootCauseSelect.value === 'external';
    const isCustom = elements.rootCauseSelect.value === 'other';

    syncExternalTeamSuggestion(getSelectedContext());
    elements.externalTeamDiv.classList.toggle('show', isExternal);
    elements.externalTeamInput.required = isSystem && isExternal;
    elements.customRootCauseDiv.classList.toggle('show', isCustom);
    elements.customRootCauseInput.required = isSystem && isCustom;
}

function syncExternalTeamSuggestion(context = getSelectedContext()) {
    if (elements.rootCauseSelect.value !== 'external') return;

    const suggestion = context?.fixedDropInBets
        ? context.displayName
        : elements.issueTargetInput.value.trim();
    const wasAutoFilled = elements.externalTeamInput.dataset.autoFilled === 'true';

    if (suggestion && (!elements.externalTeamInput.value || wasAutoFilled)) {
        elements.externalTeamInput.value = suggestion;
        elements.externalTeamInput.dataset.autoFilled = 'true';
    } else if (!suggestion && wasAutoFilled) {
        elements.externalTeamInput.value = '';
        elements.externalTeamInput.dataset.autoFilled = 'false';
    }
}

function getIssueDescription(context) {
    if (context.fixedDropInBets) return `Drop in bets via ${context.displayName}`;

    const issueTemplate = elements.issueSelect.value === 'other'
        ? elements.customIssueInput.value.trim()
        : elements.issueSelect.value;
    const target = elements.issueTargetInput.value.trim();
    if (isInterruptionIssue() && target) return `${issueTemplate} via ${target}`;
    return issueTemplate.replace('{target}', target);
}

function getExternalPartyName() {
    return elements.externalTeamInput.value.trim().replace(/\s+team$/i, '');
}

function getRootCause(emailType) {
    const selection = elements.rootCauseSelect.value;
    if (selection === 'other') return elements.customRootCauseInput.value.trim();
    if (selection !== 'external') return selection;

    const teamName = getExternalPartyName();
    if (!teamName) return '';
    const waitingText = emailType === 'resolved' ? 'are still waiting' : 'are waiting';
    return `We have reached out to ${teamName} team and ${waitingText} for their response`;
}

function updatePreview() {
    const environment = elements.envSelect.value;
    if (!environment) {
        showPreviewMessage('Fill in all required fields');
        return;
    }

    if (environment === 'NGL' && !elements.nglSiteSelect.value) {
        showPreviewMessage('Please select an NG-LOT lottery');
        return;
    }

    const context = getSelectedContext();
    if (!context) {
        showPreviewMessage('Enter a custom Jira project prefix');
        return;
    }

    const ticketNumber = elements.ticketNumber.value.trim();
    if (!/^\d+$/.test(ticketNumber)) {
        showPreviewMessage('Enter a numeric Jira ticket number');
        return;
    }

    const fullTicket = `${context.jiraPrefix}-${ticketNumber}`;
    const emailType = getEmailType();
    const result = currentTemplate === 'report'
        ? generateReportPreview(fullTicket, emailType)
        : generateSystemPreview(fullTicket, emailType, context);

    if (!result) return;

    elements.previewContent.innerHTML = `
        <div style="margin-bottom: 15px;"><strong>Subject:</strong> ${escapeHTML(result.subject)}</div>
        <hr style="margin: 20px 0; border: none; border-top: 2px solid #e2e8f0; user-select: none;" aria-hidden="true">
        ${result.htmlBody}
    `;
}

function generateReportPreview(fullTicket, emailType) {
    if (elements.reportSelect.value === 'regulatory') {
        return generateRegulatoryReportPreview(fullTicket, emailType);
    }

    const reportName = elements.reportSelect.value === 'other'
        ? elements.customReportInput.value.trim()
        : elements.reportSelect.value;
    const reportDate = formatPreviousDate(elements.reportDate.value);

    if (!reportName || !reportDate) {
        showPreviewMessage('Fill in all required fields');
        return null;
    }

    const subject = `${fullTicket} - Critical Notification - The report ${reportName} for ${reportDate} is being delayed`;
    const safeReportName = escapeHTML(reportName);
    const safeReportDate = escapeHTML(reportDate);
    const htmlBody = emailType === 'ongoing'
        ? generateReportOpeningHTML(safeReportName, safeReportDate)
        : generateReportResolvedHTML(safeReportName, safeReportDate);

    return { subject, htmlBody };
}

function getMissingReportNames() {
    return elements.missingReports.value
        .split(/\r?\n/)
        .map(report => report.trim())
        .filter(Boolean);
}

function generateRegulatoryReportPreview(fullTicket, emailType) {
    const reportDate = formatPreviousDate(elements.reportDate.value);
    const frequency = elements.reportFrequency.value;
    const reports = getMissingReportNames();
    const detectionTime = elements.reportDetectionTime.value;

    if (!reportDate || !frequency || reports.length === 0 || !detectionTime) {
        showPreviewMessage('Fill in the report date, frequency, missing files, and detection time');
        return null;
    }

    const context = getSelectedContext();
    const startValue = `${elements.reportDate.value}T${detectionTime}`;
    const startInstant = zonedDateTimeToDate(startValue);
    if (!startInstant) {
        showPreviewMessage('The detection time is not a valid Israel local time');
        return null;
    }

    let formattedEndTime = '';
    if (emailType === 'resolved') {
        const endValue = elements.reportEndTime.value;
        if (!endValue) {
            showPreviewMessage('Enter the resolved time in Israel time');
            return null;
        }

        const endInstant = zonedDateTimeToDate(endValue);
        if (!endInstant) {
            showPreviewMessage('The resolved time is not a valid Israel local time');
            return null;
        }
        if (endInstant <= startInstant) {
            showPreviewMessage('Resolved time must be later than the detection time');
            return null;
        }
        formattedEndTime = formatDateTime(endValue, context);
    }

    const formattedStartTime = formatDateTime(startValue, context);
    const safeFrequency = escapeHTML(frequency);
    const safeReportDate = escapeHTML(reportDate);
    const safeReports = reports.map(escapeHTML);
    const subject = `${fullTicket} - Critical Notification - Missing Regulatory Reports for ${reportDate}`;
    const htmlBody = emailType === 'ongoing'
        ? generateRegulatoryReportOpeningHTML(
            safeFrequency,
            safeReports,
            safeReportDate,
            formattedStartTime
        )
        : generateRegulatoryReportResolvedHTML(
            safeFrequency,
            safeReports,
            safeReportDate,
            formattedStartTime,
            formattedEndTime
        );

    return { subject, htmlBody };
}

function generateSystemPreview(fullTicket, emailType, context) {
    if (issueRequiresTarget() && !elements.issueTargetInput.value.trim()) {
        showPreviewMessage('Enter the provider, processor, or channel');
        return null;
    }

    const issueText = getIssueDescription(context);
    if (!issueText) {
        showPreviewMessage('Fill in the issue description');
        return null;
    }

    const needsPercentage = issueRequiresPercentage();
    const percentage = elements.percentageInput.value;
    if (needsPercentage && percentage === '') {
        showPreviewMessage('Enter the impact percentage');
        return null;
    }
    let impactDescription = needsPercentage ? `${issueText} (~${percentage}%)` : issueText;

    if (isInterruptionIssue()) {
        const frequency = elements.interruptionFrequency.value;
        const duration = elements.interruptionDuration.value;
        if (!frequency || !duration) {
            showPreviewMessage('Enter the interruption frequency and duration');
            return null;
        }
        impactDescription = generateInterruptionImpact(issueText, frequency, duration, emailType);
    }

    const rootCause = getRootCause(emailType);
    if (!rootCause) {
        showPreviewMessage('Select or enter the root cause');
        return null;
    }

    const startValue = elements.startTime.value;
    if (!startValue) {
        showPreviewMessage('Enter the start time in Israel time');
        return null;
    }

    const startInstant = zonedDateTimeToDate(startValue);
    if (!startInstant) {
        showPreviewMessage('The start time is not a valid Israel local time');
        return null;
    }

    let formattedEndTime = '';
    if (emailType === 'resolved') {
        const endValue = elements.endTime.value;
        if (!endValue) {
            showPreviewMessage('Enter the end time in Israel time');
            return null;
        }

        const endInstant = zonedDateTimeToDate(endValue);
        if (!endInstant) {
            showPreviewMessage('The end time is not a valid Israel local time');
            return null;
        }
        if (endInstant <= startInstant) {
            showPreviewMessage('End time must be later than start time');
            return null;
        }
        formattedEndTime = formatDateTime(endValue, context);
    }

    const formattedStartTime = formatDateTime(startValue, context);
    const subject = `${fullTicket} - Critical Notification - ${issueText}`;
    const safeIssue = escapeHTML(issueText);
    const safeImpact = escapeHTML(impactDescription);
    const safeRootCause = escapeHTML(rootCause);
    const htmlBody = emailType === 'ongoing'
        ? generateSystemOpeningHTML(safeIssue, safeImpact, formattedStartTime, safeRootCause)
        : generateSystemResolvedHTML(safeIssue, safeImpact, formattedStartTime, formattedEndTime, safeRootCause);

    return { subject, htmlBody };
}

function handleFormSubmit(event) {
    event.preventDefault();
    updatePreview();

    if (elements.previewContent.querySelector('.empty-preview')) return;

    const previewHtml = elements.previewContent.innerHTML;
    const doc = new DOMParser().parseFromString(previewHtml, 'text/html');
    const separator = doc.querySelector('hr');
    let emailContent = '';

    if (separator) {
        let node = separator.nextSibling;
        while (node) {
            emailContent += node.nodeType === Node.ELEMENT_NODE ? node.outerHTML : node.textContent;
            node = node.nextSibling;
        }
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    const originalBackground = submitButton.style.background;

    copyToClipboard(emailContent, () => {
        submitButton.innerHTML = '✅ Copied!';
        submitButton.style.background = '#48bb78';
        elements.successMessage.textContent = '✅ Email copied! Open Outlook and paste (Ctrl+V)';
        elements.successMessage.classList.remove('error');
        elements.successMessage.classList.add('show');

        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.style.background = originalBackground;
            elements.successMessage.classList.remove('show');
        }, 3000);
    }, () => {
        elements.successMessage.textContent = 'Unable to access the clipboard. Run the generator on localhost and try again.';
        elements.successMessage.classList.add('error', 'show');
    });
}

function setupEventListeners() {
    elements.envSelect.addEventListener('change', syncReportTypeFromEnvironment);
    elements.nglSiteSelect.addEventListener('change', syncEnvironmentControls);

    elements.reportSelect.addEventListener('change', syncReportControls);

    elements.issueSelect.addEventListener('change', () => {
        syncIssueControls();
        syncExternalTeamSuggestion();
    });
    elements.customIssueInput.addEventListener('input', syncIssueControls);
    elements.issueTargetInput.addEventListener('input', syncExternalTeamSuggestion);
    elements.rootCauseSelect.addEventListener('change', syncRootCauseControls);
    document.querySelectorAll('.copy-recipient-btn').forEach(button => {
        button.addEventListener('click', () => copyRecipientField(button));
    });
    elements.externalTeamInput.addEventListener('input', () => {
        elements.externalTeamInput.dataset.autoFilled = 'false';
    });

    document.querySelectorAll('input[name="emailType"]').forEach(radio => {
        radio.addEventListener('change', syncRequiredFields);
    });

    elements.form.addEventListener('input', updatePreview);
    elements.form.addEventListener('change', updatePreview);
    elements.form.addEventListener('submit', handleFormSubmit);

    syncEnvironmentAvailability();
    syncEnvironmentControls();
    syncRequiredFields();
}

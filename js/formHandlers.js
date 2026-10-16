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
    providerOptions: document.getElementById('providerOptions'),
    providerHint: document.getElementById('providerHint'),
    outreachContactHint: document.getElementById('outreachContactHint'),
    interruptionDetailsGroup: document.getElementById('interruptionDetailsGroup'),
    interruptionFrequency: document.getElementById('interruptionFrequency'),
    interruptionDuration: document.getElementById('interruptionDuration'),
    approvedDepositsGroup: document.getElementById('approvedDepositsGroup'),
    approvedDepositsInputs: document.querySelectorAll('input[name="approvedDepositsAffected"]'),
    declineIncreaseGroup: document.getElementById('declineIncreaseGroup'),
    declineIncreaseQuestion: document.getElementById('declineIncreaseQuestion'),
    declineIncreaseInputs: document.querySelectorAll('input[name="declineIncrease"]'),
    declineTypeGroup: document.getElementById('declineTypeGroup'),
    declineTypeInputs: document.querySelectorAll('input[name="declineType"]'),
    percentageGroup: document.getElementById('percentageGroup'),
    percentageInput: document.getElementById('percentageInput'),
    startDate: document.getElementById('startDate'),
    startClockTime: document.getElementById('startClockTime'),
    endDate: document.getElementById('endDate'),
    endClockTime: document.getElementById('endClockTime'),
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
    endTimeGroup: document.getElementById('endTimeGroup'),
    outreachSection: document.getElementById('outreachSection'),
    outreachTarget: document.getElementById('outreachTarget'),
    outreachRecipientFields: document.getElementById('outreachRecipientFields'),
    outreachMissing: document.getElementById('outreachMissing'),
    outreachTo: document.getElementById('outreachTo'),
    outreachCc: document.getElementById('outreachCc'),
    outreachSubject: document.getElementById('outreachSubject'),
    outreachPreview: document.getElementById('outreachPreview'),
    copyOutreachBtn: document.getElementById('copyOutreachBtn')
};

let currentOutreachHTML = '';

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
    elements.startDate.required = isSystem;
    elements.startClockTime.required = isSystem;
    elements.endDate.required = isSystem && isResolved;
    elements.endClockTime.required = isSystem && isResolved;
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

function issueAsksApprovedDeposits() {
    return !getSelectedContext()?.fixedDropInBets
        && elements.issueSelect.selectedOptions[0]?.dataset.approvedDepositsCheck === 'true';
}

function issueAsksDeclineIncrease() {
    return !getSelectedContext()?.fixedDropInBets
        && elements.issueSelect.selectedOptions[0]?.dataset.declineIncreaseCheck === 'true';
}

function getApprovedNoun() {
    return /cashouts/i.test(elements.issueSelect.value) ? 'cashouts' : 'deposits';
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
    const needsApprovedDepositsAnswer = isSystem && issueAsksApprovedDeposits();
    const needsDeclineIncreaseAnswer = isSystem && issueAsksDeclineIncrease();
    const hasDeclineIncrease = needsDeclineIncreaseAnswer
        && document.querySelector('input[name="declineIncrease"]:checked')?.value === 'yes';

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
    elements.approvedDepositsGroup.classList.toggle('hidden', !needsApprovedDepositsAnswer);
    elements.approvedDepositsInputs.forEach(input => {
        input.required = needsApprovedDepositsAnswer;
        if (!needsApprovedDepositsAnswer) input.checked = false;
    });
    elements.declineIncreaseGroup.classList.toggle('hidden', !needsDeclineIncreaseAnswer);
    elements.declineIncreaseQuestion.textContent =
        `Is there an increase in declined or rejected ${getApprovedNoun()}?`;
    elements.declineIncreaseInputs.forEach(input => {
        input.required = needsDeclineIncreaseAnswer;
        if (!needsDeclineIncreaseAnswer) input.checked = false;
    });
    elements.declineTypeGroup.classList.toggle('hidden', !hasDeclineIncrease);
    elements.declineTypeInputs.forEach(input => {
        input.required = hasDeclineIncrease;
        if (!hasDeclineIncrease) input.checked = false;
    });
    elements.percentageGroup.classList.toggle('hidden', !needsPercentage);
    elements.percentageInput.required = needsPercentage;

    if (!needsPercentage) elements.percentageInput.value = '';
    syncProviderControls();
}

/**
 * Build the Issue Description options from ISSUE_LIST, grouped by category
 * (bold, unselectable headers), keeping the current selection when it still
 * exists.
 */
function renderIssueOptions() {
    const previousValue = elements.issueSelect.value;
    const groups = [];
    ISSUE_LIST.forEach(issue => {
        const option = new Option(issue.label, issue.value);
        if (issue.targetLabel) option.dataset.targetLabel = issue.targetLabel;
        if (issue.optionalTargetLabel) option.dataset.optionalTargetLabel = issue.optionalTargetLabel;
        if (issue.requiresPercentage) option.dataset.requiresPercentage = 'true';
        if (issue.interruption) option.dataset.interruption = 'true';
        if (issue.approvedDepositsCheck) option.dataset.approvedDepositsCheck = 'true';
        if (issue.declineIncreaseCheck) option.dataset.declineIncreaseCheck = 'true';

        const category = issue.category || '';
        let group = groups.find(item => item.category === category);
        if (!group) {
            group = { category, options: [] };
            groups.push(group);
        }
        group.options.push(option);
    });
    const groupElements = groups.flatMap(({ category, options }) => {
        if (!category) return options;
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;
        optgroup.append(...options);
        return [optgroup];
    });
    elements.issueSelect.replaceChildren(
        new Option('-- Select Issue --', ''),
        ...groupElements,
        new Option('Other (Custom)', 'other')
    );
    if ([...elements.issueSelect.options].some(option => option.value === previousValue)) {
        elements.issueSelect.value = previousValue;
    }
}

function getSelectedEnvironmentKey() {
    return getRecipientKey(elements.envSelect.value, elements.nglSiteSelect.value);
}

/**
 * Provider / channel suggestions for the selected environment, plus the
 * subprovider and internal-provider rules: a subprovider is escalated to its
 * provider, and an internal provider (Fusion) always uses the internal root
 * cause. The automatic root cause is undone when the provider changes, unless
 * the operator picked the root cause by hand.
 */
function getProviderResolution() {
    const context = getSelectedContext();
    const usesProviders = currentTemplate === 'system'
        && !context?.fixedDropInBets
        && elements.issueTargetGroup.classList.contains('show')
        && elements.issueTargetLabel.textContent === 'Provider / channel';
    const key = getSelectedEnvironmentKey();
    const target = elements.issueTargetInput.value.trim();
    const resolved = usesProviders ? resolveProvider(key, target) : null;
    const isSubprovider = Boolean(resolved)
        && resolved.provider.toLowerCase() !== target.toLowerCase();
    return { usesProviders, key, target, resolved, isSubprovider };
}

function syncProviderControls() {
    const { usesProviders, key, target, resolved, isSubprovider } = getProviderResolution();

    const suggestions = usesProviders ? getProviderSuggestions(key) : [];
    elements.providerOptions.replaceChildren(...suggestions.map(name => new Option(name, name)));
    if (suggestions.length) elements.issueTargetInput.setAttribute('list', 'providerOptions');
    else elements.issueTargetInput.removeAttribute('list');

    let hint = '';
    if (resolved?.internal) {
        hint = `${resolved.provider} is an Aristocrat platform: root cause is set to “${INTERNAL_ROOT_CAUSE}”.`;
    } else if (isSubprovider) {
        hint = `${target} is a subprovider of ${resolved.provider}: contact ${resolved.provider}.`;
    }
    elements.providerHint.textContent = hint;
    elements.providerHint.classList.toggle('hidden', !hint);

    const rootCause = elements.rootCauseSelect;
    let rootCauseChanged = false;
    if (resolved?.internal) {
        if (rootCause.value !== INTERNAL_ROOT_CAUSE) {
            rootCause.value = INTERNAL_ROOT_CAUSE;
            rootCause.dataset.autoInternal = 'true';
            rootCauseChanged = true;
        }
    } else if (rootCause.dataset.autoInternal === 'true') {
        rootCause.value = 'external';
        rootCause.dataset.autoInternal = 'false';
        rootCauseChanged = true;
    }
    if (rootCauseChanged) syncRootCauseControls();
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

    const target = elements.issueTargetInput.value.trim();
    const suggestion = context?.fixedDropInBets
        ? context.displayName
        : resolveProvider(getSelectedEnvironmentKey(), target)?.provider || target;
    const wasAutoFilled = elements.externalTeamInput.dataset.autoFilled === 'true';

    if (suggestion && (!elements.externalTeamInput.value || wasAutoFilled)) {
        elements.externalTeamInput.value = suggestion;
        elements.externalTeamInput.dataset.autoFilled = 'true';
    } else if (!suggestion && wasAutoFilled) {
        elements.externalTeamInput.value = '';
        elements.externalTeamInput.dataset.autoFilled = 'false';
    }
}

function getIssueDescription(context, target = elements.issueTargetInput.value.trim()) {
    if (context.fixedDropInBets) return `Drop in bets via ${context.displayName}`;

    const issueTemplate = elements.issueSelect.value === 'other'
        ? elements.customIssueInput.value.trim()
        : elements.issueSelect.value;
    if (isInterruptionIssue() && target) return `${issueTemplate} via ${target}`;
    return issueTemplate.replace('{target}', target);
}

/**
 * The Impact description names the provider for a subprovider issue
 * ("Decrease in bets via IsoftBet sub-provider Adell"); the subject and
 * detection line keep the shorter issue text.
 */
function getImpactIssueDescription(context, issueText) {
    const { target, resolved, isSubprovider } = getProviderResolution();
    return isSubprovider
        ? getIssueDescription(context, `${resolved.provider} sub-provider ${target}`)
        : issueText;
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
    updateOutreachSection(renderCriticalPreview());
}

/**
 * Render the critical notification preview. Returns the generated result, or
 * null when required fields are missing.
 */
function renderCriticalPreview() {
    const environment = elements.envSelect.value;
    if (!environment) {
        showPreviewMessage('Fill in all required fields');
        return null;
    }

    if (environment === 'NGL' && !elements.nglSiteSelect.value) {
        showPreviewMessage('Please select an NG-LOT lottery');
        return null;
    }

    const context = getSelectedContext();
    if (!context) {
        showPreviewMessage('Enter a custom Jira project prefix');
        return null;
    }

    const ticketNumber = elements.ticketNumber.value.trim();
    if (!/^\d+$/.test(ticketNumber)) {
        showPreviewMessage('Enter a numeric Jira ticket number');
        return null;
    }

    const fullTicket = `${context.jiraPrefix}-${ticketNumber}`;
    const emailType = getEmailType();
    const result = currentTemplate === 'report'
        ? generateReportPreview(fullTicket, emailType)
        : generateSystemPreview(fullTicket, emailType, context);

    if (!result) return null;

    elements.previewContent.innerHTML = `
        <div style="margin-bottom: 15px;"><strong>Subject:</strong> ${escapeHTML(result.subject)}</div>
        <hr style="margin: 20px 0; border: none; border-top: 2px solid #e2e8f0; user-select: none;" aria-hidden="true">
        ${result.htmlBody}
    `;
    return result;
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
    let impactIssueText = getImpactIssueDescription(context, issueText);
    if (issueAsksDeclineIncrease()) {
        const noun = getApprovedNoun();
        const hasIncrease = document.querySelector('input[name="declineIncrease"]:checked')?.value;
        if (!hasIncrease) {
            showPreviewMessage(`Choose whether there is an increase in declined or rejected ${noun}`);
            return null;
        }
        if (hasIncrease === 'yes') {
            const increaseType = document.querySelector('input[name="declineType"]:checked')?.value;
            if (!increaseType) {
                showPreviewMessage(`Choose whether the ${noun} are rejected or declined`);
                return null;
            }
            impactIssueText = generateDeclineIncreaseImpact(impactIssueText, increaseType);
        }
    }
    let impactDescription = needsPercentage ? `${impactIssueText} (~${percentage}%)` : impactIssueText;

    if (issueAsksApprovedDeposits()) {
        const approvedDepositsAnswer = document.querySelector(
            'input[name="approvedDepositsAffected"]:checked'
        )?.value;
        if (!approvedDepositsAnswer) {
            showPreviewMessage('Choose whether approved deposits are affected');
            return null;
        }
        impactDescription = generateDepositApprovalImpact(
            issueText,
            approvedDepositsAnswer === 'yes'
        );
    }

    if (isInterruptionIssue()) {
        const frequency = elements.interruptionFrequency.value;
        const duration = elements.interruptionDuration.value;
        if (!frequency || !duration) {
            showPreviewMessage('Enter the interruption frequency and duration');
            return null;
        }
        impactDescription = generateInterruptionImpact(impactIssueText, frequency, duration, emailType);
    }

    const rootCause = getRootCause(emailType);
    if (!rootCause) {
        showPreviewMessage('Select or enter the root cause');
        return null;
    }

    const startValue = combineDateAndTime(elements.startDate.value, elements.startClockTime.value);
    if (!startValue) {
        showPreviewMessage('Choose the issue start date and time in Israel time');
        return null;
    }

    const startInstant = zonedDateTimeToDate(startValue);
    if (!startInstant) {
        showPreviewMessage('The start time is not a valid Israel local time');
        return null;
    }

    let formattedEndTime = '';
    if (emailType === 'resolved') {
        const endValue = combineDateAndTime(elements.endDate.value, elements.endClockTime.value);
        if (!endValue) {
            showPreviewMessage('Choose the issue resolution date and time in Israel time');
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

    return { subject, htmlBody, issueText, formattedStartTime, context };
}

function isOutreachApplicable() {
    return currentTemplate === 'system'
        && elements.rootCauseSelect.value === 'external'
        && getEmailType() === 'ongoing';
}

/**
 * Rebuild the Send To options for the selected environment. NG-LOT and USLOT
 * lotteries are contacted directly, so they get a lottery option first.
 */
function syncOutreachTargetOptions(context) {
    const lotteryLabel = context?.fixedDropInBets ? `Lottery: ${context.displayName}` : '';
    const optionsKey = `${lotteryLabel}|vendors`;
    if (elements.outreachTarget.dataset.optionsKey === optionsKey) return;

    const previousValue = elements.outreachTarget.value;
    const options = [new Option('-- Select vendor / lottery --', '')];
    if (lotteryLabel) options.push(new Option(lotteryLabel, 'lottery'));
    Object.entries(VENDOR_CONTACTS).forEach(([id, vendor]) => {
        options.push(new Option(vendor.label, id));
    });

    elements.outreachTarget.replaceChildren(...options);
    elements.outreachTarget.dataset.optionsKey = optionsKey;
    elements.outreachTarget.dataset.manual = 'false';
    if (options.some(option => option.value === previousValue)) {
        elements.outreachTarget.value = previousValue;
    }
}

function syncOutreachTargetSuggestion(context) {
    if (elements.outreachTarget.dataset.manual === 'true') return;

    elements.outreachTarget.value = context?.fixedDropInBets
        ? 'lottery'
        : suggestVendor(getExternalPartyName(), elements.envSelect.value);
}

function getOutreachRecipients() {
    const target = elements.outreachTarget.value;
    if (!target) return null;
    if (target === 'lottery') {
        return getLotteryOutreachRecipients(elements.envSelect.value, elements.nglSiteSelect.value);
    }
    return getVendorRecipients(target);
}

function showOutreachMessage(message) {
    currentOutreachHTML = '';
    elements.outreachSubject.value = '';
    elements.outreachPreview.innerHTML = `<div class="empty-preview">${escapeHTML(message)}</div>`;
}

function updateOutreachSection(criticalResult) {
    const isApplicable = isOutreachApplicable();
    elements.outreachSection.classList.toggle('hidden', !isApplicable);
    if (!isApplicable) return;

    const context = getSelectedContext();
    syncOutreachTargetOptions(context);
    syncOutreachTargetSuggestion(context);

    const provider = getProviderResolution();
    const contactHint = provider.isSubprovider ? getSubproviderContactHint(provider.target) : '';
    elements.outreachContactHint.textContent = contactHint;
    elements.outreachContactHint.classList.toggle('hidden', !contactHint);

    const target = elements.outreachTarget.value;
    const recipients = getOutreachRecipients();
    const hasRecipients = Boolean(recipients);
    elements.outreachRecipientFields.classList.toggle('hidden', !hasRecipients);
    elements.outreachMissing.classList.toggle('hidden', hasRecipients || !target);
    elements.outreachTo.value = hasRecipients ? formatRecipientList(recipients.to) : '';
    elements.outreachCc.value = hasRecipients ? formatRecipientList(recipients.cc) : '';
    if (!hasRecipients && target) {
        elements.outreachMissing.textContent = `No contact list for ${context?.displayName || 'this lottery'} was provided. Add the recipients manually.`;
    }

    if (!criticalResult?.formattedStartTime) {
        showOutreachMessage('Complete the critical notification to generate the outreach email');
        return;
    }

    elements.outreachSubject.value = generateVendorOutreachSubject(
        criticalResult.context.displayName,
        criticalResult.issueText
    );
    currentOutreachHTML = generateVendorOutreachHTML(
        escapeHTML(criticalResult.issueText),
        criticalResult.formattedStartTime
    );
    elements.outreachPreview.innerHTML = currentOutreachHTML;
}

function copyOutreachEmail() {
    if (!currentOutreachHTML) return;

    const button = elements.copyOutreachBtn;
    const originalText = button.innerHTML;
    copyToClipboard(currentOutreachHTML, () => {
        button.innerHTML = '✅ Copied!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 1800);
    }, () => {
        elements.successMessage.textContent = 'Unable to access the clipboard. Run the generator on localhost and try again.';
        elements.successMessage.classList.add('error', 'show');
    });
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
        [...elements.approvedDepositsInputs, ...elements.declineIncreaseInputs, ...elements.declineTypeInputs]
            .forEach(input => {
                input.checked = false;
            });
        syncIssueControls();
        syncExternalTeamSuggestion();
    });
    elements.customIssueInput.addEventListener('input', syncIssueControls);
    elements.declineIncreaseInputs.forEach(input => input.addEventListener('change', syncIssueControls));
    elements.issueTargetInput.addEventListener('input', () => {
        syncProviderControls();
        syncExternalTeamSuggestion();
    });
    elements.rootCauseSelect.addEventListener('change', () => {
        elements.rootCauseSelect.dataset.autoInternal = 'false';
        syncRootCauseControls();
    });
    document.querySelectorAll('.copy-recipient-btn').forEach(button => {
        button.addEventListener('click', () => copyRecipientField(button));
    });
    document.querySelectorAll('.picker-input').forEach(input => {
        input.addEventListener('click', () => {
            if (typeof input.showPicker !== 'function') return;
            try {
                input.showPicker();
            } catch (error) {
                // The browser's normal date/time control remains available.
            }
        });
    });
    elements.externalTeamInput.addEventListener('input', () => {
        elements.externalTeamInput.dataset.autoFilled = 'false';
    });
    elements.envSelect.addEventListener('change', () => {
        elements.outreachTarget.dataset.manual = 'false';
    });
    elements.nglSiteSelect.addEventListener('change', () => {
        elements.outreachTarget.dataset.manual = 'false';
    });
    elements.outreachTarget.addEventListener('change', () => {
        elements.outreachTarget.dataset.manual = elements.outreachTarget.value ? 'true' : 'false';
        updatePreview();
    });
    elements.copyOutreachBtn.addEventListener('click', copyOutreachEmail);

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

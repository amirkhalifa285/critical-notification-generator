/**
 * Admin mode: edit the contact data files from the page itself.
 * Saving commits the JSON file straight to `main` through the GitHub API with
 * the owner's fine-grained token; GitHub Pages then redeploys for everyone.
 */

const ADMIN_REPO = 'amirkhalifa285/critical-notification-generator';
const ADMIN_BRANCH = 'main';
const ADMIN_TOKEN_KEY = 'cng-admin-token';
const RECIPIENTS_PATH = 'data/recipients.json';
const VENDORS_PATH = 'data/vendors.json';

/**
 * Pull addresses out of pasted text. Accepts one per line or Outlook-style
 * lists ("Name <a@b.com>; c@d.com, ..."). Order, spelling, and duplicates are
 * kept exactly as entered.
 */
function parseAddressList(text) {
    return text.match(/[^\s;,<>"'()]+@[^\s;,<>"'()]+/g) || [];
}

function parseKeywordList(text) {
    return text.split(',').map(keyword => keyword.trim().toLowerCase()).filter(Boolean);
}

/* ---------- Token storage ---------- */

function getAdminToken() {
    try {
        return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
    } catch (error) {
        return '';
    }
}

function setAdminToken(token) {
    try {
        if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
        else localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch (error) {
        // Storage blocked: admin mode lasts only for this page load.
    }
    adminSession.token = token;
    document.body.classList.toggle('admin-mode', Boolean(token));
    document.getElementById('adminToggleBtn').textContent = token ? '🔓 Admin' : '🔒 Admin';
}

const adminSession = { token: '' };

/* ---------- GitHub API ---------- */

async function githubRequest(path, options = {}, token = adminSession.token) {
    const response = await fetch(`https://api.github.com/repos/${ADMIN_REPO}${path}`, {
        cache: 'no-store',
        ...options,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            ...(options.body ? { 'Content-Type': 'application/json' } : {})
        }
    });
    if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        const reasons = {
            401: 'The token is invalid or expired.',
            403: 'The token does not have write access to this repository.',
            404: 'Repository or file not found. Check the token\'s repository access.',
            409: 'The file changed on GitHub meanwhile. Try saving again.'
        };
        throw new Error(reasons[response.status] || detail.message || `GitHub error ${response.status}`);
    }
    return response.json();
}

function decodeBase64UTF8(base64) {
    const bytes = Uint8Array.from(atob(base64.replace(/\n/g, '')), char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function encodeBase64UTF8(text) {
    let binary = '';
    new TextEncoder().encode(text).forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

/**
 * Read the latest file from GitHub, apply `mutate` to its data, and commit it.
 * Working on the latest version avoids overwriting a change saved from another
 * device. Returns the saved data.
 */
async function commitDataChange(path, mutate, message) {
    const file = await githubRequest(`/contents/${path}?ref=${ADMIN_BRANCH}`);
    const data = JSON.parse(decodeBase64UTF8(file.content));
    mutate(data);
    await githubRequest(`/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({
            message,
            content: encodeBase64UTF8(`${JSON.stringify(data, null, 2)}\n`),
            sha: file.sha,
            branch: ADMIN_BRANCH
        })
    });
    return data;
}

/* ---------- Dialog ---------- */

const adminDialog = {
    get dialog() { return document.getElementById('adminDialog'); },
    onSave: null
};

/**
 * Open the dialog with a list of fields: { id, label, value, type, rows }.
 * `onSave(values)` runs on submit; throwing shows the error in the dialog.
 */
function openAdminDialog({ title, hint = '', fields = [], saveLabel = 'Save', onSave }) {
    document.getElementById('adminTitle').textContent = title;
    document.getElementById('adminHint').textContent = hint;
    document.getElementById('adminStatus').textContent = '';
    document.getElementById('adminSaveBtn').textContent = saveLabel;
    document.getElementById('adminSaveBtn').disabled = false;

    const container = document.getElementById('adminFields');
    container.replaceChildren(...fields.map(field => {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.htmlFor = `admin-${field.id}`;
        label.textContent = field.label;
        const control = document.createElement(field.rows ? 'textarea' : 'input');
        control.id = `admin-${field.id}`;
        control.name = field.id;
        if (field.rows) control.rows = field.rows;
        else control.type = field.type || 'text';
        control.value = field.value || '';
        control.autocomplete = 'off';
        control.spellcheck = false;
        group.append(label, control);
        return group;
    }));

    adminDialog.onSave = onSave;
    adminDialog.dialog.showModal();
}

async function handleAdminSubmit(event) {
    event.preventDefault();
    const status = document.getElementById('adminStatus');
    const saveButton = document.getElementById('adminSaveBtn');
    const values = Object.fromEntries(new FormData(event.target).entries());

    saveButton.disabled = true;
    status.textContent = 'Saving…';
    try {
        const message = await adminDialog.onSave(values);
        adminDialog.dialog.close();
        if (message) showAdminMessage(message);
    } catch (error) {
        status.textContent = error.message;
        saveButton.disabled = false;
    }
}

function showAdminMessage(text) {
    elements.successMessage.textContent = text;
    elements.successMessage.classList.remove('error');
    elements.successMessage.classList.add('show');
    setTimeout(() => elements.successMessage.classList.remove('show'), 5000);
}

const SAVED_MESSAGE = '✅ Saved. Live for everyone in about a minute (after GitHub Pages redeploys).';

/* ---------- Login ---------- */

function openAdminLogin() {
    if (adminSession.token) {
        openAdminDialog({
            title: 'Admin mode',
            hint: 'You are logged in on this device. Logging out removes the saved token from this browser.',
            saveLabel: 'Log out',
            onSave: async () => {
                setAdminToken('');
                return '';
            }
        });
        return;
    }

    openAdminDialog({
        title: 'Admin login',
        hint: 'Paste your fine-grained GitHub token (this repository only, Contents: read and write). It is stored only in this browser.',
        fields: [{ id: 'token', label: 'GitHub token', type: 'password' }],
        saveLabel: 'Log in',
        onSave: async ({ token }) => {
            const trimmed = token.trim();
            if (!trimmed) throw new Error('Enter the token.');
            await githubRequest(`/contents/${RECIPIENTS_PATH}?ref=${ADMIN_BRANCH}`, {}, trimmed);
            setAdminToken(trimmed);
            return '🔓 Admin mode on. Edit buttons are shown in red.';
        }
    });
}

/* ---------- Critical notification recipients ---------- */

function openRecipientEditor() {
    const environment = elements.envSelect.value;
    const nglSite = elements.nglSiteSelect.value;
    const key = getRecipientKey(environment, nglSite);
    const name = getSelectedContext()?.displayName || key;
    const current = RECIPIENT_LISTS[key] || { to: [], cc: [] };
    const hint = NPI_CUSTOMERS.has(key)
        ? 'Customer-specific addresses only. The shared NPI list and NOCShiftLeaders@ are added automatically. One address per line, or paste an Outlook list.'
        : 'NOCShiftLeaders@ is added to CC automatically. One address per line, or paste an Outlook list. Clear both lists to remove them.';

    openAdminDialog({
        title: `Edit ${name} recipients`,
        hint,
        fields: [
            { id: 'to', label: 'To', value: current.to.join('\n'), rows: 8 },
            { id: 'cc', label: 'CC', value: current.cc.join('\n'), rows: 8 }
        ],
        onSave: async values => {
            const to = parseAddressList(values.to);
            const cc = parseAddressList(values.cc);
            const data = await commitDataChange(RECIPIENTS_PATH, file => {
                if (to.length || cc.length) file.lists[key] = { to, cc };
                else delete file.lists[key];
            }, `Admin: update ${name} recipients`);
            setRecipientData(data);
            syncRecipientControls();
            updatePreview();
            return SAVED_MESSAGE;
        }
    });
}

/* ---------- Vendor / lottery outreach contacts ---------- */

function refreshOutreachAfterSave(data, selectedTarget) {
    setVendorData(data);
    elements.outreachTarget.dataset.optionsKey = '';
    updatePreview();
    if (selectedTarget && [...elements.outreachTarget.options].some(o => o.value === selectedTarget)) {
        elements.outreachTarget.value = selectedTarget;
        elements.outreachTarget.dataset.manual = 'true';
        updatePreview();
    }
}

function openLotteryOutreachEditor() {
    const key = getRecipientKey(elements.envSelect.value, elements.nglSiteSelect.value);
    const name = getSelectedContext()?.displayName || key;

    openAdminDialog({
        title: `Edit ${name} outreach contacts`,
        hint: 'Leave empty to fall back to the lottery\'s critical-notification To list. CC is always NOCShiftLeaders@ and noc-ng@.',
        fields: [{ id: 'to', label: 'To', value: (LOTTERY_OUTREACH_CONTACTS[key] || []).join('\n'), rows: 8 }],
        onSave: async values => {
            const to = parseAddressList(values.to);
            const data = await commitDataChange(VENDORS_PATH, file => {
                if (to.length) file.lotteryOutreach[key] = to;
                else delete file.lotteryOutreach[key];
            }, `Admin: update ${name} outreach contacts`);
            refreshOutreachAfterSave(data, 'lottery');
            return SAVED_MESSAGE;
        }
    });
}

function openVendorEditor(vendorId = '') {
    const vendor = VENDOR_CONTACTS[vendorId];
    const isNew = !vendor;

    openAdminDialog({
        title: isNew ? 'New vendor' : `Edit ${vendor.label}`,
        hint: isNew
            ? 'Keywords are matched against the external team name to suggest this vendor. CC is always NOCShiftLeaders@ and noc-ng@.'
            : 'Clear the To list to delete this vendor. CC is always NOCShiftLeaders@ and noc-ng@.',
        fields: [
            { id: 'label', label: 'Name shown in Send To', value: vendor?.label },
            { id: 'matches', label: 'Keywords (comma separated)', value: vendor?.matches.join(', ') },
            { id: 'to', label: 'To', value: vendor?.to.join('\n'), rows: 6 }
        ],
        onSave: async values => {
            const label = values.label.trim();
            const matches = parseKeywordList(values.matches);
            const to = parseAddressList(values.to);
            const id = isNew ? label : vendorId;
            if (!label) throw new Error('Enter a name.');
            if (isNew && !to.length) throw new Error('Enter at least one To address.');
            if (to.length && !matches.length) throw new Error('Enter at least one keyword.');

            const data = await commitDataChange(VENDORS_PATH, file => {
                if (isNew && file.vendors[id]) throw new Error(`A vendor named "${id}" already exists.`);
                if (!to.length) {
                    delete file.vendors[id];
                    return;
                }
                // Keep any extra settings, such as environment restrictions.
                file.vendors[id] = { ...file.vendors[id], label, matches, to };
            }, isNew ? `Admin: add vendor ${label}` : `Admin: update ${label} outreach contacts`);
            refreshOutreachAfterSave(data, to.length ? id : '');
            return SAVED_MESSAGE;
        }
    });
}

function openOutreachEditor() {
    const target = elements.outreachTarget.value;
    if (target === 'lottery') openLotteryOutreachEditor();
    else if (target) openVendorEditor(target);
    else showAdminMessage('Select a vendor or lottery in Send To first, or use ➕ New vendor.');
}

/* ---------- Setup ---------- */

function setupAdmin() {
    document.getElementById('adminToggleBtn').addEventListener('click', openAdminLogin);
    document.getElementById('editRecipientsBtn').addEventListener('click', openRecipientEditor);
    document.getElementById('editOutreachBtn').addEventListener('click', openOutreachEditor);
    document.getElementById('addVendorBtn').addEventListener('click', () => openVendorEditor());
    document.getElementById('adminForm').addEventListener('submit', handleAdminSubmit);
    document.getElementById('adminCancelBtn').addEventListener('click', () => adminDialog.dialog.close());
    setAdminToken(getAdminToken());
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseAddressList, parseKeywordList };
}

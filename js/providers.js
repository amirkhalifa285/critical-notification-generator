/**
 * Providers and their subproviders for each environment, from
 * data/providers.json. NOC contacts the provider, never the subproviders, so a
 * drop via a subprovider is escalated to its provider. Internal providers
 * (Fusion) are Aristocrat platforms: there is no external contact and the root
 * cause is always the internal investigation.
 */

const INTERNAL_ROOT_CAUSE = 'Under Aristocrat teams investigation';
const PROVIDER_DATA = { internalProviders: [], environments: {} };

function setProviderData(data) {
    PROVIDER_DATA.internalProviders = [...data.internalProviders];
    PROVIDER_DATA.environments = data.environments;
}

// Compare names without case, spaces, or punctuation so "1x2_network" still
// matches "1x2 Network".
function normalizeProviderName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Find the provider responsible for the name typed in Provider / channel.
 * Returns { provider, internal } or null when the name is not mapped.
 */
function resolveProvider(environmentKey, name) {
    const wanted = normalizeProviderName(name || '');
    if (!wanted) return null;

    const providers = PROVIDER_DATA.environments[environmentKey] || {};
    const provider = Object.keys(providers).find(providerName => (
        normalizeProviderName(providerName) === wanted
        || providers[providerName].some(sub => normalizeProviderName(sub) === wanted)
    ));
    if (!provider) return null;

    const internal = PROVIDER_DATA.internalProviders
        .some(internalName => normalizeProviderName(internalName) === normalizeProviderName(provider));
    return { provider, internal };
}

/*
 * Subprovider contacts from the Fusion team's vendor list
 * (data/subproviderContacts.json). Shown to the NOC engineer as a reference
 * only; they are never added to any generated email.
 */
const SUBPROVIDER_CONTACTS = {};

function setSubproviderContactData(data) {
    Object.keys(SUBPROVIDER_CONTACTS).forEach(key => delete SUBPROVIDER_CONTACTS[key]);
    Object.assign(SUBPROVIDER_CONTACTS, data);
}

function getSubproviderContactHint(name) {
    const wanted = normalizeProviderName(name || '');
    const entry = Object.entries(SUBPROVIDER_CONTACTS)
        .find(([subprovider]) => normalizeProviderName(subprovider) === wanted);
    if (!wanted || !entry) return '';

    const [, contact] = entry;
    return `FYI this is the contact email for the subprovider: ${contact.to.join('; ')}, feel free to add them to the outreach email`;
}

/** Providers and subproviders of an environment, for the input suggestions. */
function getProviderSuggestions(environmentKey) {
    const providers = PROVIDER_DATA.environments[environmentKey] || {};
    return [...new Set(Object.entries(providers).flatMap(([provider, subs]) => [provider, ...subs]))];
}

/** Text format used by the admin editor: "Provider: Sub A, Sub B" per line. */
function formatProviderLines(providers) {
    return Object.entries(providers || {})
        .map(([provider, subs]) => (subs.length ? `${provider}: ${subs.join(', ')}` : provider))
        .join('\n');
}

function parseProviderLines(text) {
    const providers = {};
    text.split('\n').forEach(line => {
        const [providerPart, subPart = ''] = line.split(/:(.*)/s);
        const provider = providerPart.trim();
        if (!provider) return;
        const subs = subPart.split(',').map(sub => sub.trim()).filter(Boolean);
        providers[provider] = [...(providers[provider] || []), ...subs];
    });
    return providers;
}

if (typeof module !== 'undefined' && module.exports) {
    setProviderData(require('../data/providers.json'));
    setSubproviderContactData(require('../data/subproviderContacts.json'));
    module.exports = {
        INTERNAL_ROOT_CAUSE,
        PROVIDER_DATA,
        formatProviderLines,
        getProviderSuggestions,
        getSubproviderContactHint,
        parseProviderLines,
        resolveProvider,
        setProviderData,
        setSubproviderContactData
    };
}

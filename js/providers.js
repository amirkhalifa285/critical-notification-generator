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
    module.exports = {
        INTERNAL_ROOT_CAUSE,
        PROVIDER_DATA,
        formatProviderLines,
        getProviderSuggestions,
        parseProviderLines,
        resolveProvider,
        setProviderData
    };
}

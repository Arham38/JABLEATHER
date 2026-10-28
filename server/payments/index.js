const manualProvider = require('./manualProvider');
const sandboxProvider = require('./sandboxProvider');

const providers = {
  manual: manualProvider,
  wire: manualProvider,
  cod: manualProvider,
  sandbox: sandboxProvider,
  card: sandboxProvider, // In sandbox/dev mode, 'card' maps to sandboxProvider
};

/**
 * Returns payment provider implementation by name.
 *
 * @param {string} providerName - e.g. 'sandbox', 'manual', 'wire', 'cod'
 * @returns {import('./PaymentProvider')}
 */
function getPaymentProvider(providerName = 'sandbox') {
  const normalized = String(providerName || 'sandbox').toLowerCase().trim();
  const provider = providers[normalized];

  if (!provider) {
    throw new Error(`Unsupported payment provider: "${providerName}". Supported: ${Object.keys(providers).join(', ')}`);
  }

  return provider;
}

module.exports = {
  getPaymentProvider,
  manualProvider,
  sandboxProvider,
};

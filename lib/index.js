'use strict';

const LibratoLogger = require('./logger');

module.exports = new LibratoLogger({
  email: process.env.LIBRATO_USER,
  token: process.env.LIBRATO_TOKEN,
  metricNamePrefix: process.env.LIBRATO_METRIC_NAME_PREFIX || 'custom_metric',
  enabled: process.env.LIBRATO_ENABLED === 'true',
  flushPeriod: 60000,
  silenceCredentialWarning: true
});

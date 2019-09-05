'use strict';

const uuid = require('uuid/v4');
const libratoClient = require('librato-node');
const logger = require('@emartech/json-logger')('librato-logger');

class LibratoLogger {
  constructor({
    email,
    token,
    metricNamePrefix,
    enabled = true,
    flushPeriod = 60000,
    silenceCredentialWarning = true
  }) {
    this._measurements = {};
    this.metricNamePrefix = metricNamePrefix;
    this.enabled = enabled;
    if (!enabled) {
      return;
    }

    libratoClient.configure({
      email,
      token,
      period: flushPeriod,
      simulate: silenceCredentialWarning
    });

    libratoClient.start();
    this._subscribeToError();
  }

  start(tag, source = 'default') {
    if (!this.enabled) {
      return;
    }

    const startTime = Date.now();
    const id = uuid();

    this._measurements[id] = {
      start: startTime,
      tag,
      source
    };

    return id;
  }

  stop(id) {
    const measurement = this._measurements[id];
    if (measurement) {
      this.log(measurement.tag, measurement.start, measurement.source);
      delete this._measurements[id];
    }
  }

  log(tag, startTime, source = 'default') {
    const elapsedTime = Date.now() - startTime;
    this._storeMeasurement(tag, elapsedTime, source);
  }

  count(tag, count = 1, source = 'default') {
    this._storeMeasurement(tag, count, source);
  }

  countOne(tag, source = 'default') {
    this._storeMeasurement(tag, 1, source);
  }

  _storeMeasurement(tag, measured, source) {
    if (!this.enabled) {
      return;
    }
    libratoClient.measure(`${this.metricNamePrefix}.${tag}`, measured, { source });
  }

  _subscribeToError() {
    libratoClient.on('error', error =>
      logger.warnFromError('librato-client-error', error, { alert_for_two_in_an_hour: true })
    );
  }
}

module.exports = LibratoLogger;

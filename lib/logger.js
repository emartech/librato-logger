'use strict';

const EventEmitter = require('events');
const uuid = require('uuid/v4');
const libratoClient = require('librato-node');

class LibratoLogger extends EventEmitter {
  constructor() {
    super();
    this._measurements = {};
    this.metricNamePrefix = null;
    this.enabled = false;
    this.connected = false;
  }

  connect({
    email,
    token,
    metricNamePrefix,
    enabled = true,
    flushPeriod = 60000,
    silenceCredentialWarning = true
  }) {
    this.metricNamePrefix = metricNamePrefix;
    this.enabled = enabled;

    libratoClient.configure({
      email,
      token,
      period: flushPeriod,
      simulate: silenceCredentialWarning
    });

    libratoClient.start();
    libratoClient.on('error', error => this.emit('error', error));
    this.connected = true;
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
    if (!this.connected) {
      throw new Error('Should connect to librato-logger before using it.');
    }
    if (!this.enabled) {
      return;
    }
    libratoClient.measure(`${this.metricNamePrefix}.${tag}`, measured, { source });
  }
}

module.exports = LibratoLogger;

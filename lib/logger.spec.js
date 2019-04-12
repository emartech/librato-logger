'use strict';

const libratoClient = require('librato-node');
const LibratoLogger = require('./logger');
const logger = require('@emartech/json-logger').Logger;

describe('Librato logger', () => {
  it('should simply log passed time when only log is called', () => {
    sinonSandbox.useFakeTimers(2000);
    sinonSandbox.stub(libratoClient, 'measure');
    const libratoLogger = new LibratoLogger({ email: '', token: '', metricNamePrefix: 'test-prefix' });

    const oneSecondAgo = new Date(Date.now() - 1000);
    libratoLogger.log('test', oneSecondAgo);

    expect(libratoClient.measure).to.have.been.calledWithExactly('test-prefix.test', 1000, {
      source: 'default'
    });
  });

  it('should log elapsed time when stop is called', () => {
    const clock = sinonSandbox.useFakeTimers();
    sinonSandbox.stub(libratoClient, 'measure');
    const libratoLogger = new LibratoLogger({ email: '', token: '', metricNamePrefix: 'test-prefix' });

    const handler = libratoLogger.start('test');
    clock.tick(1000);
    libratoLogger.stop(handler);

    expect(libratoClient.measure).to.have.been.calledWithExactly('test-prefix.test', 1000, {
      source: 'default'
    });
  });

  it('should use custom "source" when its passed', () => {
    sinonSandbox.useFakeTimers(2000);
    sinonSandbox.stub(libratoClient, 'measure');
    const libratoLogger = new LibratoLogger({ email: '', token: '', metricNamePrefix: 'test-prefix' });

    const oneSecondAgo = new Date(Date.now() - 1000);
    libratoLogger.log('test', oneSecondAgo, 'some-uniq-source');

    expect(libratoClient.measure).to.have.been.calledWithExactly('test-prefix.test', 1000, {
      source: 'some-uniq-source'
    });
  });

  it('should not log when librato is not enabled', () => {
    const clock = sinonSandbox.useFakeTimers();
    sinonSandbox.stub(libratoClient, 'measure');
    const libratoLogger = new LibratoLogger({
      enabled: false,
      email: '',
      token: '',
      metricNamePrefix: 'test-prefix'
    });

    const handler = libratoLogger.start('test');
    clock.tick(1000);
    libratoLogger.stop(handler);

    expect(libratoClient.measure).not.have.been.called;
  });

  it('should emmit error emitted from libratoClient', () => {
    sinonSandbox.stub(logger.prototype, 'warnFromError');
    new LibratoLogger({ email: '', token: '', metricNamePrefix: 'test-prefix' });

    libratoClient.emit('error', new Error('test'));

    expect(logger.prototype.warnFromError).to.have.been.called;
  });

  it('should configure libratoClient properly', () => {
    sinonSandbox.stub(libratoClient, 'configure');

    new LibratoLogger({
      email: 'test@ema.il',
      token: 'test-token',
      metricNamePrefix: 'test-prefix',
      flushPeriod: 123,
      silenceCredentialWarning: false
    });

    expect(libratoClient.configure).to.have.been.calledWithExactly({
      email: 'test@ema.il',
      token: 'test-token',
      period: 123,
      simulate: false
    });
  });
});

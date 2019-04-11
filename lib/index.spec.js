'use strict';

const libratoClient = require('librato-node');
const libratoLogger = require('./index');
const logger = require('@emartech/json-logger').Logger;

describe('Librato logger', () => {
  it('should simply log passed time when only log is called', () => {
    sinonSandbox.useFakeTimers(2000);
    sinonSandbox.stub(libratoClient, 'measure');
    libratoLogger.connect({ email: '', token: '', metricNamePrefix: 'test-prefix' });

    const oneSecondAgo = new Date(Date.now() - 1000);
    libratoLogger.log('test', oneSecondAgo);

    expect(libratoClient.measure).to.have.been.calledWithExactly('test-prefix.test', 1000, {
      source: 'default'
    });
  });

  it('should log elapsed time when stop is called', () => {
    const clock = sinonSandbox.useFakeTimers();
    sinonSandbox.stub(libratoClient, 'measure');
    libratoLogger.connect({ email: '', token: '', metricNamePrefix: 'test-prefix' });

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
    libratoLogger.connect({ email: '', token: '', metricNamePrefix: 'test-prefix' });

    const oneSecondAgo = new Date(Date.now() - 1000);
    libratoLogger.log('test', oneSecondAgo, 'some-uniq-source');

    expect(libratoClient.measure).to.have.been.calledWithExactly('test-prefix.test', 1000, {
      source: 'some-uniq-source'
    });
  });

  it('should not log when librato is not enabled', () => {
    const clock = sinonSandbox.useFakeTimers();
    sinonSandbox.stub(libratoClient, 'measure');
    libratoLogger.connect({
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
    libratoLogger.connect({ email: '', token: '', metricNamePrefix: 'test-prefix' });

    libratoClient.emit('error', new Error('test'));

    expect(logger.prototype.warnFromError).to.have.been.called;
  });
});

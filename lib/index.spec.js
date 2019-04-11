'use strict';

const libratoClient = require('librato-node');
const libratoLogger = require('./index');

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
    libratoLogger.connect({ email: '', token: '', metricNamePrefix: 'test-prefix' });
    const stub = sinon.stub();
    libratoLogger.on('error', stub);

    const error = new Error('test');
    libratoClient.emit('error', error);

    expect(stub).to.have.been.calledWith(error);
  });

  it('should throw error when librato logger not connected', () => {
    libratoLogger.log('test', new Date(), 'some-uniq-source');
  });
});

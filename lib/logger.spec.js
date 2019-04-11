'use strict';

const LibratoLogger = require('./logger');

describe('Librato logger', () => {
  it('should throw error when librato logger not connected', () => {
    const libratoLogger = new LibratoLogger();

    expect(
      () => libratoLogger.log('test', new Date(), 'some-uniq-source')
    ).to.throw();
  });
});

import assert from 'node:assert'
import { describe, test } from 'node:test'
import { createLogger, logger } from '../src/logger'

describe('Logger', () => {
  const originalLogLevel = process.env.LOG_LEVEL

  test('should create logger with default level', () => {
    delete process.env.LOG_LEVEL
    const logger = createLogger()
    assert.strictEqual(logger.level, 'info')
  })

  test('should create logger with custom level from env', () => {
    process.env.LOG_LEVEL = 'debug'
    const logger = createLogger()
    assert.strictEqual(logger.level, 'debug')
  })

  test('should create logger with null log level', () => {
    delete process.env.LOG_LEVEL
    const logger = createLogger()
    assert.strictEqual(logger.level, 'info')
  })

  test('should export default logger instance', () => {
    assert.ok(logger)
    assert.strictEqual(typeof logger.info, 'function')
    assert.strictEqual(typeof logger.error, 'function')
    assert.strictEqual(typeof logger.warn, 'function')
    assert.strictEqual(typeof logger.debug, 'function')
  })

  test.after(() => {
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel
    } else {
      delete process.env.LOG_LEVEL
    }
  })
})

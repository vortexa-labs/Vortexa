import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { Agent } from '../src/agent'

describe('Agent API Methods', () => {
  const mockApiKey = 'test-openserv-key'

  test('should have all required API methods', () => {
    const agent = new Agent({
      apiKey: mockApiKey,
      systemPrompt: 'You are a test agent'
    })

    const requiredMethods = [
      'uploadFile',
      'updateTaskStatus',
      'completeTask',
      'markTaskAsErrored',
      'addLogToTask',
      'requestHumanAssistance',
      'sendChatMessage',
      'createTask',
      'getTaskDetail',
      'getAgents',
      'getTasks',
      'getFiles',
      'process',
      'start',
      'addCapability',
      'addCapabilities'
    ]

    requiredMethods.forEach(method => {
      assert.ok(typeof agent[method] === 'function', `${method} should be a function`)
    })
  })

  test('should make process method available when openaiApiKey is provided', () => {
    const agent = new Agent({
      apiKey: mockApiKey,
      systemPrompt: 'You are a test agent',
      openaiApiKey: 'test-openai-key'
    })

    assert.ok(typeof agent.process === 'function')
  })

  test('should throw error when process is called without OpenAI API key', async () => {
    const agent = new Agent({
      apiKey: mockApiKey,
      systemPrompt: 'You are a test agent'
    })

    await assert.rejects(
      () => agent.process({ messages: [{ role: 'user', content: 'test message' }] }),
      {
        message:
          'OpenAI API key is required for process(). Please provide it in options or set OPENAI_API_KEY environment variable.'
      }
    )
  })

  test('should have start method available', () => {
    const agent = new Agent({
      apiKey: mockApiKey,
      systemPrompt: 'You are a test agent'
    })

    assert.ok(typeof agent.start === 'function')
  })
})

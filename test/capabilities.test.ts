import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { z } from 'zod'
import { Agent, Capability } from '../src'

describe('Agent Capabilities', () => {
  const mockApiKey = 'test-openserv-key'

  test('should execute a capability function and return the expected output', async () => {
    const agent = new Agent({
      apiKey: mockApiKey,
      systemPrompt: 'You are a test agent'
    })

    agent.addCapability({
      name: 'testCapability',
      description: 'A test capability',
      schema: z.object({
        input: z.string()
      }),
      run: async ({ args }) => args.input
    })

    const result = await agent.handleToolRoute({
      params: { toolName: 'testCapability' },
      body: { args: { input: 'test' } }
    })

    assert.deepStrictEqual(result, { result: 'test' })
  })

  test('should validate capability schema', () => {
    const capability = new Capability(
      'testCapability',
      'A test capability',
      z.object({
        input: z.number()
      }),
      async ({ args }) => args.input.toString()
    )

    assert.throws(
      () => capability.schema.parse({ input: 'not a number' }),
      err => err instanceof z.ZodError
    )
  })

  test('should handle multiple capabilities', async () => {
    const agent = new Agent({
      apiKey: mockApiKey,
      systemPrompt: 'You are a test agent'
    })

    const capabilities = [
      {
        name: 'tool1',
        description: 'Tool 1',
        schema: z.object({ input: z.string() }),
        run: async ({ args }) => args.input
      },
      {
        name: 'tool2',
        description: 'Tool 2',
        schema: z.object({ input: z.string() }),
        run: async ({ args }) => args.input
      }
    ] as const

    agent.addCapabilities(capabilities)

    // Test that both tools are available by trying to execute them
    await Promise.all([
      agent
        .handleToolRoute({
          params: { toolName: 'tool1' },
          body: { args: { input: 'test1' } }
        })
        .then(result => assert.deepStrictEqual(result, { result: 'test1' })),
      agent
        .handleToolRoute({
          params: { toolName: 'tool2' },
          body: { args: { input: 'test2' } }
        })
        .then(result => assert.deepStrictEqual(result, { result: 'test2' }))
    ])
  })

  test('should throw error when adding duplicate capability', () => {
    const agent = new Agent({
      apiKey: mockApiKey,
      systemPrompt: 'You are a test agent'
    })

    agent.addCapability({
      name: 'test',
      description: 'Tool 1',
      schema: z.object({ input: z.string() }),
      run: async ({ args }) => args.input
    })

    assert.throws(
      () =>
        agent.addCapability({
          name: 'test',
          description: 'Tool 1 duplicate',
          schema: z.object({ input: z.string() }),
          run: async ({ args }) => args.input
        }),
      {
        message: 'Tool with name "test" already exists'
      }
    )
  })

  test('should throw error when adding capabilities with duplicate names', () => {
    const agent = new Agent({
      apiKey: mockApiKey,
      systemPrompt: 'You are a test agent'
    })

    const capabilities = [
      {
        name: 'tool1',
        description: 'Tool 1',
        schema: z.object({ input: z.string() }),
        run: async ({ args }) => args.input
      },
      {
        name: 'tool1',
        description: 'Tool 1 duplicate',
        schema: z.object({ input: z.string() }),
        run: async ({ args }) => args.input
      }
    ] as const

    assert.throws(() => agent.addCapabilities(capabilities), {
      message: 'Tool with name "tool1" already exists'
    })
  })
})

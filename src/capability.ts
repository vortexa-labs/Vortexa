import type { z } from 'zod'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import type { CapabilityFuncParams } from './types'
import type { Agent } from './agent'

export class Capability<Schema extends z.ZodTypeAny> {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly schema: Schema,
    public readonly run: (
      this: Agent,
      params: CapabilityFuncParams<Schema>,
      messages: ChatCompletionMessageParam[]
    ) => string | Promise<string>
  ) {}
}

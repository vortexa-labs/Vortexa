import type { ChatCompletion } from 'openai/resources/chat/completions'
import type { APIPromise } from 'openai/core'

export function createMockOpenAIResponse(response: ChatCompletion): {
  create: () => APIPromise<ChatCompletion>
} {
  return {
    create: () => Promise.resolve(response) as APIPromise<ChatCompletion>
  }
}

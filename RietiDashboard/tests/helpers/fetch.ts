import { vi } from 'vitest'

/** Options of a fake response */
interface FakeResponseInit {
  status?: number
  statusText?: string
}

/**
 * Builds a response with a JSON body
 *
 * @param body - Value sent as JSON
 * @param init - Status and status text
 * @returns The response
 */
export const jsonResponse = (body: unknown, { status = 200, statusText = '' }: FakeResponseInit = {}) =>
  new Response(JSON.stringify(body), { status, statusText, headers: { 'Content-Type': 'application/json' } })

/**
 * Builds a response whose body is not JSON
 *
 * @param text - Body of the response
 * @param init - Status and status text
 * @returns The response
 */
export const textResponse = (text: string, { status = 200, statusText = '' }: FakeResponseInit = {}) =>
  new Response(text, { status, statusText })

/**
 * Replaces the global fetch with a mock that answers with the given responses, in order; the last one repeats
 *
 * @param responses - Responses (or errors to throw) to give to each call
 * @returns The mock, to inspect the calls
 */
export function stubFetch(...responses: (Response | Error | DOMException)[]) {
  const mock = vi.fn<typeof fetch>()
  responses.forEach((response, index) => {
    const isLast = index === responses.length - 1
    const answer = () => (response instanceof Response ? Promise.resolve(response.clone()) : Promise.reject(response))
    if (isLast) mock.mockImplementation(answer)
    else mock.mockImplementationOnce(answer)
  })
  vi.stubGlobal('fetch', mock)
  return mock
}

/**
 * Reads what a fetch call was asked to do
 *
 * @param mock - Mock returned by stubFetch
 * @param index - Number of the call
 * @returns The url, the init and the headers as a plain object
 */
export function callOf(mock: ReturnType<typeof stubFetch>, index = 0) {
  const [url, init] = mock.mock.calls[index]
  const headers = (init?.headers ?? {}) as Record<string, string>
  return { url: String(url), init: init ?? {}, headers, body: init?.body as string | undefined }
}

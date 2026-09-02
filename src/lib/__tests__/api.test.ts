import { CanceledError } from "axios"
import type { InternalAxiosRequestConfig } from "axios"
import { describe, it, expect, vi, afterEach } from "vitest"

import { ApiError } from "@/lib/api-error"
import { api, REQUEST_TIMEOUT_MS } from "@/lib/api"

afterEach(() => {
  vi.useRealTimers()
})

/** Adapter yang menggantung (tidak pernah resolve) sampai signal di-abort. */
function hangingAdapter(config: InternalAxiosRequestConfig): Promise<never> {
  return new Promise((_resolve, reject) => {
    const rejectOnAbort = () => reject(new CanceledError("canceled", config))
    if (config.signal?.aborted) {
      rejectOnAbort()
    } else {
      config.signal?.addEventListener?.("abort", rejectOnAbort, { once: true })
    }
  })
}

describe("api client timeout", () => {
  it("aborts in-flight requests after REQUEST_TIMEOUT_MS with a friendly ApiError", async () => {
    vi.useFakeTimers()

    const promise = api.get("/attendance/today", {
      baseURL: "http://example.test",
      adapter: hangingAdapter,
    })
    const caught = promise.then(
      () => undefined,
      (error) => error,
    )

    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)

    const result = await caught
    expect(result).toBeInstanceOf(ApiError)
    const apiError = result as ApiError
    expect(apiError.statusCode).toBe(408)
    expect(apiError.message).toBe("Permintaan melebihi batas waktu. Silakan coba lagi.")
    expect(apiError.message).not.toMatch(/canceled|at /i)
  })

  it("does not abort a request that finishes before the timeout", async () => {
    vi.useFakeTimers()

    const { data } = await api.get("/attendance/today", {
      baseURL: "http://example.test",
      adapter: async (config) => ({
        data: {
          success: true,
          data: [{ id: "1", userId: 1, date: "2026-09-02", clockIn: null, clockOut: null }],
          timestamp: new Date().toISOString(),
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }),
    })

    expect(data).toEqual([
      { id: "1", userId: 1, date: "2026-09-02", clockIn: null, clockOut: null },
    ])
    expect(vi.getTimerCount()).toBe(0)
  })
})
import { AxiosError, CanceledError } from "axios"
import { describe, it, expect } from "vitest"

import { ApiError, toApiError } from "@/lib/api-error"

describe("toApiError", () => {
  it("passes through an existing ApiError unchanged", () => {
    const err = new ApiError(400, "bad request")
    expect(toApiError(err)).toBe(err)
  })

  it("maps an AxiosError with a response to the server payload message", () => {
    const axiosError = new AxiosError(
      "Request failed with status code 422",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as never,
        data: { statusCode: 422, message: "Email sudah terdaftar" },
      },
    )

    const result = toApiError(axiosError)
    expect(result).toBeInstanceOf(ApiError)
    expect(result.statusCode).toBe(422)
    expect(result.message).toBe("Email sudah terdaftar")
  })

  it("maps a network error (no response) to a friendly message", () => {
    const axiosError = new AxiosError("Network Error", "ECONNREFUSED")

    const result = toApiError(axiosError)
    expect(result.statusCode).toBe(500)
    expect(result.message).toBe("Tidak dapat terhubung ke server. Periksa koneksi Anda.")
  })

  it("maps a canceled (timeout/abort) error to a friendly timeout message, not a raw stack trace", () => {
    const canceled = new CanceledError("canceled")

    const result = toApiError(canceled)
    expect(result).toBeInstanceOf(ApiError)
    expect(result.statusCode).toBe(408)
    expect(result.message).toBe("Permintaan melebihi batas waktu. Silakan coba lagi.")
    expect(result.message).not.toMatch(/canceled|ERR_CANCELED|at .*axios/i)
    expect(result.message).not.toMatch(/\n/)
  })

  it("maps an AxiosError with an already-aborted signal to the timeout message", () => {
    const config = { signal: { aborted: true, reason: new Error("timeout") } } as never
    const axiosError = new AxiosError("canceled", "ERR_CANCELED", config)

    const result = toApiError(axiosError)
    expect(result.statusCode).toBe(408)
    expect(result.message).toBe("Permintaan melebihi batas waktu. Silakan coba lagi.")
  })

  it("maps an ECONNABORTED timeout error to the timeout message", () => {
    const axiosError = new AxiosError("timeout of 15000ms exceeded", "ECONNABORTED")

    const result = toApiError(axiosError)
    expect(result.statusCode).toBe(408)
    expect(result.message).toContain("batas waktu")
  })

  it("maps a plain Error to an ApiError with its message and no stack leak", () => {
    const result = toApiError(new Error("boom"))

    expect(result).toBeInstanceOf(ApiError)
    expect(result.statusCode).toBe(500)
    expect(result.message).toBe("boom")
    expect(result.message).not.toMatch(/\n/)
  })

  it("falls back to a generic message for unknown candidates", () => {
    const result = toApiError("not-an-error")

    expect(result.statusCode).toBe(500)
    expect(result.message).toBe("Terjadi kesalahan yang tidak terduga. Coba lagi nanti.")
  })

  it("strips the internal stack trace from ApiError instances", () => {
    const err = new ApiError(500, "boom")
    expect(err.stack).toBeUndefined()
    const serialized = JSON.stringify(err)
    expect(serialized).not.toContain("at ")
    expect(serialized).not.toContain("stack")
    expect(serialized).toBe(JSON.stringify({ statusCode: 500, name: "ApiError" }))
  })

  it("collapses multi-line messages so stack traces cannot smuggle into the UI", () => {
    const multiline = new Error("boom\n    at file.ts:12\n    at other.ts:34")
    const result = toApiError(multiline)

    expect(result.message).toBe("boom     at file.ts:12     at other.ts:34")
    expect(result.message).not.toMatch(/\n/)
  })

  it("ignores internal server fields (stack, error, debug) when building the UI message", () => {
    const axiosError = new AxiosError(
      "Request failed with status code 500",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: {} as never,
        data: {
          statusCode: 500,
          message: "Terjadi kesalahan",
          error: "Internal Server Error",
          stack: "Error: Terjadi kesalahan\n    at app.controller.ts:10",
        },
      },
    )

    const result = toApiError(axiosError)
    expect(result.message).toBe("Terjadi kesalahan")
    expect(result.message).not.toContain("app.controller.ts")
    expect(result.message).not.toMatch(/\n/)
  })
})
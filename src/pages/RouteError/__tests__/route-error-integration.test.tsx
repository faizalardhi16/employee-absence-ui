import { AxiosError, CanceledError } from "axios"
import type { InternalAxiosRequestConfig } from "axios"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"

import { api, REQUEST_TIMEOUT_MS } from "@/lib/api"
import { ApiError, ERROR_TITLE } from "@/lib/api-error"
import { RouteErrorPage } from "../index"

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

/** Adapter yang melempar error HTTP 500 dari backend. */
function error500Adapter(config: InternalAxiosRequestConfig): Promise<never> {
  return Promise.reject(
    new AxiosError(
      "Request failed with status code 500",
      "ERR_BAD_RESPONSE",
      config,
      undefined,
      {
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config,
        data: { statusCode: 500, message: "Layanan sedang bermasalah" },
      },
    ),
  )
}

function createErrorBoundaryRouter(boom: unknown) {
  function BoomingRoute() {
    throw boom
    return null
  }

  return createMemoryRouter(
    [
      {
        path: "/",
        ErrorBoundary: RouteErrorPage,
        children: [{ index: true, element: <BoomingRoute /> }],
      },
    ],
    { initialEntries: ["/"] },
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("route error boundary integration", () => {
  it("aborts a request after 15s and renders RouteErrorPage with ERROR_TITLE", async () => {
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

    render(<RouterProvider router={createErrorBoundaryRouter(apiError)} />)

    expect(
      screen.getByRole("heading", { name: ERROR_TITLE }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Permintaan melebihi batas waktu/),
    ).toBeInTheDocument()
  })

  it("renders RouteErrorPage with ERROR_TITLE when the API returns a 500 error", async () => {
    const promise = api.get("/attendance/today", {
      baseURL: "http://example.test",
      adapter: error500Adapter,
    })
    const caught = promise.then(
      () => undefined,
      (error) => error,
    )

    const result = await caught
    expect(result).toBeInstanceOf(ApiError)
    const apiError = result as ApiError
    expect(apiError.statusCode).toBe(500)

    render(<RouterProvider router={createErrorBoundaryRouter(apiError)} />)

    expect(
      screen.getByRole("heading", { name: ERROR_TITLE }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Layanan sedang bermasalah/),
    ).toBeInTheDocument()
  })

  it("never exposes stack traces in the rendered error page", async () => {
    const promise = api.get("/attendance/today", {
      baseURL: "http://example.test",
      adapter: error500Adapter,
    })
    const result = await promise.then(
      () => undefined,
      (error) => error,
    )

    render(<RouterProvider router={createErrorBoundaryRouter(result)} />)

    const container = document.body
    expect(container.textContent).not.toMatch(/CanceledError|ERR_BAD_RESPONSE/)
    expect(container.textContent).not.toMatch(/RouteError\/index\.tsx/)
    expect(container.textContent).not.toMatch(/\.(tsx|ts|js):\d+/)
    expect(container.textContent).not.toMatch(/\n/)
  })
})

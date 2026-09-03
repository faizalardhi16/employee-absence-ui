import { AxiosError } from "axios"
import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"

import { RouteErrorPage } from "../index"
import { ERROR_TITLE } from "@/lib/api-error"

const FALLBACK_MESSAGE = "Terjadi kesalahan yang tidak terduga. Coba lagi nanti."
const NETWORK_MESSAGE = "Tidak dapat terhubung ke server. Periksa koneksi Anda."
const TIMEOUT_MESSAGE = "Permintaan melebihi batas waktu. Silakan coba lagi."

function createThrowingRouter(boom: unknown) {
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
  vi.restoreAllMocks()
})

describe("RouteErrorPage", () => {
  it("renders the error title when a route fails", () => {
    render(<RouterProvider router={createThrowingRouter("boom")} />)

    expect(
      screen.getByRole("heading", { name: ERROR_TITLE }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(FALLBACK_MESSAGE)),
    ).toBeInTheDocument()
  })

  it("uses the fallback message for unrecognized errors", () => {
    render(<RouterProvider router={createThrowingRouter("not-an-error")} />)

    expect(
      screen.getByRole("heading", { name: ERROR_TITLE }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(FALLBACK_MESSAGE)),
    ).toBeInTheDocument()
  })

  it("uses the network message for connectivity failures", () => {
    const networkError = new AxiosError("Network Error", "ECONNREFUSED")

    render(<RouterProvider router={createThrowingRouter(networkError)} />)

    expect(
      screen.getByRole("heading", { name: ERROR_TITLE }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(NETWORK_MESSAGE)),
    ).toBeInTheDocument()
  })

  it("renders the timeout message for aborted requests", () => {
    const canceled = new AxiosError("canceled", "ERR_CANCELED", {
      signal: { aborted: true, reason: new Error("timeout") },
    } as never)

    render(<RouterProvider router={createThrowingRouter(canceled)} />)

    expect(
      screen.getByRole("heading", { name: ERROR_TITLE }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(TIMEOUT_MESSAGE)),
    ).toBeInTheDocument()
  })

  it("renders the error title for 500 API errors", () => {
    const serverError = new AxiosError(
      "Request failed with status code 500",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: {} as never,
        data: { statusCode: 500, message: "Layanan sedang bermasalah" },
      },
    )

    render(<RouterProvider router={createThrowingRouter(serverError)} />)

    expect(
      screen.getByRole("heading", { name: ERROR_TITLE }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Layanan sedang bermasalah/),
    ).toBeInTheDocument()
  })

  it("does not expose stack traces or raw error details", () => {
    render(<RouterProvider router={createThrowingRouter("boom-detail")} />)

    expect(screen.queryByText(/boom-detail/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/RouteError\/index\.tsx/)).not.toBeInTheDocument()
  })
})

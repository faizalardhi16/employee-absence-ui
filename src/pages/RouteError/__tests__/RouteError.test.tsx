import { AxiosError } from "axios"
import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"

import { RouteErrorPage } from "../index"

const FALLBACK_MESSAGE = "Terjadi kesalahan yang tidak terduga. Coba lagi nanti."
const NETWORK_MESSAGE = "Tidak dapat terhubung ke server. Periksa koneksi Anda."

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
  vi.restoreAllMocks()
})

describe("RouteErrorPage", () => {
  it("renders the error boundary when a route fails", () => {
    render(<RouterProvider router={createThrowingRouter("boom")} />)

    expect(
      screen.getByRole("heading", { name: FALLBACK_MESSAGE }),
    ).toBeInTheDocument()
  })

  it("uses the fallback message for unrecognized errors", () => {
    render(<RouterProvider router={createThrowingRouter("not-an-error")} />)

    expect(
      screen.getByRole("heading", { name: FALLBACK_MESSAGE }),
    ).toBeInTheDocument()
  })

  it("uses the network message for connectivity failures", () => {
    const networkError = new AxiosError("Network Error", "ECONNREFUSED")

    render(<RouterProvider router={createThrowingRouter(networkError)} />)

    expect(
      screen.getByRole("heading", { name: NETWORK_MESSAGE }),
    ).toBeInTheDocument()
  })

  it("does not expose stack traces or raw error details", () => {
    render(<RouterProvider router={createThrowingRouter("boom-detail")} />)

    expect(screen.queryByText(/boom-detail/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/RouteError\/index\.tsx/)).not.toBeInTheDocument()
  })
})

import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"

import { RouteErrorPage } from "../index"

const ERROR_TITLE = "Terjadi kesalahan yang tidak terduga"

function BoomingRoute() {
  throw new Error("Boom")
  return null
}

function createThrowingRouter() {
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
  it("renders the friendly error title when a route fails", () => {
    render(<RouterProvider router={createThrowingRouter()} />)

    expect(
      screen.getByRole("heading", { name: ERROR_TITLE }),
    ).toBeInTheDocument()
  })

  it("does not expose stack traces or raw error details", () => {
    render(<RouterProvider router={createThrowingRouter()} />)

    expect(screen.queryByText(/Boom/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/RouteError\/index\.tsx/)).not.toBeInTheDocument()
  })
})

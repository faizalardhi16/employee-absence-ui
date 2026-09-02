import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"

import { DashboardPage } from "../index"
import { useAuthStore } from "@/stores/auth.store"
import { attendanceApi } from "@/features/attendance/attendance.api"
import { authApi } from "@/features/auth/auth.api"

vi.mock("@/features/attendance/attendance.api", () => ({
  attendanceApi: {
    getToday: vi.fn(),
    getByDate: vi.fn(),
    clockOut: vi.fn(),
  },
}))

vi.mock("@/features/auth/auth.api", () => ({
  authApi: {
    me: vi.fn(),
    permissions: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}))

const mockedAttendanceApi = vi.mocked(attendanceApi)
const mockedAuthApi = vi.mocked(authApi)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {children}
          <Toaster />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

function setupAuthStore() {
  useAuthStore.getState().setUser({
    userId: "1",
    email: "test@example.com",
    roles: ["admin"],
  })
}

describe("DashboardPage - Auto-refresh and Manual Refresh", () => {
  beforeEach(() => {
    setupAuthStore()
    mockedAttendanceApi.getToday.mockResolvedValue([])
    mockedAttendanceApi.getByDate.mockResolvedValue([])
    mockedAttendanceApi.clockOut.mockResolvedValue({
      id: "1",
      date: "2026-01-01",
      clockIn: "2026-01-01T08:00:00Z",
      clockOut: null,
    })
    mockedAuthApi.permissions.mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearUser()
  })

  it("auto-refreshes attendance data every 30 seconds", async () => {
    vi.useFakeTimers()

    render(<DashboardPage />, { wrapper: createWrapper() })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(mockedAttendanceApi.getByDate).toHaveBeenCalled()
    const callCountAfterInitial = mockedAttendanceApi.getByDate.mock.calls.length

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })

    expect(mockedAttendanceApi.getByDate.mock.calls.length).toBeGreaterThan(
      callCountAfterInitial,
    )

    vi.useRealTimers()
  })

  it("clears the auto-refresh interval on component unmount", async () => {
    vi.useFakeTimers()

    const { unmount } = render(<DashboardPage />, { wrapper: createWrapper() })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(mockedAttendanceApi.getByDate).toHaveBeenCalled()
    const callCountAfterInitial = mockedAttendanceApi.getByDate.mock.calls.length

    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000)
    })

    expect(mockedAttendanceApi.getByDate.mock.calls.length).toBe(
      callCountAfterInitial,
    )

    vi.useRealTimers()
  })

  it("manual Refresh button triggers immediate data refresh", async () => {
    const user = userEvent.setup()

    render(<DashboardPage />, { wrapper: createWrapper() })

    await waitFor(
      () => {
        expect(mockedAttendanceApi.getByDate).toHaveBeenCalled()
      },
      { timeout: 3000 },
    )

    const callCountBefore = mockedAttendanceApi.getByDate.mock.calls.length

    const refreshButton = screen.getByRole("button", { name: /refresh data/i })
    await act(async () => {
      await user.click(refreshButton)
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(mockedAttendanceApi.getByDate.mock.calls.length).toBeGreaterThan(
      callCountBefore,
    )
  })

  it("both auto-refresh and manual refresh use the current selected date", async () => {
    const user = userEvent.setup()

    render(<DashboardPage />, { wrapper: createWrapper() })

    await waitFor(
      () => {
        expect(mockedAttendanceApi.getByDate).toHaveBeenCalled()
      },
      { timeout: 3000 },
    )

    const today = new Date()
    const expectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const initialCalls = mockedAttendanceApi.getByDate.mock.calls
    expect(initialCalls.some((call) => call[0] === expectedDate)).toBe(true)

    const callCountBeforeManual = mockedAttendanceApi.getByDate.mock.calls.length

    const refreshButton = screen.getByRole("button", { name: /refresh data/i })
    await act(async () => {
      await user.click(refreshButton)
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    const allCallsAfterManual = mockedAttendanceApi.getByDate.mock.calls
    expect(allCallsAfterManual.length).toBeGreaterThan(callCountBeforeManual)
    expect(allCallsAfterManual.every((call) => call[0] === expectedDate)).toBe(true)
  })
})

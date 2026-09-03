import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"

import { DashboardPage } from "../index"
import { useAuthStore } from "@/stores/auth.store"
import { attendanceApi } from "@/features/attendance/attendance.api"
import { authApi } from "@/features/auth/auth.api"
import { getBrowserTimeZoneAbbreviation } from "@/lib/time"

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

vi.mock("@/lib/api", () => ({
  getTodayRecord: vi.fn(),
  clockIn: vi.fn(),
  autoCloseRecord: vi.fn(),
}))

import { getTodayRecord, clockIn as apiClockIn, autoCloseRecord } from "@/lib/api"

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
    userId: 1,
    email: "test@example.com",
    roles: ["admin"],
    developerMode: false,
  })
}

function todayDateString(): string {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${today.getFullYear()}-${month}-${day}`
}

function openRecord() {
  return {
    id: "1",
    userId: 1,
    date: todayDateString(),
    clockIn: "2026-01-15T01:30:00Z",
    clockOut: null,
  }
}

describe("DashboardPage - Clock-in confirmation modal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupAuthStore()
    mockedAttendanceApi.getToday.mockResolvedValue([])
    mockedAttendanceApi.getByDate.mockResolvedValue([])
    mockedAttendanceApi.clockOut.mockResolvedValue(openRecord())
    mockedAuthApi.permissions.mockResolvedValue([])
    vi.mocked(getTodayRecord).mockResolvedValue([])
    vi.mocked(autoCloseRecord).mockResolvedValue({
      id: "0",
      userId: 1,
      date: todayDateString(),
      clockIn: "2026-01-15T01:30:00Z",
      clockOut: "2026-01-15T09:00:00Z",
    })
    vi.mocked(apiClockIn).mockResolvedValue(openRecord())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearUser()
  })

  it("opens the confirmation modal with live date/time and timezone when CLOCKED_OUT", async () => {
    const user = userEvent.setup()

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())

    await act(async () => {
      await user.click(clockInButton)
    })

    expect(await screen.findByText("Confirm clock-in?")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^confirm$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument()

    const timeBox = screen.getByTestId("clock-in-confirm-time")
    const abbreviation = getBrowserTimeZoneAbbreviation(new Date())
    expect(timeBox.textContent).toContain(abbreviation)
    expect(timeBox.textContent).toMatch(/\d{1,2}:\d{2}/)

    expect(apiClockIn).not.toHaveBeenCalled()
  })

  it("closes on Cancel without recording a clock-in", async () => {
    const user = userEvent.setup()

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())
    await act(async () => {
      await user.click(clockInButton)
    })

    const cancelButton = await screen.findByRole("button", { name: /^cancel$/i })
    await act(async () => {
      await user.click(cancelButton)
    })

    await waitFor(() =>
      expect(screen.queryByText("Confirm clock-in?")).not.toBeInTheDocument(),
    )
    expect(apiClockIn).not.toHaveBeenCalled()
  })

  it("closes on Escape without recording a clock-in", async () => {
    const user = userEvent.setup()

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())
    await act(async () => {
      await user.click(clockInButton)
    })

    await screen.findByText("Confirm clock-in?")
    await act(async () => {
      await user.keyboard("{Escape}")
    })

    await waitFor(() =>
      expect(screen.queryByText("Confirm clock-in?")).not.toBeInTheDocument(),
    )
    expect(apiClockIn).not.toHaveBeenCalled()
  })

  it("closes on outside click without recording a clock-in", async () => {
    const user = userEvent.setup()

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())
    await act(async () => {
      await user.click(clockInButton)
    })

    await screen.findByText("Confirm clock-in?")
    await act(async () => {
      fireEvent.pointerDown(document.body)
      fireEvent.click(document.body)
    })

    await waitFor(() =>
      expect(screen.queryByText("Confirm clock-in?")).not.toBeInTheDocument(),
    )
    expect(apiClockIn).not.toHaveBeenCalled()
  })

  it("records a clock-in with the timestamp captured at confirm and closes the modal", async () => {
    const user = userEvent.setup()

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())
    await act(async () => {
      await user.click(clockInButton)
    })

    const confirmButton = await screen.findByRole("button", { name: /^confirm$/i })
    const beforeClick = Date.now()
    await act(async () => {
      await user.click(confirmButton)
    })

    await waitFor(() => expect(apiClockIn).toHaveBeenCalledTimes(1))

    const arg = vi.mocked(apiClockIn).mock.calls[0][0]
    expect(typeof arg).toBe("string")
    const captured = new Date(String(arg)).getTime()
    expect(Math.abs(beforeClick - captured)).toBeLessThan(5000)

    await waitFor(() =>
      expect(screen.queryByText("Confirm clock-in?")).not.toBeInTheDocument(),
    )
    expect(await screen.findByText(/Clocked in at:/)).toBeInTheDocument()
    expect(await screen.findByText(/Clock in berhasil/)).toBeInTheDocument()
  })

  it("blocks with 'Already clocked in' and shows no modal when CLOCKED_IN", async () => {
    const user = userEvent.setup()
    mockedAttendanceApi.getToday.mockResolvedValue([openRecord()])

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())
    await act(async () => {
      await user.click(clockInButton)
    })

    expect(await screen.findByRole("alert")).toHaveTextContent("Already clocked in")
    expect(screen.queryByText("Confirm clock-in?")).not.toBeInTheDocument()
    expect(apiClockIn).not.toHaveBeenCalled()
  })

  it("opens only one modal instance on double click", async () => {
    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())

    await act(async () => {
      fireEvent.click(clockInButton)
      fireEvent.click(clockInButton)
    })

    expect(await screen.findByText("Confirm clock-in?")).toBeInTheDocument()
    expect(screen.getAllByRole("dialog")).toHaveLength(1)
  })

  it("creates exactly one clock-in record on rapid repeated Confirm clicks", async () => {
    const user = userEvent.setup()

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())
    await act(async () => {
      await user.click(clockInButton)
    })

    const confirmButton = await screen.findByRole("button", { name: /^confirm$/i })
    await act(async () => {
      fireEvent.click(confirmButton)
      fireEvent.click(confirmButton)
    })

    await waitFor(() => expect(apiClockIn).toHaveBeenCalledTimes(1))
  })

  it("shows an error and records nothing when the system timestamp is missing", async () => {
    const user = userEvent.setup()
    vi.mocked(apiClockIn).mockResolvedValue({
      id: "9",
      userId: 1,
      date: todayDateString(),
      clockIn: null,
      clockOut: null,
    })

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())
    await act(async () => {
      await user.click(clockInButton)
    })

    const confirmButton = await screen.findByRole("button", { name: /^confirm$/i })
    await act(async () => {
      await user.click(confirmButton)
    })

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Invalid clock-in timestamp/,
    )
    expect(apiClockIn).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Clocked in at:/)).not.toBeInTheDocument()
  })

  it("shows an error and records nothing when the system timestamp is invalid", async () => {
    const user = userEvent.setup()
    vi.mocked(apiClockIn).mockResolvedValue({
      id: "9",
      userId: 1,
      date: todayDateString(),
      clockIn: "not-a-date",
      clockOut: null,
    })

    render(<DashboardPage />, { wrapper: createWrapper() })

    const clockInButton = screen.getByRole("button", { name: /clock in/i })
    await waitFor(() => expect(clockInButton).toBeEnabled())
    await act(async () => {
      await user.click(clockInButton)
    })

    const confirmButton = await screen.findByRole("button", { name: /^confirm$/i })
    await act(async () => {
      await user.click(confirmButton)
    })

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Invalid clock-in timestamp/,
    )
    expect(apiClockIn).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Clocked in at:/)).not.toBeInTheDocument()
  })
})
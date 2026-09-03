import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, act, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ClockInConfirmDialog } from "../clock-in-confirm-dialog"
import { getBrowserTimeZoneAbbreviation } from "@/lib/time"

describe("ClockInConfirmDialog", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("renders the title, live clock with browser timezone, and Confirm/Cancel buttons", () => {
    render(
      <ClockInConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByText("Confirm clock-in?")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^confirm$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument()

    const timeBox = screen.getByTestId("clock-in-confirm-time")
    expect(timeBox.textContent).toContain(getBrowserTimeZoneAbbreviation(new Date()))
    expect(timeBox.textContent).toMatch(/\d{1,2}:\d{2}:\d{2}/)
  })

  it("defaults focus to the Cancel button", async () => {
    render(
      <ClockInConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^cancel$/i })).toHaveFocus(),
    )
  })

  it("updates the displayed time every second while open", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-15T01:30:00Z"))

    render(
      <ClockInConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    const readTime = () =>
      screen.getByTestId("clock-in-confirm-time").textContent ?? ""

    const initial = readTime()
    expect(initial).toMatch(/\d{1,2}:\d{2}:\d{2}/)

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(readTime()).not.toBe(initial)
  })

  it("calls onConfirm when the Confirm button is clicked", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ClockInConfirmDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    )

    await user.click(screen.getByRole("button", { name: /^confirm$/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("closes via onOpenChange when Cancel is clicked", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ClockInConfirmDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    )

    await user.click(screen.getByRole("button", { name: /^cancel$/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("disables both buttons while confirming", async () => {
    render(
      <ClockInConfirmDialog
        open
        confirming
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: /^confirm$/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled()
  })
})
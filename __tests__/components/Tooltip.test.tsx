import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import React from "react"

describe("Tooltip", () => {
  it("shows and hides tooltip", async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    // Tooltip should not be visible initially
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    // Simulate mouse over
    await userEvent.hover(screen.getByText("Hover me"))
    const tooltip = await screen.findByRole("tooltip")
    expect(tooltip).toBeVisible()
    // Simulate mouse out
    await userEvent.unhover(screen.getByText("Hover me"))
    await waitFor(() => {
      // O tooltip visual deve sumir
      expect(document.querySelector('.z-50.bg-popover[role="tooltip"]')).toBeNull()
    })
  })
})

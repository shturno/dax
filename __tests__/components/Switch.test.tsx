import { render, screen, fireEvent } from "@testing-library/react"
import { Switch } from "@/components/ui/switch"
import React from "react"

describe("Switch", () => {
  it("renders and toggles checked state", () => {
    render(<Switch data-testid="switch" />)
    const sw = screen.getByTestId("switch")
    expect(sw).not.toBeChecked()
    fireEvent.click(sw)
    expect(sw).toBeChecked()
  })
})

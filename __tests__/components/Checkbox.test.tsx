import { render, screen, fireEvent } from "@testing-library/react"
import { Checkbox } from "@/components/ui/checkbox"
import React from "react"

describe("Checkbox", () => {
  it("renders and toggles checked state", () => {
    render(<Checkbox data-testid="checkbox" />)
    const cb = screen.getByTestId("checkbox")
    expect(cb).not.toBeChecked()
    fireEvent.click(cb)
    expect(cb).toBeChecked()
  })
})

import { render, screen } from "@testing-library/react"
import { Alert } from "@/components/ui/alert"
import React from "react"

describe("Alert", () => {
  it("renders with children", () => {
    render(<Alert>My Alert</Alert>)
    expect(screen.getByText("My Alert")).toBeInTheDocument()
  })
})

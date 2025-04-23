import { render, screen } from "@testing-library/react"
import { Badge } from "@/components/ui/badge"
import React from "react"

describe("Badge", () => {
  it("renders with children", () => {
    render(<Badge>My Badge</Badge>)
    expect(screen.getByText("My Badge")).toBeInTheDocument()
  })
})

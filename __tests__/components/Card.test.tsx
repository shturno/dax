import { render, screen } from "@testing-library/react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import React from "react"

describe("Card", () => {
  it("renders with header and content", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    )
    expect(screen.getByText("Header")).toBeInTheDocument()
    expect(screen.getByText("Content")).toBeInTheDocument()
  })
})

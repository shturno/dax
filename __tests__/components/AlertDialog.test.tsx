import { render, screen, fireEvent } from "@testing-library/react"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import React from "react"

describe("AlertDialog", () => {
  it("opens and closes dialog", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <div>Dialog content</div>
          <AlertDialogAction>Confirm</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    )
    expect(screen.queryByText("Dialog content")).not.toBeInTheDocument()
    fireEvent.click(screen.getByText("Open"))
    expect(screen.getByText("Dialog content")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Cancel"))
    expect(screen.queryByText("Dialog content")).not.toBeInTheDocument()
  })
})

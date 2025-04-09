import { DashboardLayout } from "@/components/dashboard-layout"
import { NotesPage } from "@/components/notes-page"

export default function NotesRoute() {
  return (
    <DashboardLayout>
      <NotesPage />
    </DashboardLayout>
  )
}

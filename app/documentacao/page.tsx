import { DashboardLayout } from '@/components/dashboard-layout';
import { DocumentationPage } from '@/components/documentation-page';

export default function DocumentationRoute() {
  return (
    <DashboardLayout>
      <DocumentationPage />
    </DashboardLayout>
  );
}

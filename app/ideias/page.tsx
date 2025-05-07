import { DashboardLayout } from '@/components/dashboard-layout';
import { IdeasPage } from '@/components/ideas-page';

export default function IdeasRoute() {
  return (
    <DashboardLayout>
      <IdeasPage />
    </DashboardLayout>
  );
}

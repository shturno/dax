import { render, screen } from '@testing-library/react';
jest.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));
jest.mock('@/components/roadmap-page', () => ({
  RoadmapPage: () => <div>Roadmap do Projeto</div>,
}));
import RoadmapRoute from '../../app/roadmap/page';

describe('RoadmapPage route', () => {
  it('renders DashboardLayout and RoadmapPage', () => {
    render(<RoadmapRoute />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByText('Roadmap do Projeto')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
jest.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));
jest.mock('@/components/ideas-page', () => ({
  IdeasPage: () => <div>Ideias do Projeto</div>,
}));
import IdeasRoute from '../../app/ideias/page';

describe('IdeasPage route', () => {
  it('renders DashboardLayout and IdeasPage', () => {
    render(<IdeasRoute />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByText('Ideias do Projeto')).toBeInTheDocument();
  });
});

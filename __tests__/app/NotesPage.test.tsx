import { render, screen } from '@testing-library/react';
jest.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));
jest.mock('@/components/notes-page', () => ({
  NotesPage: () => <div>Notas do Projeto</div>,
}));
import NotesRoute from '../../app/anotacoes/page';

describe('NotesPage route', () => {
  it('renders DashboardLayout and NotesPage', () => {
    render(<NotesRoute />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByText('Notas do Projeto')).toBeInTheDocument();
  });
});

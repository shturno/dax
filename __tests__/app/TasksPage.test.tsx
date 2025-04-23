import { render, screen } from '@testing-library/react';
jest.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));
jest.mock('@/components/tasks-page', () => ({
  TasksPage: () => <div>Tarefas do Projeto</div>,
}));
import TasksRoute from '../../app/tarefas/page';

describe('TasksPage route', () => {
  it('renders DashboardLayout and TasksPage', () => {
    render(<TasksRoute />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByText('Tarefas do Projeto')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
jest.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));
jest.mock('@/components/feedback-page', () => ({
  FeedbackPage: () => <div>Feedback do Projeto</div>,
}));
import FeedbackRoute from '../../app/feedback/page';

describe('FeedbackPage route', () => {
  it('renders DashboardLayout and FeedbackPage', () => {
    render(<FeedbackRoute />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByText('Feedback do Projeto')).toBeInTheDocument();
  });
});

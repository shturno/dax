import React from 'react';
import { render, screen } from '@testing-library/react';
jest.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: any) => <>{children}</>,
}));
import Home from '../../app/page';

describe('Home Loading State', () => {
  beforeAll(() => {
    global.fetch = jest.fn(() => new Promise(() => {}));
  });

  afterAll(() => {
    // @ts-ignore
    global.fetch = undefined;
  });

  it('shows loading spinner while fetching projects', () => {
    render(<Home />);
    expect(screen.getByText(/Carregando projetos.../i)).toBeInTheDocument();
  });
});

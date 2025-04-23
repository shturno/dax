import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewProjectPage from '../../app/projects/new/page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('NewProjectPage', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    // @ts-ignore
    global.fetch = jest.fn();
    push.mockReset();
  });

  it('renders form fields and submit button', () => {
    render(<NewProjectPage />);
    expect(screen.getByLabelText(/Nome do Projeto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar Projeto/i })).toBeInTheDocument();
  });

  it('submits form and navigates on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ project: {
        _id: '1',
        name: 'Test',
        description: 'Desc',
        ownerId: 'owner',
        createdAt: '',
        updatedAt: ''
      } }),
    });
    render(<NewProjectPage />);
    fireEvent.change(screen.getByLabelText(/Nome do Projeto/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Descrição/i), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar Projeto/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
  });

  it('shows error on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'fail' }),
    });
    render(<NewProjectPage />);
    fireEvent.change(screen.getByLabelText(/Nome do Projeto/i), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar Projeto/i }));
    expect(await screen.findByText(/fail/i)).toBeInTheDocument();
  });
});

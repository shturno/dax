import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorComponent from '../../app/error';

describe('Error Boundary UI', () => {
  it('renders error message and retry button, and calls reset on click', () => {
    const error = new Error('Test error');
    const reset = jest.fn();
    render(<ErrorComponent error={error} reset={reset} />);

    expect(screen.getByText(/Ocorreu um erro: Test error/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Tentar Novamente/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(reset).toHaveBeenCalled();
  });
});

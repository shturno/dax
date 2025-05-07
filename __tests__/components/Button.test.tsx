import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('deve renderizar o botão com o texto fornecido', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve aplicar a variante correta', () => {
    render(<Button variant="destructive">Excluir</Button>);
    const button = screen.getByText('Excluir');
    expect(button).toHaveClass('bg-destructive');
  });

  it('deve estar desabilitado quando a prop disabled é true', () => {
    render(<Button disabled>Desabilitado</Button>);
    const button = screen.getByText('Desabilitado');
    expect(button).toBeDisabled();
  });

  it('deve chamar a função onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    screen.getByText('Clique').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

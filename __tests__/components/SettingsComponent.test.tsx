import { render, screen, fireEvent } from '@testing-library/react';
import SettingsComponent from '@/components/settings-component';

describe('SettingsComponent', () => {
  it('deve renderizar o componente corretamente', () => {
    render(<SettingsComponent />);
    expect(screen.getByText('Configurações Adicionais')).toBeInTheDocument();
  });

  it('deve alternar a configuração de notificações', () => {
    render(<SettingsComponent />);
    const toggleButton = screen.getByRole('button', { name: /notificações/i });
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveClass('bg-zinc-700');
  });

  it('deve alterar o idioma selecionado', () => {
    render(<SettingsComponent />);
    const select = screen.getByRole('combobox', { name: /idioma/i });
    fireEvent.change(select, { target: { value: 'en-US' } });
    expect(select).toHaveValue('en-US');
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsComponent from '../../components/settings-component';

describe('SettingsComponent Advanced Tests', () => {
  it('renders all settings options correctly', () => {
    render(<SettingsComponent />);

    // Check headings
    expect(screen.getByText('Configurações Adicionais')).toBeInTheDocument();
    expect(screen.getByText('Notificações')).toBeInTheDocument();
    expect(screen.getByText('Salvamento Automático')).toBeInTheDocument();
    expect(screen.getByText('Idioma')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('Receber notificações do sistema')).toBeInTheDocument();
    expect(screen.getByText('Salvar alterações automaticamente')).toBeInTheDocument();
    expect(screen.getByText('Selecionar idioma da interface')).toBeInTheDocument();

    // Check language options
    const languageSelect = screen.getByLabelText('Selecionar Idioma');
    expect(languageSelect).toBeInTheDocument();
    expect(languageSelect).toHaveValue('pt-BR');
  });

  it('toggles notification setting when clicked', () => {
    render(<SettingsComponent />);

    // Find the notifications toggle button
    const notificationsButton = screen.getByLabelText('Alternar Notificações');

    // Initial state should have the toggle enabled (blue background)
    expect(notificationsButton).toHaveClass('bg-blue-600');

    // Click to toggle off
    fireEvent.click(notificationsButton);
    expect(notificationsButton).toHaveClass('bg-zinc-700');
    expect(notificationsButton).not.toHaveClass('bg-blue-600');

    // Click to toggle on again
    fireEvent.click(notificationsButton);
    expect(notificationsButton).toHaveClass('bg-blue-600');
    expect(notificationsButton).not.toHaveClass('bg-zinc-700');
  });

  it('toggles auto-save setting when clicked', () => {
    render(<SettingsComponent />);

    // Find the auto-save toggle button
    const autoSaveButtons = screen.getAllByRole('button');
    const autoSaveButton = autoSaveButtons.find(button =>
      button.parentElement?.textContent?.includes('Salvamento Automático')
    );
    expect(autoSaveButton).toBeTruthy();

    if (autoSaveButton) {
      // Initial state should have the toggle enabled (blue background)
      expect(autoSaveButton).toHaveClass('bg-blue-600');

      // Click to toggle off
      fireEvent.click(autoSaveButton);
      expect(autoSaveButton).toHaveClass('bg-zinc-700');
      expect(autoSaveButton).not.toHaveClass('bg-blue-600');

      // Click to toggle on again
      fireEvent.click(autoSaveButton);
      expect(autoSaveButton).toHaveClass('bg-blue-600');
      expect(autoSaveButton).not.toHaveClass('bg-zinc-700');
    }
  });

  it('changes language when a different option is selected', () => {
    render(<SettingsComponent />);

    // Find the language select element
    const languageSelect = screen.getByLabelText('Selecionar Idioma');

    // Initial value should be pt-BR
    expect(languageSelect).toHaveValue('pt-BR');

    // Change to English
    fireEvent.change(languageSelect, { target: { value: 'en-US' } });
    expect(languageSelect).toHaveValue('en-US');

    // Change to Spanish
    fireEvent.change(languageSelect, { target: { value: 'es' } });
    expect(languageSelect).toHaveValue('es');

    // Change back to Portuguese
    fireEvent.change(languageSelect, { target: { value: 'pt-BR' } });
    expect(languageSelect).toHaveValue('pt-BR');
  });
});

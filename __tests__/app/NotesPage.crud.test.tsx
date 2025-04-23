import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
jest.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));
import { NotesPage } from '../../components/notes-page';

describe('NotesPage CRUD', () => {
  beforeEach(() => { localStorage.clear(); });

  it('should add a new note', async () => {
    render(<NotesPage />);
    // Seleciona o primeiro botão "Nova Nota" (pode ser necessário ajustar o índice)
    const addButtons = screen.getAllByRole('button', { name: /Nova Nota/i });
    fireEvent.click(addButtons[0]);
    // O campo de título é o primeiro <input> (textbox) visível
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'Nota Teste' } });
    // O campo de conteúdo é o segundo textbox (textarea)
    fireEvent.change(textboxes[1], { target: { value: 'Conteúdo de teste' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    await waitFor(() => expect(screen.getByText('Nota Teste')).toBeInTheDocument());
  });

  it('should edit a note', async () => {
    render(<NotesPage />);
    // Seleciona a nota pelo título
    // Busca todos os Cards e encontra o que contém o título
    const noteTitles = screen.queryAllByText((content, node) => node?.textContent?.includes('Arquitetura do Editor') ?? false);
    expect(noteTitles.length).toBeGreaterThan(0);
    const noteTitle = noteTitles.find(el => el.closest('[data-testid="note-card"]'));
    expect(noteTitle).toBeDefined();
    const card = noteTitle!.closest('[data-testid="note-card"]');
    expect(card).not.toBeNull();
    fireEvent.click(card!);
    await waitFor(() => expect(screen.getByDisplayValue('Arquitetura do Editor')).toBeInTheDocument());
    const titleInput = screen.getByDisplayValue('Arquitetura do Editor');
    fireEvent.change(titleInput, { target: { value: 'Nota Editada' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    await waitFor(() => expect(screen.getByText('Nota Editada')).toBeInTheDocument());
  });

  it('should delete a note', async () => {
    render(<NotesPage />);
    // Seleciona a nota pelo título
    // Busca todos os Cards e encontra o que contém o título
    const noteTitles = screen.queryAllByText((content, node) => node?.textContent?.includes('Arquitetura do Editor') ?? false);
    expect(noteTitles.length).toBeGreaterThan(0);
    const noteTitle = noteTitles.find(el => el.closest('[data-testid="note-card"]'));
    expect(noteTitle).toBeDefined();
    const card = noteTitle!.closest('[data-testid="note-card"]');
    expect(card).not.toBeNull();
    fireEvent.click(card!);
    await waitFor(() => expect(screen.getByDisplayValue('Arquitetura do Editor')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));
    await waitFor(() => expect(screen.getByText(/Confirmar Exclusão/i)).toBeInTheDocument());
    const dialogButtons = screen.getAllByRole('button', { name: /Excluir/i });
    fireEvent.click(dialogButtons[dialogButtons.length - 1]);
    await waitFor(() => {
      expect(
        screen.queryAllByText((content, node) => node?.textContent?.includes('Arquitetura do Editor') ?? false)
      ).toHaveLength(0);
    });
  });

  it('should filter notes', async () => {
    render(<NotesPage />);
    fireEvent.change(screen.getByPlaceholderText(/Buscar nota/i), { target: { value: 'Arquitetura' } });
    await waitFor(() => {
      const cards = screen.getAllByTestId('note-card');
      expect(cards).toHaveLength(1);
      expect(within(cards[0]).getByText('Arquitetura do Editor')).toBeInTheDocument();
    });
  });

  it('should show empty state', async () => {
    // Clear localStorage and set notes to an empty array
    localStorage.clear();
    localStorage.setItem('notes', JSON.stringify([]));
    
    // Render the component with empty notes
    render(<NotesPage />);
    
    // Check for empty state message
    await waitFor(() => {
      expect(screen.getByText('Nenhuma nota selecionada')).toBeInTheDocument();
      expect(screen.getByText('Selecione uma nota para editar ou crie uma nova')).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});

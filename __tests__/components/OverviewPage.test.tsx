// __tests__/components/OverviewPage.test.tsx
import { render, screen } from '@testing-library/react';
import * as React from "react";
jest.mock('@/hooks/useProjectCache', () => ({
  useProjectCache: () => ({
    isLoading: false,
    isError: false,
    projects: [
      { id: '1', name: 'Projeto Teste' },
      { id: '2', name: 'Outro Projeto' }
    ],
    refetch: jest.fn(),
  }),
}));
import { OverviewPage } from '@/components/overview-page';

// Mock da função fetch
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ projects: [{ id: 1, name: 'Projeto 1' }] }),
    })
  ) as jest.Mock;
});

describe('OverviewPage', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve renderizar o componente corretamente', async () => {
    render(<OverviewPage />);
    expect(await screen.findByText('Visão Geral')).toBeInTheDocument();
  });

  it('deve conter o título principal', async () => {
    render(<OverviewPage />);
    const mainTitle = await screen.findByRole('heading', { level: 1 });
    expect(mainTitle).toHaveTextContent('Visão Geral do Projeto');
  });

  it('deve exibir estado de carregamento', () => {
    render(<OverviewPage />);
    expect(screen.getByText('Carregando projetos...')).toBeInTheDocument();
  });

  it('deve lidar com erro de carregamento', async () => {
    jest.resetModules();
    jest.doMock('@/hooks/useProjectCache', () => ({
      useProjectCache: () => ({
        isLoading: false,
        isError: true,
        projects: [],
        refetch: jest.fn(),
      }),
    }));
    // Reimporte o React e o OverviewPage para garantir contexto correto
    const React = require("react");
    const { OverviewPage: OverviewPageErro } = require("@/components/overview-page");
    render(React.createElement(OverviewPageErro));
    expect(await screen.findByText('Erro ao carregar projetos')).toBeInTheDocument();
  });

  // Adicione mais testes conforme necessário
});
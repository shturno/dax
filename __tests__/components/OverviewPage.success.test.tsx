import { render, screen } from '@testing-library/react';
import { OverviewPage } from '../../components/overview-page';

beforeAll(() => {
  // Mock da resposta de API para simular um projeto
  const mockResponse = {
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        projects: [
          {
            _id: '1',
            name: 'Projeto Teste',
            description: 'Descrição do projeto',
            ownerId: 'owner1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
  } as Response;
  
  global.fetch = jest.fn().mockResolvedValue(mockResponse);
});

afterAll(() => {
  // @ts-ignore
  global.fetch = undefined;
});

// Desativando os mocks de hooks que não são usados na implementação atual
// jest.mock('@/hooks/useProjectCache', () => ({
//   useProjectCache: () => ({
//     isLoading: false,
//     isError: false,
//     projects: [
//       { id: '1', name: 'Projeto Teste' },
//       { id: '2', name: 'Outro Projeto' },
//     ],
//     refetch: jest.fn(),
//   }),
// }));

describe('OverviewPage (success)', () => {
  it('renderiza o nome do projeto', async () => {
    render(<OverviewPage />);
    // Use um tempo maior para o findByText para dar tempo ao componente para renderizar
    expect(await screen.findByText('Projeto Teste', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('renderiza a descrição do projeto', async () => {
    render(<OverviewPage />);
    expect(await screen.findByText('Descrição do projeto', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('renderiza o botão de criar novo projeto', async () => {
    render(<OverviewPage />);
    expect(await screen.findByText('Criar Novo Projeto')).toBeInTheDocument();
  });

  it('renderiza o botão de selecionar projeto', async () => {
    render(<OverviewPage />);
    expect(await screen.findByText('Selecionar')).toBeInTheDocument();
  });
});

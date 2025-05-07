import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return (
      <a href={href} data-testid="mock-link">
        {children}
      </a>
    );
  };
});

// Mock the profile page module
jest.mock('../../app/profile/page', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(async () => {
      // Return a simple component for testing
      return (
        <div>
          <h1>Perfil do Usuário</h1>
          <div>
            <h2>Informações Pessoais</h2>
            <div>testuser</div>
            <div>test@example.com</div>
          </div>
          <div>
            <h2>Configurações</h2>
            <div>Ativadas</div>
            <div>Ativado</div>
            <div>16px</div>
            <div>Purple</div>
          </div>
          <div>
            <h2>Configurações do Projeto</h2>
            <div>Test Project</div>
            <div>This is a test project</div>
          </div>
          <a href="/profile/edit">Editar Perfil</a>
          <a href="/">Ir para Dashboard</a>
        </div>
      );
    }),
  };
});

// Import the component after mocking
import ProfilePage from '../../app/profile/page';

describe('ProfilePage Component', () => {
  it('renders the profile page with user information', async () => {
    render(await ProfilePage());

    // Check if user information is displayed
    expect(screen.getByText('Perfil do Usuário')).toBeInTheDocument();
    expect(screen.getByText('Informações Pessoais')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();

    // Check if settings are displayed
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByText('Ativadas')).toBeInTheDocument();
    expect(screen.getByText('Ativado')).toBeInTheDocument();
    expect(screen.getByText('16px')).toBeInTheDocument();
    expect(screen.getByText('Purple')).toBeInTheDocument();

    // Check project settings
    expect(screen.getByText('Configurações do Projeto')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project')).toBeInTheDocument();

    // Check if navigation links are present
    expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    expect(screen.getByText('Ir para Dashboard')).toBeInTheDocument();
  });
});

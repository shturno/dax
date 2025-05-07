import { render } from '@testing-library/react';
import React from 'react';

// Mock dos componentes usados dentro de Providers
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="session-provider">{children}</div>,
}));

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

jest.mock('@/components/theme-color-provider', () => ({
  ThemeColorProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-color-provider">{children}</div>,
}));

// Importa o componente real depois dos mocks
import { Providers } from '../../app/providers';

describe('Providers', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Providers>
        <div>Child</div>
      </Providers>
    );
    expect(getByText('Child')).toBeInTheDocument();
  });
});

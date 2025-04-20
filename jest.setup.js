import '@testing-library/jest-dom'

// Configuração global do Jest
global.console = {
  ...console,
  // Desativa logs de debug durante os testes
  debug: jest.fn(),
  // Desativa logs de info durante os testes
  info: jest.fn(),
  // Desativa logs de warn durante os testes
  warn: jest.fn(),
  // Desativa logs de error durante os testes
  error: jest.fn(),
};

// Mock para o módulo next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    query: {},
    pathname: '/',
    route: '/',
    asPath: '/',
  }),
}));

// Mock para o módulo next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  }),
}));

// Mock do Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  })),
}))

// Mock do MongoDB
jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn(),
  },
})) 
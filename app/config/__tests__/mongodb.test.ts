import { connectToDatabase, __resetClientForTesting } from '../mongodb';

// Limpar mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
  __resetClientForTesting();
});

// Mock simples para MongoClient
jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation((uri, options) => ({
      connect: jest.fn().mockResolvedValue(true),
      db: jest.fn().mockReturnValue({}),
      close: jest.fn(),
    })),
    ObjectId: jest.fn(id => id),
  };
});

describe('connectToDatabase', () => {
  it('should connect and return db and client', async () => {
    const { db, client } = await connectToDatabase();
    expect(db).toBeDefined();
    expect(client).toBeDefined();
  });

  it('should throw error if connection fails', async () => {
    // Sobrescrever o mock do MongoClient diretamente
    const { MongoClient } = require('mongodb');
    MongoClient.mockImplementationOnce(() => ({
      connect: jest.fn().mockRejectedValueOnce(new Error('fail')),
      db: jest.fn(),
    }));
    
    // Forçar nova conexão
    __resetClientForTesting();
    
    // Suprimir erros de console durante o teste
    const consoleErrorOriginal = console.error;
    console.error = jest.fn();
    
    // Verificar se a promessa é rejeitada com o erro correto
    try {
      await expect(connectToDatabase()).rejects.toThrow('fail');
    } finally {
      // Restaurar console.error
      console.error = consoleErrorOriginal;
    }
  });
});

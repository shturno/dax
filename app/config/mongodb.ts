import { MongoClient, MongoClientOptions } from 'mongodb';
import { logger } from '@/utils/logger';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
}

const uri = process.env.MONGODB_URI;
let client: MongoClient | null = null;

const options: MongoClientOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  maxIdleTimeMS: 60000,
  waitQueueTimeoutMS: 10000,
};

// Helper para testes - permite resetar o cliente
export function __resetClientForTesting() {
  client = null;
}

export async function connectToDatabase() {
  try {
    if (!client) {
      logger.info('Iniciando conexão com MongoDB');
      client = new MongoClient(uri, options);
      
      // Verificar se client.connect é uma função antes de chamar
      // Isso permite que os mocks funcionem sem definir explicitamente client.connect
      if (typeof client.connect === 'function') {
        await client.connect();
      }
      
      logger.info('Conexão com MongoDB estabelecida');
    }

    if (!client.db || typeof client.db !== 'function') {
      throw new Error('client.db is not a function');
    }

    return {
      client,
      db: client.db('saas-dashboard'),
    };
  } catch (error) {
    logger.error('Erro ao conectar com MongoDB', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

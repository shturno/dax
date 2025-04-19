import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI!;

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 5000
  },
  readConcern: {
    level: 'majority'
  },
  readPreference: 'primary'
};

let client: MongoClient | null = null;

export async function getMongoClient() {
  if (!client) {
    try {
      client = new MongoClient(uri, options);
      await client.connect();
      console.log('Conexão com MongoDB estabelecida');
    } catch (error) {
      console.error('Erro ao conectar com MongoDB:', error);
      throw error;
    }
  }
  return client;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db("saas-dashboard");
}

export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    console.log('Conexão com MongoDB fechada');
  }
}

// Monitoramento de eventos
if (process.env.NODE_ENV === 'development') {
  const client = new MongoClient(uri, {
    ...options,
    monitorCommands: true
  });

  client.on('commandStarted', (event) => {
    console.log(`Comando iniciado: ${event.commandName}`);
  });

  client.on('commandSucceeded', (event) => {
    console.log(`Comando bem sucedido: ${event.commandName}`);
  });

  client.on('commandFailed', (event) => {
    console.error(`Comando falhou: ${event.commandName}`, event.failure);
  });
} 
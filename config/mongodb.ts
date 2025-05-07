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
    wtimeout: 5000,
  },
  readConcern: {
    level: 'majority',
  },
  readPreference: 'primary',
};

let client: MongoClient | null = null;

// Consolidate MongoDB connection logic
export async function connectToDatabase() {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    client = await global._mongoClientPromise;
  } else {
    if (!client) {
      client = new MongoClient(uri, options);
      await client.connect();
    }
  }
  return { client, db: client.db('saas-dashboard') };
}

export async function getMongoClient() {
  const { client } = await connectToDatabase();
  return client;
}

export async function getDb() {
  const { db } = await connectToDatabase();
  return db;
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
    monitorCommands: true,
  });

  client.on('commandStarted', event => {
    console.log(`Comando iniciado: ${event.commandName}`);
  });

  client.on('commandSucceeded', event => {
    console.log(`Comando bem sucedido: ${event.commandName}`);
  });

  client.on('commandFailed', event => {
    console.error(`Comando falhou: ${event.commandName}`, event.failure);
  });
}

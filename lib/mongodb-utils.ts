import { MongoClient } from "mongodb";

// Cache para reutilizar conexões quando possível
let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getCollection(collectionName: string) {
  const client = await getMongoClient();
  const db = client.db("saas-dashboard");
  return db.collection(collectionName);
}

export async function findUserByEmail(email: string) {
  const client = await getMongoClient();
  const db = client.db("saas-dashboard");
  const normalizedEmail = email.toLowerCase();
  
  return db.collection("users").findOne({ email: normalizedEmail });
}

// Adicione outras funções de utilidade conforme necessário
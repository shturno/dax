const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    // Obter as coleções
    const testDb = client.db('test');
    const saasDb = client.db('saas-dashboard');

    // Listar todas as coleções no banco 'test'
    const collections = await testDb.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Migrando coleção: ${collectionName}`);

      // Obter todos os documentos
      const docs = await testDb.collection(collectionName).find({}).toArray();
      console.log(`${docs.length} documentos encontrados`);

      if (docs.length > 0) {
        // Inserir no novo banco
        const result = await saasDb.collection(collectionName).insertMany(docs);
        console.log(`${result.insertedCount} documentos migrados`);
      }
    }

    console.log('Migração concluída');
  } finally {
    await client.close();
  }
}

migrate().catch(console.error);

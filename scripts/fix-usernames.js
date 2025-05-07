// scripts/fix-usernames.js
const { MongoClient } = require('mongodb');

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://<usuario>:<senha>@<cluster>/<dbname>?retryWrites=true&w=majority';
const dbName = 'saas-dashboard';
const collectionName = 'users';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection(collectionName);

    const result = await users.updateMany(
      { username: { $exists: false }, email: { $type: 'string' } },
      [
        {
          $set: {
            username: {
              $arrayElemAt: [{ $split: ['$email', '@'] }, 0],
            },
          },
        },
      ]
    );

    console.log(`Usuários atualizados: ${result.modifiedCount}`);
  } catch (err) {
    console.error('Erro ao atualizar usuários:', err);
  } finally {
    await client.close();
  }
}

main();

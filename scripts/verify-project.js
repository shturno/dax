require('dotenv').config(); // Load environment variables
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI não está definido. Verifique o arquivo .env.');
  process.exit(1);
}

console.log('MONGODB_URI:', uri); // Print the connection string for debugging

const projectId = '6811dda09a4bcc7bde6351d0';

(async () => {
  const client = new MongoClient(uri);
  try {
    console.log('Conectando ao MongoDB...');
    await client.connect();
    const db = client.db('saas-dashboard');
    const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
    if (project) {
      console.log('Projeto encontrado:', project);
    } else {
      console.log('Projeto não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao verificar projeto:', error);
  } finally {
    await client.close();
    console.log('Conexão com MongoDB fechada.');
  }
})();
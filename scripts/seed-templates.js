const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('saas-dashboard');
  await db.collection('templates').deleteMany({});
  await db.collection('templates').insertMany([
    {
      name: 'Projeto Exemplo 1',
      description: 'Exemplo de projeto genérico',
      tasks: ['Tarefa 1'],
      notes: ['Nota 1'],
      roadmap: [],
      features: [],
      ideas: ['Ideia 1'],
      feedback: [],
    },
  ]);
  await client.close();
}
main();

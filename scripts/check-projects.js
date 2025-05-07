require('dotenv').config({ path: '/home/shturno/gabriel/projects/saas-dashboard/.env' });
const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI não está definido. Verifique o arquivo .env.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    console.log('Conectando ao MongoDB...');
    await client.connect();
    console.log('Conexão bem-sucedida!');

    const db = client.db('saas-dashboard'); // Substitua pelo nome correto do banco de dados
    const projects = await db.collection('projects').find({}).toArray();

    if (projects.length === 0) {
      console.log('Nenhum projeto encontrado no banco de dados.');
    } else {
      console.log('Projetos encontrados:', projects);
    }
  } catch (error) {
    console.error('Erro ao consultar o banco de dados:', error);
  } finally {
    await client.close();
    console.log('Conexão encerrada.');
  }
})();
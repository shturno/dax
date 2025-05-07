require('dotenv').config({ path: '/home/shturno/gabriel/projects/saas-dashboard/.env' });
console.log('Variáveis de ambiente carregadas:', process.env); // Log para depuração
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI não está definido. Verifique o arquivo .env.');
  process.exit(1);
}

console.log('URI carregada:', uri); // Log adicional para depuração

(async () => {
  const client = new MongoClient(uri);
  try {
    console.log('Tentando conectar ao MongoDB...');
    await client.connect();
    console.log('Conexão com MongoDB bem-sucedida!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  } finally {
    await client.close();
    console.log('Conexão encerrada.');
  }
})();
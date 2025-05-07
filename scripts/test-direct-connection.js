const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '/home/shturno/gabriel/projects/saas-dashboard/.env' }); // Forçar o carregamento do arquivo .env

const uri = process.env.MONGODB_URI || 'mongodb+srv://shturno:7auOLqtUlbRhWxKC@stackpilot.khged3e.mongodb.net/saas-dashboard?retryWrites=true&w=majority&appName=StackPilot'; // Fallback to hardcoded string if env variable is missing
console.log('URI carregada do .env:', uri); // Log para verificar a URI
if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
  console.error('Formato inválido da URI:', uri);
  process.exit(1);
}

(async () => {
  const client = new MongoClient(uri);
  try {
    console.log('Tentando conectar ao MongoDB diretamente...');
    console.log('Validando o formato da URI:', uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')); // Verificar o formato da URI
    await client.connect();
    console.log('Conexão com MongoDB bem-sucedida!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  } finally {
    await client.close();
    console.log('Conexão encerrada.');
  }
})();
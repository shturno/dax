const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function cleanDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Usar explicitamente o banco correto
    const db = mongoose.connection.useDb('saas-dashboard');
    
    // Remover todos os documentos da coleção users
    const result = await db.collection('users').deleteMany({});
    console.log(`Removidos ${result.deletedCount} usuários`);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.disconnect();
  }
}

cleanDb();
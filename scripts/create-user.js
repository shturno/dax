const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createUser() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    // Apontar diretamente para o banco saas-dashboard
    const db = client.db('saas-dashboard');

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('senha123', salt);

    // Criar um novo usuário
    const result = await db.collection('users').insertOne({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      settings: {
        projectName: 'AI Editor',
        projectDescription: 'Editor com IA acessado via navegador',
        notifications: true,
        autoSave: true,
        autoSaveInterval: 5,
        fontSize: 16,
        primaryColor: 'default',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`Usuário criado com ID: ${result.insertedId}`);
  } finally {
    await client.close();
  }
}

createUser().catch(console.error);

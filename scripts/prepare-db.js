const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function prepareDatabase() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const db = mongoose.connection.useDb('saas-dashboard');

    console.log('Removendo usuários existentes...');
    await db.collection('users').deleteMany({});

    const username = 'teste';
    const email = 'teste@exemplo.com';
    const password = 'teste123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`Criando usuário de teste: ${email} / ${password}`);
    console.log(`Hash gerado: ${hashedPassword}`);

    await db.collection('users').insertOne({
      username,
      email,
      password: hashedPassword,
      settings: {
        projectName: 'Projeto Teste',
        projectDescription: 'Descrição de teste',
        notifications: true,
        autoSave: true,
        autoSaveInterval: 5,
        fontSize: 16,
        primaryColor: 'default',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await db.collection('users').findOne({ email });
    console.log(`Usuário criado com ID: ${user._id}`);

    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Teste de verificação: ${isValid ? 'PASSOU' : 'FALHOU'}`);

    console.log('\n📝 Use estas credenciais para login:');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await mongoose.disconnect();
  }
}

prepareDatabase();

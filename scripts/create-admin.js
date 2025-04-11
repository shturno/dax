const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Usar explicitamente o banco correto
    const db = mongoose.connection.useDb('saas-dashboard');
    
    // Senha simples para debugging
    const password = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Hash da senha:', hashedPassword);
    
    // Criar usuário admin
    await db.collection('users').insertOne({
      username: "admin",
      email: "admin@exemplo.com",
      password: hashedPassword,
      settings: { projectName: "Admin" }
    });
    
    console.log('Usuário admin criado!');
    console.log('Email: admin@exemplo.com');
    console.log('Senha: admin123');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.disconnect();
  }
}

createAdmin();
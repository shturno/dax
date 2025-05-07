/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Selecionar o banco de dados do seu projeto
use('saas-dashboard');

// Criar coleção de usuários se não existir
db.createCollection('users');

// Inserir um usuário de teste
db.users.insertOne({
  username: 'usuarioteste',
  email: 'teste@exemplo.com',
  password: '$2a$10$X7VYHy4MO1bFJ2ziRYGGF.0ROJVVs2zhCdy1dGhjqHCgQgmPQk94i', // "senha123" em hash
  settings: {
    projectName: 'Projeto Teste',
    projectDescription: 'Descrição de um projeto de teste',
    notifications: true,
    autoSave: true,
    autoSaveInterval: 5,
    fontSize: 16,
    primaryColor: 'default',
  },
  createdAt: new Date(),
});

// Listar todos os usuários
db.users.find();

// Criar coleção de documentos
db.createCollection('documents');

// Inserir um documento de teste
db.documents.insertOne({
  userId: db.users.findOne()._id, // Pega o ID do primeiro usuário
  title: 'Meu Primeiro Documento',
  content: 'Conteúdo de exemplo para testar o banco de dados',
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Listar todos os documentos
db.documents.find();

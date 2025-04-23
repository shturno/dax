import { getCurrentProject, createProject, updateProject } from '../projects-service';
import { connectToDatabase } from '@/app/config/mongodb';

// Mock do módulo mongodb
jest.mock('mongodb', () => {
  const mockObjectId = jest.fn().mockImplementation((id) => ({
    toString: jest.fn().mockReturnValue(id || 'mock-id'),
    toHexString: jest.fn().mockReturnValue(id || 'mock-id')
  }));
  
  return {
    ObjectId: mockObjectId,
    MongoClient: jest.fn()
  };
});

// Mock do módulo de conexão com MongoDB
jest.mock('@/app/config/mongodb', () => ({
  connectToDatabase: jest.fn()
}));

// Mock do logger para evitar logs durante os testes
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Projects Service', () => {
  // Setup mocks
  const mockCollection = {
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn()
  };
  
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };
  
  const mockDbConnection = {
    db: mockDb,
    client: { close: jest.fn() }
  };
  
  // Reset mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
    (connectToDatabase as jest.Mock).mockResolvedValue({ db: mockDb, client: mockDbConnection.client });
  });

  describe('getCurrentProject', () => {
    it('deve retornar erro se o userId não for fornecido', async () => {
      const result = await getCurrentProject('');
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('ID do usuário é obrigatório');
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('deve retornar 404 se nenhum projeto for encontrado', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      
      const result = await getCurrentProject('user123');
      
      expect(mockDb.collection).toHaveBeenCalledWith('projects');
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Nenhum projeto encontrado');
    });

    it('deve retornar o projeto mais recente do usuário', async () => {
      const mockProject = {
        _id: { toString: () => '5f9f1b9b9c9d1c0b8c8b4567' },
        ownerId: { toString: () => '5f9f1b9b9c9d1c0b8c8b4568' },
        name: 'Projeto de Teste',
        description: 'Descrição do projeto',
        tasks: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCollection.findOne.mockResolvedValue(mockProject);
      
      const result = await getCurrentProject('user123');
      
      expect(mockDb.collection).toHaveBeenCalledWith('projects');
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.project).toEqual({
        ...mockProject,
        _id: mockProject._id.toString(),
        ownerId: mockProject.ownerId.toString()
      });
    });

    it('deve lidar com erros durante a busca do projeto', async () => {
      const mockError = new Error('Erro de conexão');
      mockCollection.findOne.mockRejectedValue(mockError);
      
      const result = await getCurrentProject('user123');
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro de conexão');
    });
  });

  describe('createProject', () => {
    it('deve retornar erro se o userId não for fornecido', async () => {
      const result = await createProject('', { name: 'Novo Projeto' });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('ID do usuário é obrigatório');
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('deve retornar erro se o nome do projeto não for fornecido', async () => {
      const result = await createProject('user123', { name: '' });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Nome do projeto é obrigatório');
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('deve criar um novo projeto com sucesso', async () => {
      const mockInsertedId = { toString: () => '5f9f1b9b9c9d1c0b8c8b4567' };
      mockCollection.insertOne.mockResolvedValue({ insertedId: mockInsertedId });
      
      const projectData = {
        name: 'Novo Projeto',
        description: 'Descrição do novo projeto'
      };
      
      const result = await createProject('user123', projectData);
      
      expect(mockDb.collection).toHaveBeenCalledWith('projects');
      expect(mockCollection.insertOne).toHaveBeenCalled();
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.project).toEqual(expect.objectContaining({
        _id: mockInsertedId.toString(),
        name: projectData.name,
        description: projectData.description
      }));
    });

    it('deve lidar com erros durante a criação do projeto', async () => {
      const mockError = new Error('Erro ao inserir no banco');
      mockCollection.insertOne.mockRejectedValue(mockError);
      
      const result = await createProject('user123', { name: 'Novo Projeto' });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro ao criar projeto');
    });
  });

  describe('updateProject', () => {
    it('deve retornar erro se o userId não for fornecido', async () => {
      const result = await updateProject('', { _id: 'project123', name: 'Projeto Atualizado' });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('ID do usuário é obrigatório');
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('deve retornar erro se o ID do projeto não for fornecido', async () => {
      const result = await updateProject('user123', { _id: '', name: 'Projeto Atualizado' });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('ID do projeto é obrigatório');
      expect(connectToDatabase).not.toHaveBeenCalled();
    });

    it('deve retornar 404 se o projeto não for encontrado', async () => {
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });
      
      const result = await updateProject('user123', { _id: 'project123', name: 'Projeto Atualizado' });
      
      expect(mockDb.collection).toHaveBeenCalledWith('projects');
      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Projeto não encontrado');
    });

    it('deve atualizar o projeto com sucesso', async () => {
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      
      const updateData = {
        _id: 'project123',
        name: 'Projeto Atualizado',
        description: 'Nova descrição'
      };
      
      const result = await updateProject('user123', updateData);
      
      expect(mockDb.collection).toHaveBeenCalledWith('projects');
      expect(mockCollection.updateOne).toHaveBeenCalled();
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.project).toEqual(expect.objectContaining({
        _id: updateData._id,
        name: updateData.name,
        description: updateData.description
      }));
    });

    it('deve lidar com erros durante a atualização do projeto', async () => {
      const mockError = new Error('Erro ao atualizar no banco');
      mockCollection.updateOne.mockRejectedValue(mockError);
      
      const result = await updateProject('user123', { _id: 'project123', name: 'Projeto Atualizado' });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro ao atualizar projeto');
    });
  });
});

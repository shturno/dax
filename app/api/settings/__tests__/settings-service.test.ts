import { MongoClient } from 'mongodb';
import { getUserSettings, updateUserSettings, changeUserPassword } from '../settings-service';

// Mock do módulo mongodb
jest.mock('mongodb', () => {
  const mockObjectId = jest.fn().mockImplementation((id) => ({
    toString: jest.fn().mockReturnValue(id || 'mock-id'),
    toHexString: jest.fn().mockReturnValue(id || 'mock-id')
  }));
  
  return {
    ObjectId: mockObjectId,
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn(),
          updateOne: jest.fn()
        })
      })
    }))
  };
});

// Mock do bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  genSalt: jest.fn().mockResolvedValue('mock-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

// Mock do logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Settings Service', () => {
  let mockClient: any;
  let mockCollection: any;
  let mockDb: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks
    mockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn()
    };
    
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    mockClient = {
      connect: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
      db: jest.fn().mockReturnValue(mockDb)
    };
    
    // Corrigir o tipo do mock do MongoClient
    const mockedMongoClient = MongoClient as unknown as jest.Mock;
    mockedMongoClient.mockImplementation(() => mockClient);
  });
  
  describe('getUserSettings', () => {
    it('deve retornar erro se o email não for fornecido', async () => {
      const result = await getUserSettings('');
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Email é obrigatório');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar 404 se o usuário não for encontrado', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      
      const result = await getUserSettings('user@example.com');
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Usuário não encontrado');
    });
    
    it('deve retornar as configurações do usuário', async () => {
      const mockUser = {
        email: 'user@example.com',
        settings: {
          theme: 'dark',
          language: 'pt-BR',
          notifications: {
            email: true,
            push: false
          }
        }
      };
      
      mockCollection.findOne.mockResolvedValue(mockUser);
      
      const result = await getUserSettings('user@example.com');
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.settings).toEqual(mockUser.settings);
    });
    
    it('deve retornar um objeto vazio se o usuário não tiver configurações', async () => {
      const mockUser = {
        email: 'user@example.com'
      };
      
      mockCollection.findOne.mockResolvedValue(mockUser);
      
      const result = await getUserSettings('user@example.com');
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.settings).toEqual({});
    });
    
    it('deve normalizar o email para minúsculas', async () => {
      const mockUser = {
        email: 'user@example.com',
        settings: { theme: 'light' }
      };
      
      mockCollection.findOne.mockResolvedValue(mockUser);
      
      const result = await getUserSettings('USER@Example.com');
      
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });
    
    it('deve lidar com erros durante a busca das configurações', async () => {
      const mockError = new Error('Erro de conexão');
      mockCollection.findOne.mockRejectedValue(mockError);
      
      const result = await getUserSettings('user@example.com');
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro no servidor');
    });
  });
  
  describe('updateUserSettings', () => {
    it('deve retornar erro se o email não for fornecido', async () => {
      const result = await updateUserSettings('', { theme: 'dark' });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Email é obrigatório');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar erro se as configurações não forem fornecidas', async () => {
      const result = await updateUserSettings('user@example.com', null as any);
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Configurações são obrigatórias');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar 404 se o usuário não for encontrado', async () => {
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });
      
      const result = await updateUserSettings('user@example.com', { theme: 'dark' });
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Usuário não encontrado');
    });
    
    it('deve atualizar as configurações do usuário com sucesso', async () => {
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      
      const settings = {
        theme: 'dark',
        language: 'pt-BR',
        notifications: {
          email: true,
          push: false
        }
      };
      
      const result = await updateUserSettings('user@example.com', settings);
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Configurações atualizadas com sucesso');
    });
    
    it('deve normalizar o email para minúsculas ao atualizar configurações', async () => {
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      
      const settings = { theme: 'light' };
      const result = await updateUserSettings('USER@Example.com', settings);
      
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'user@example.com' },
        expect.objectContaining({
          $set: expect.objectContaining({
            settings: settings
          })
        })
      );
      expect(result.success).toBe(true);
    });
    
    it('deve incluir a data de atualização ao modificar as configurações', async () => {
      jest.useFakeTimers();
      const mockDate = new Date('2025-01-01T12:00:00Z');
      jest.setSystemTime(mockDate);
      
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      
      const settings = { theme: 'dark' };
      await updateUserSettings('user@example.com', settings);
      
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'user@example.com' },
        {
          $set: {
            settings: settings,
            updatedAt: mockDate
          }
        }
      );
      
      jest.useRealTimers();
    });
    
    it('deve lidar com erros durante a atualização das configurações', async () => {
      const mockError = new Error('Erro de conexão');
      mockCollection.updateOne.mockRejectedValue(mockError);
      
      const result = await updateUserSettings('user@example.com', { theme: 'dark' });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro no servidor');
    });
  });
  
  describe('changeUserPassword', () => {
    const bcrypt = require('bcryptjs');
    
    beforeEach(() => {
      (bcrypt.compare as jest.Mock).mockReset();
    });
    
    it('deve retornar erro se o email não for fornecido', async () => {
      const result = await changeUserPassword('', { 
        currentPassword: 'senha123', 
        newPassword: 'novaSenha123' 
      });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Email é obrigatório');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar erro se a senha atual não for fornecida', async () => {
      const result = await changeUserPassword('user@example.com', { 
        currentPassword: '', 
        newPassword: 'novaSenha123' 
      });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Todos os campos são obrigatórios');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar erro se a nova senha não for fornecida', async () => {
      const result = await changeUserPassword('user@example.com', { 
        currentPassword: 'senha123', 
        newPassword: '' 
      });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Todos os campos são obrigatórios');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar erro se a nova senha tiver menos de 6 caracteres', async () => {
      const result = await changeUserPassword('user@example.com', { 
        currentPassword: 'senha123', 
        newPassword: '12345' 
      });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('A nova senha deve ter pelo menos 6 caracteres');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar 404 se o usuário não for encontrado', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      
      const result = await changeUserPassword('user@example.com', { 
        currentPassword: 'senha123', 
        newPassword: 'novaSenha123' 
      });
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Usuário não encontrado');
    });
    
    it('deve retornar erro se a senha atual estiver incorreta', async () => {
      const mockUser = {
        email: 'user@example.com',
        password: 'hashed-password'
      };
      
      mockCollection.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const result = await changeUserPassword('user@example.com', { 
        currentPassword: 'senha-errada', 
        newPassword: 'novaSenha123' 
      });
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('senha-errada', 'hashed-password');
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Senha atual incorreta');
    });
    
    it('deve retornar erro se a atualização da senha falhar', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password'
      };
      
      mockCollection.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });
      
      const result = await changeUserPassword('user@example.com', { 
        currentPassword: 'senha123', 
        newPassword: 'novaSenha123' 
      });
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'hashed-password');
      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Falha ao atualizar senha');
    });
    
    it('deve alterar a senha do usuário com sucesso', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password'
      };
      
      mockCollection.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      
      const result = await changeUserPassword('user@example.com', { 
        currentPassword: 'senha123', 
        newPassword: 'novaSenha123' 
      });
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'hashed-password');
      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Senha alterada com sucesso');
    });
    
    it('deve lidar com erros durante a alteração da senha', async () => {
      const mockError = new Error('Erro de conexão');
      mockCollection.findOne.mockRejectedValue(mockError);
      
      const result = await changeUserPassword('user@example.com', { 
        currentPassword: 'senha123', 
        newPassword: 'novaSenha123' 
      });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro de conexão');
    });
    
    it('deve normalizar o email para minúsculas ao alterar a senha', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password'
      };
      
      mockCollection.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      
      await changeUserPassword('USER@Example.com', { 
        currentPassword: 'senha123', 
        newPassword: 'novaSenha123' 
      });
      
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
    });
    
    it('deve testar a geração de salt e hash da senha', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password'
      };
      
      mockCollection.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      
      await changeUserPassword('user@example.com', { 
        currentPassword: 'senha123', 
        newPassword: 'novaSenha123' 
      });
      
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha123', 'mock-salt');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'user-id' },
        { $set: { password: 'hashed-password', updatedAt: expect.any(Date) } }
      );
    });
  });
});

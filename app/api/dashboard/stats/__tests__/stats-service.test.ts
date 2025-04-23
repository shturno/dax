import { getDashboardStats, recordActivity } from '../stats-service';

// Mock do módulo mongodb
jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          countDocuments: jest.fn(),
          find: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          toArray: jest.fn(),
          insertOne: jest.fn()
        })
      })
    }))
  };
});

// Mock do logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Stats Service', () => {
  let mockClient: any;
  let mockCollection: any;
  let mockDb: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks
    mockCollection = {
      countDocuments: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      insertOne: jest.fn()
    };
    
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    mockClient = {
      connect: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
      db: jest.fn().mockReturnValue(mockDb)
    };
    
    // Substituir a implementação do MongoClient
    const mongodb = require('mongodb');
    (mongodb.MongoClient as jest.Mock).mockImplementation(() => mockClient);
  });
  
  describe('getDashboardStats', () => {
    it('deve retornar erro se o email não for fornecido', async () => {
      const result = await getDashboardStats('');
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Email é obrigatório');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar as estatísticas do dashboard', async () => {
      const mockTotalUsers = 42;
      const mockActivities = [
        {
          _id: 'activity1',
          userEmail: 'user@example.com',
          action: 'login',
          createdAt: new Date()
        },
        {
          _id: 'activity2',
          userEmail: 'user@example.com',
          action: 'view_profile',
          target: 'profile',
          createdAt: new Date()
        }
      ];
      
      mockCollection.countDocuments.mockResolvedValue(mockTotalUsers);
      mockCollection.toArray.mockResolvedValue(mockActivities);
      
      const result = await getDashboardStats('user@example.com');
      
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.countDocuments).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('activities');
      expect(mockCollection.find).toHaveBeenCalledWith({ userEmail: 'user@example.com' });
      expect(mockCollection.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(mockCollection.toArray).toHaveBeenCalled();
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.stats).toEqual({
        totalUsers: mockTotalUsers,
        activities: expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            userEmail: 'user@example.com',
            action: expect.any(String)
          })
        ])
      });
    });
    
    it('deve normalizar o email para minúsculas', async () => {
      const mockTotalUsers = 10;
      const mockActivities = [
        {
          _id: 'activity1',
          userEmail: 'user@example.com',
          action: 'login',
          createdAt: new Date()
        }
      ];
      
      mockCollection.countDocuments.mockResolvedValue(mockTotalUsers);
      mockCollection.toArray.mockResolvedValue(mockActivities);
      
      await getDashboardStats('USER@Example.com');
      
      expect(mockCollection.find).toHaveBeenCalledWith({ userEmail: 'user@example.com' });
    });
    
    it('deve retornar um array vazio se não houver atividades', async () => {
      const mockTotalUsers = 5;
      
      mockCollection.countDocuments.mockResolvedValue(mockTotalUsers);
      mockCollection.toArray.mockResolvedValue([]);
      
      const result = await getDashboardStats('user@example.com');
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.stats).toEqual({
        totalUsers: mockTotalUsers,
        activities: []
      });
    });
    
    it('deve lidar com erros durante a busca das estatísticas', async () => {
      const mockError = new Error('Erro de conexão');
      mockCollection.countDocuments.mockRejectedValue(mockError);
      
      const result = await getDashboardStats('user@example.com');
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro ao buscar estatísticas');
    });
    
    it('deve lidar com erros na consulta de atividades', async () => {
      const mockError = new Error('Erro na consulta');
      mockCollection.countDocuments.mockResolvedValue(10);
      mockCollection.toArray.mockRejectedValue(mockError);
      
      const result = await getDashboardStats('user@example.com');
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro ao buscar estatísticas');
    });
  });
  
  describe('recordActivity', () => {
    it('deve retornar erro se o email do usuário não for fornecido', async () => {
      const result = await recordActivity({
        userEmail: '',
        action: 'test_action'
      });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Email do usuário é obrigatório');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve retornar erro se a ação não for fornecida', async () => {
      const result = await recordActivity({
        userEmail: 'user@example.com',
        action: ''
      });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error).toBe('Ação é obrigatória');
      expect(mockClient.connect).not.toHaveBeenCalled();
    });
    
    it('deve registrar uma nova atividade com sucesso', async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'new-activity-id' });
      
      const activityData = {
        userEmail: 'user@example.com',
        action: 'test_action',
        target: 'test_target',
        details: { key: 'value' }
      };
      
      const result = await recordActivity(activityData);
      
      expect(mockDb.collection).toHaveBeenCalledWith('activities');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        userEmail: 'user@example.com',
        action: 'test_action',
        target: 'test_target',
        details: { key: 'value' },
        createdAt: expect.any(Date)
      }));
      
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Atividade registrada com sucesso');
    });
    
    it('deve normalizar o email para minúsculas ao registrar atividade', async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'new-activity-id' });
      
      const activityData = {
        userEmail: 'USER@Example.com',
        action: 'test_action'
      };
      
      await recordActivity(activityData);
      
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        userEmail: 'user@example.com',
        action: 'test_action'
      }));
    });
    
    it('deve registrar atividade sem target ou details quando não fornecidos', async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'new-activity-id' });
      
      const activityData = {
        userEmail: 'user@example.com',
        action: 'login'
      };
      
      await recordActivity(activityData);
      
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        userEmail: 'user@example.com',
        action: 'login',
        createdAt: expect.any(Date)
      }));
    });
    
    it('deve definir a data de criação corretamente', async () => {
      jest.useFakeTimers();
      const mockDate = new Date('2025-01-01T12:00:00Z');
      jest.setSystemTime(mockDate);
      
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'new-activity-id' });
      
      await recordActivity({
        userEmail: 'user@example.com',
        action: 'test_action'
      });
      
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        createdAt: mockDate
      }));
      
      jest.useRealTimers();
    });
    
    it('deve lidar com erros durante o registro da atividade', async () => {
      const mockError = new Error('Erro de conexão');
      mockCollection.insertOne.mockRejectedValue(mockError);
      
      const result = await recordActivity({
        userEmail: 'user@example.com',
        action: 'test_action'
      });
      
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Erro ao registrar atividade');
    });
  });
});

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { GET } from '../route';
import { getDashboardStats } from '../stats-service';
import { logger } from '@/utils/logger';

// Mock Request class since it's not available in Node.js test environment
class MockRequest {
  private _body: any;
  readonly method: string;
  readonly url: string;

  constructor(url: string, options: { method: string; body: any }) {
    this.url = url;
    this.method = options.method;
    this._body = options.body;
  }

  async json() {
    if (typeof this._body === 'string') {
      try {
        return JSON.parse(this._body);
      } catch (e) {
        throw new Error('Invalid JSON');
      }
    }
    return this._body;
  }
}

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

// Mock stats-service
jest.mock('../stats-service', () => ({
  getDashboardStats: jest.fn()
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, options) => {
      return {
        body,
        options,
        headers: new Map()
      };
    })
  }
}));

describe('Stats API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar 401 se o usuário não estiver autenticado', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      await GET();
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
      expect(getDashboardStats).not.toHaveBeenCalled();
    });
    
    it('deve retornar as estatísticas do dashboard para o usuário autenticado', async () => {
      const mockSession = {
        user: { email: 'user@example.com' }
      };
      
      const mockStats = {
        success: true,
        statusCode: 200,
        stats: {
          totalUsers: 42,
          activities: [
            {
              _id: 'activity1',
              userEmail: 'user@example.com',
              action: 'login',
              createdAt: new Date()
            }
          ]
        }
      };
      
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (getDashboardStats as jest.Mock).mockResolvedValue(mockStats);
      
      await GET();
      
      expect(getDashboardStats).toHaveBeenCalledWith('user@example.com');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: true, stats: mockStats.stats, message: undefined },
        { status: 200 }
      );
    });
    
    it('deve lidar com erros do serviço de estatísticas', async () => {
      const mockSession = {
        user: { email: 'user@example.com' }
      };
      
      const mockError = {
        success: false,
        statusCode: 500,
        error: 'Erro ao buscar estatísticas'
      };
      
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (getDashboardStats as jest.Mock).mockResolvedValue(mockError);
      
      await GET();
      
      expect(getDashboardStats).toHaveBeenCalledWith('user@example.com');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, stats: undefined, message: 'Erro ao buscar estatísticas' },
        { status: 500 }
      );
    });
    
    it('deve lidar com exceções não tratadas', async () => {
      const mockSession = {
        user: { email: 'user@example.com' }
      };
      
      const mockError = new Error('Erro inesperado');
      
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (getDashboardStats as jest.Mock).mockRejectedValue(mockError);
      
      await GET();
      
      expect(logger.error).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, message: 'Erro no servidor' },
        { status: 500 }
      );
    });
  });
});

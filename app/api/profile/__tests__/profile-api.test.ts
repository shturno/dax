// Mock next/server before importing
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((body, options = {}) => ({
        status: options.status || 200,
        json: async () => body,
      })),
    },
  };
});

// Import after mocking
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { MongoClient } from 'mongodb';

// Create a custom MockRequest class to simulate the Web API Request in Node.js
class MockRequest {
  url: string;
  method: string;
  headers: Map<string, string>;
  private body: any;

  constructor(url: string, options: any = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this.body = options.body || '{}';
  }

  async json() {
    return JSON.parse(this.body);
  }
}

// Mock the dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('mongodb', () => {
  const mockCollection = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };
  
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };
  
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn().mockResolvedValue(undefined),
  };
  
  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
  };
});

// Mock console methods to prevent noise in test output
global.console.log = jest.fn();
global.console.error = jest.fn();

// Create simplified versions of the API handlers for testing
async function getProfileHandler() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  let client = null;
  try {
    client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
    const db = client.db("saas-dashboard");
    
    const normalizedEmail = session.user.email.toLowerCase();
    
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    // Remover senha e outras informações sensíveis
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

async function updateProfileHandler(data: any) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  let client = null;
  try {
    client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
    const db = client.db("saas-dashboard");
    
    const normalizedEmail = session.user.email.toLowerCase();
    
    // Não permitir alteração do email
    const { email, ...updateData } = data;
    
    const result = await db.collection("users").updateOne(
      { email: normalizedEmail },
      { $set: { 
        username: updateData.username,
        settings: updateData.settings,
        updatedAt: new Date() 
      } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Perfil atualizado com sucesso"
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

describe('Profile API Route', () => {
  let mockMongoClient: jest.Mocked<MongoClient>;
  let mockCollection: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get references to the mocked MongoDB client and collection
    mockMongoClient = new MongoClient('') as jest.Mocked<MongoClient>;
    mockCollection = mockMongoClient.db().collection('users');
  });
  
  describe('GET method', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (not authenticated)
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);
      
      const response = await getProfileHandler();
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        message: 'Não autorizado'
      });
    });
    
    it('should return 401 if session has no user email', async () => {
      // Mock the session to return a session without user email
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { name: 'Test User' }
      });
      
      const response = await getProfileHandler();
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        message: 'Não autorizado'
      });
    });
    
    it('should return 404 if user is not found', async () => {
      // Mock the session to return a valid user
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'test@example.com' }
      });
      
      // Mock the MongoDB findOne to return null (user not found)
      mockCollection.findOne.mockResolvedValueOnce(null);
      
      const response = await getProfileHandler();
      
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        success: false,
        message: 'Usuário não encontrado'
      });
      
      // Verify that MongoDB was called with the correct parameters
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        email: 'test@example.com'
      });
    });
    
    it('should return user data if user is found', async () => {
      // Mock the session to return a valid user
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'test@example.com' }
      });
      
      // Mock the MongoDB findOne to return a user
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        settings: { theme: 'dark' }
      };
      
      mockCollection.findOne.mockResolvedValueOnce(mockUser);
      
      const response = await getProfileHandler();
      
      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toEqual({
        success: true,
        user: {
          _id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          settings: { theme: 'dark' }
        }
      });
      
      // Verify that password was removed from the response
      expect(responseData.user.password).toBeUndefined();
      
      // Verify that MongoDB was called with the correct parameters
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        email: 'test@example.com'
      });
    });
    
    it('should handle server errors', async () => {
      // Mock the session to return a valid user
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'test@example.com' }
      });
      
      // Mock the MongoDB findOne to throw an error
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database error'));
      
      const response = await getProfileHandler();
      
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        success: false,
        message: 'Erro no servidor'
      });
      
      // Verify that error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('PUT method', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock the session to return null (not authenticated)
      (getServerSession as jest.Mock).mockResolvedValueOnce(null);
      
      const updateData = { username: 'newusername' };
      const response = await updateProfileHandler(updateData);
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        message: 'Não autorizado'
      });
    });
    
    it('should return 401 if session has no user email', async () => {
      // Mock the session to return a session without user email
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { name: 'Test User' }
      });
      
      const updateData = { username: 'newusername' };
      const response = await updateProfileHandler(updateData);
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        message: 'Não autorizado'
      });
    });
    
    it('should return 404 if user is not found for update', async () => {
      // Mock the session to return a valid user
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'test@example.com' }
      });
      
      // Mock the MongoDB updateOne to return no matches
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 0 });
      
      const updateData = { username: 'newusername' };
      const response = await updateProfileHandler(updateData);
      
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        success: false,
        message: 'Usuário não encontrado'
      });
      
      // Verify that MongoDB was called with the correct parameters
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        { $set: expect.objectContaining({
          username: 'newusername',
          updatedAt: expect.any(Date)
        })}
      );
    });
    
    it('should update user profile successfully', async () => {
      // Mock the session to return a valid user
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'test@example.com' }
      });
      
      // Mock the MongoDB updateOne to return a successful update
      mockCollection.updateOne.mockResolvedValueOnce({ 
        matchedCount: 1,
        modifiedCount: 1
      });
      
      const updateData = { 
        username: 'newusername',
        email: 'newemail@example.com', // This should be ignored
        settings: { theme: 'light' }
      };
      
      const response = await updateProfileHandler(updateData);
      
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        message: 'Perfil atualizado com sucesso'
      });
      
      // Verify that MongoDB was called with the correct parameters
      // and that email was not included in the update
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        { $set: {
          username: 'newusername',
          settings: { theme: 'light' },
          updatedAt: expect.any(Date)
        }}
      );
    });
    
    it('should handle server errors during update', async () => {
      // Mock the session to return a valid user
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'test@example.com' }
      });
      
      // Mock the MongoDB updateOne to throw an error
      mockCollection.updateOne.mockRejectedValueOnce(new Error('Database error'));
      
      const updateData = { username: 'newusername' };
      const response = await updateProfileHandler(updateData);
      
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        success: false,
        message: 'Erro ao atualizar perfil'
      });
      
      // Verify that error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
});

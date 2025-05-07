import { getUserProfile, updateUserProfile, User, ProfileUpdateData } from '../profile-service';
import { MongoClient } from 'mongodb';

// Mock MongoDB
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

describe('Profile Service', () => {
  let mockMongoClient: jest.Mocked<MongoClient>;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get references to the mocked MongoDB client and collection
    mockMongoClient = new MongoClient('') as jest.Mocked<MongoClient>;
    mockCollection = mockMongoClient.db().collection('users');
  });

  describe('getUserProfile', () => {
    it('should return 400 if email is not provided', async () => {
      const result = await getUserProfile('');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Email é obrigatório');
    });

    it('should normalize email to lowercase', async () => {
      // Mock the MongoDB findOne to return null
      mockCollection.findOne.mockResolvedValueOnce(null);

      await getUserProfile('TEST@EXAMPLE.COM');

      // Verify that MongoDB was called with the normalized email
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return 404 if user is not found', async () => {
      // Mock the MongoDB findOne to return null (user not found)
      mockCollection.findOne.mockResolvedValueOnce(null);

      const result = await getUserProfile('test@example.com');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Usuário não encontrado');

      // Verify that MongoDB was called with the correct parameters
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return user data if user is found', async () => {
      // Mock the MongoDB findOne to return a user
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        settings: { theme: 'dark' },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      mockCollection.findOne.mockResolvedValueOnce({
        ...mockUser,
        _id: {
          toString: () => 'user-id',
        },
      });

      const result = await getUserProfile('test@example.com');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.user).toEqual({
        _id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        settings: { theme: 'dark' },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Verify that password was removed from the response
      expect(result.user?.password).toBeUndefined();

      // Verify that MongoDB was called with the correct parameters
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should handle user without optional fields', async () => {
      // Mock the MongoDB findOne to return a minimal user
      const mockUser = {
        _id: 'user-id',
        email: 'minimal@example.com',
      };

      mockCollection.findOne.mockResolvedValueOnce({
        ...mockUser,
        _id: {
          toString: () => 'user-id',
        },
      });

      const result = await getUserProfile('minimal@example.com');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.user).toEqual({
        _id: 'user-id',
        email: 'minimal@example.com',
        username: undefined,
        settings: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it('should handle server errors', async () => {
      // Mock the MongoDB findOne to throw an error
      mockCollection.findOne.mockRejectedValueOnce(new Error('Database error'));

      const result = await getUserProfile('test@example.com');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Erro no servidor');

      // Verify that error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    it('should return 400 if email is not provided', async () => {
      const updateData: ProfileUpdateData = { username: 'newusername' };
      const result = await updateUserProfile('', updateData);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Email é obrigatório');
    });

    it('should normalize email to lowercase', async () => {
      // Mock the MongoDB updateOne to return a successful update
      mockCollection.updateOne.mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      });

      const updateData: ProfileUpdateData = { username: 'newusername' };
      await updateUserProfile('TEST@EXAMPLE.COM', updateData);

      // Verify that MongoDB was called with the normalized email
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        expect.any(Object)
      );
    });

    it('should return 404 if user is not found for update', async () => {
      // Mock the MongoDB updateOne to return no matches
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 0 });

      const updateData: ProfileUpdateData = { username: 'newusername' };
      const result = await updateUserProfile('test@example.com', updateData);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Usuário não encontrado');

      // Verify that MongoDB was called with the correct parameters
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        {
          $set: expect.objectContaining({
            username: 'newusername',
            updatedAt: expect.any(Date),
          }),
        }
      );
    });

    it('should update user profile successfully', async () => {
      // Mock the MongoDB updateOne to return a successful update
      mockCollection.updateOne.mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      });

      const updateData: ProfileUpdateData = {
        username: 'newusername',
        email: 'newemail@example.com', // This should be ignored
        settings: { theme: 'light' },
      };

      const result = await updateUserProfile('test@example.com', updateData);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Perfil atualizado com sucesso');

      // Verify that MongoDB was called with the correct parameters
      // and that email was not included in the update
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        {
          $set: {
            username: 'newusername',
            settings: { theme: 'light' },
            updatedAt: expect.any(Date),
          },
        }
      );
    });

    it('should update only the username when settings are not provided', async () => {
      // Mock the MongoDB updateOne to return a successful update
      mockCollection.updateOne.mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      });

      const updateData: ProfileUpdateData = { username: 'onlyusername' };

      const result = await updateUserProfile('test@example.com', updateData);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);

      // Verify that MongoDB was called with the correct parameters
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        {
          $set: {
            username: 'onlyusername',
            settings: undefined,
            updatedAt: expect.any(Date),
          },
        }
      );
    });

    it('should update only the settings when username is not provided', async () => {
      // Mock the MongoDB updateOne to return a successful update
      mockCollection.updateOne.mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      });

      const updateData: ProfileUpdateData = {
        settings: { notifications: { email: true } },
      };

      const result = await updateUserProfile('test@example.com', updateData);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);

      // Verify that MongoDB was called with the correct parameters
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        {
          $set: {
            username: undefined,
            settings: { notifications: { email: true } },
            updatedAt: expect.any(Date),
          },
        }
      );
    });

    it('should set the correct updatedAt timestamp', async () => {
      jest.useFakeTimers();
      const mockDate = new Date('2025-01-01T12:00:00Z');
      jest.setSystemTime(mockDate);

      // Mock the MongoDB updateOne to return a successful update
      mockCollection.updateOne.mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      });

      const updateData: ProfileUpdateData = { username: 'newusername' };
      await updateUserProfile('test@example.com', updateData);

      // Verify that MongoDB was called with the correct timestamp
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        {
          $set: expect.objectContaining({
            updatedAt: mockDate,
          }),
        }
      );

      jest.useRealTimers();
    });

    it('should handle server errors during update', async () => {
      // Mock the MongoDB updateOne to throw an error
      mockCollection.updateOne.mockRejectedValueOnce(new Error('Database error'));

      const updateData: ProfileUpdateData = { username: 'newusername' };
      const result = await updateUserProfile('test@example.com', updateData);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Erro ao atualizar perfil');

      // Verify that error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
});

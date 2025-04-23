import { connectToDatabase } from '../mongodb';
import { MongoClient } from 'mongodb';

jest.mock('mongodb', () => {
  const mClient = {
    connect: jest.fn().mockResolvedValue(true),
    db: jest.fn().mockReturnValue({}),
    close: jest.fn(),
  };
  return { MongoClient: jest.fn(() => mClient) };
});

describe('connectToDatabase', () => {
  it('should connect and return db and client', async () => {
    const { db, client } = await connectToDatabase();
    expect(db).toBeDefined();
    expect(client).toBeDefined();
  });

  it('should throw error if connection fails', async () => {
    (MongoClient as any).mockImplementationOnce(() => ({
      connect: jest.fn().mockRejectedValue(new Error('fail')),
    }));
    await expect(connectToDatabase()).rejects.toThrow('fail');
  });
});

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { MongoClient, ObjectId } from 'mongodb';
import { getDb } from '@/config/mongodb';

const uri = process.env.MONGODB_URI!;

export async function verifyOwnership(projectId: string, userId: string) {
  const db = await getDb();
  const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
  return project && project.ownerId.toString() === userId;
}

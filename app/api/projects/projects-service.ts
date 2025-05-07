import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/app/config/mongodb';

export async function createProject(userId: string, projectData: any) {
  const { db } = await connectToDatabase();

  const newProject = {
    ...projectData,
    ownerId: new ObjectId(userId), // Ensure ownerId is linked to the authenticated user
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('projects').insertOne(newProject);

  if (!result.acknowledged) {
    return {
      success: false,
      project: null,
      error: 'Failed to create project',
      statusCode: 500,
    };
  }

  // Validate that the project is linked to the correct user
  const createdProject = await db.collection('projects').findOne({ _id: result.insertedId });
  if (!createdProject || createdProject.ownerId.toString() !== userId) {
    return {
      success: false,
      project: null,
      error: 'Project not linked to user',
      statusCode: 500,
    };
  }

  return {
    success: true,
    project: { id: result.insertedId.toString(), ...newProject },
    error: null,
    statusCode: 201,
  };
}

export async function updateProject(userId: string, projectData: any) {
  // Simulate project update logic
  return {
    success: true,
    project: { id: projectData.id, ...projectData },
    error: null,
    statusCode: 200,
  };
}

export async function getCurrentProject(userId: string) {
  // Simulate fetching the current project for a user
  return {
    id: 'current-project-id',
    name: 'Current Project',
    ownerId: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI!

export async function verifyOwnership(projectId: string, userId: string) {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db("saas-dashboard")
  const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) })
  await client.close()
  return project && project.ownerId.toString() === userId
}
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI!

async function getDb() {
  const client = new MongoClient(uri)
  await client.connect()
  return client.db("saas-dashboard")
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const db = await getDb()
  const projects = await db.collection("projects").find({ userId: session.user.id }).toArray()
  return NextResponse.json({ projects })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const db = await getDb()
  const body = await req.json()
  const project = {
    userId: session.user.id,
    name: body.name || "Novo Projeto",
    description: body.description || "",
    tasks: body.tasks || ["Tarefa"],
    notes: body.notes || ["Nota"],
    roadmap: body.roadmap || [],
    features: body.features || [],
    ideas: body.ideas || ["Ideia"],
    feedback: body.feedback || [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const result = await db.collection("projects").insertOne(project)
  return NextResponse.json({ project: { ...project, _id: result.insertedId } })
}
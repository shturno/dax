const { MongoClient, ObjectId } = require("mongodb")
const uri = process.env.MONGODB_URI
const userId = process.argv[2]
async function main() {
  if (!userId) return
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db("saas-dashboard")
  const templates = await db.collection("templates").find().toArray()
  const projects = templates.map(t => ({
    ...t,
    ownerId: new ObjectId(userId),
    createdAt: new Date(),
    updatedAt: new Date()
  }))
  await db.collection("projects").insertMany(projects)
  await client.close()
}
main()
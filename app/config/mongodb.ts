import { MongoClient, MongoClientOptions } from "mongodb"
import { logger } from "@/utils/logger"

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI não está definida nas variáveis de ambiente')
}

const uri = process.env.MONGODB_URI
let client: MongoClient | null = null

const options: MongoClientOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  maxIdleTimeMS: 60000,
  waitQueueTimeoutMS: 10000
}

export async function connectToDatabase() {
  try {
    if (!client) {
      logger.info("Iniciando conexão com MongoDB")
      client = new MongoClient(uri, options)
      await client.connect()
      logger.info("Conexão com MongoDB estabelecida")
    }
    
    return {
      client,
      db: client.db("saas-dashboard")
    }
  } catch (error) {
    logger.error("Erro ao conectar com MongoDB", { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    throw error
  }
} 
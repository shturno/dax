import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

let cachedConn: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = {
  conn: null,
  promise: null
};

async function dbConnect() {
  if (cachedConn.conn) {
    console.log("♻️ Usando conexão MongoDB existente");
    return cachedConn.conn;
  }

  if (!cachedConn.promise) {
    console.log("🔄 Criando nova conexão MongoDB...");
    
    cachedConn.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  
  try {
    cachedConn.conn = await cachedConn.promise;
    console.log("✅ Conectado ao MongoDB com sucesso");
    return cachedConn.conn;
  } catch (e) {
    cachedConn.promise = null;
    console.error("Erro na conexão:", e);
    throw e;
  }
}

export default dbConnect;
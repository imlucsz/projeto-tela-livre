// lib/mongodb-client.ts
// Necessário para o MongoDBAdapter do NextAuth
// Usa o MongoDB driver nativo (não Mongoose)
import { MongoClient } from "mongodb"

const uri = process.env.MONGO_URI!

if (!uri) {
  throw new Error("Por favor, defina MONGO_URI no .env.local")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise
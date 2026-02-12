import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");
    
    // Intenta listar las colecciones para ver si hay conexión
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      message: "¡Conexión exitosa! 🚀", 
      database: db.databaseName,
      collections: collections.length 
    });
  } catch (e) {
    return NextResponse.json({ 
      error: "Error de conexión", 
      details: e instanceof Error ? e.message : "Desconocido" 
    }, { status: 500 });
  }
}
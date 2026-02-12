import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ITask } from '@/models/Task';

// 1. OBTENER TAREAS (GET)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");

    // Traemos todas las tareas de la colección "tasks"
    const tasks = await db.collection("tasks").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(tasks);
  } catch (e) {
    return NextResponse.json({ error: "Error al obtener tareas" }, { status: 500 });
  }
}

// 2. CREAR TAREA (POST)
export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");
    
    const body = await request.json();
    
    // Extraemos el _id para que MongoDB genere uno nuevo automáticamente
    const { _id, ...taskData } = body;

    const newTask = {
      ...taskData,
      createdAt: new Date(),
    };

    // Usamos "as any" en insertOne para evitar el conflicto de tipos de TS
    const result = await db.collection("tasks").insertOne(newTask as any);

    return NextResponse.json({ ...newTask, _id: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error("Error en POST:", e);
    return NextResponse.json({ error: "Error al crear la tarea" }, { status: 500 });
  }
}
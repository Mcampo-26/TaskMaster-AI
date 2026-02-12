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

    // Extraemos los datos del cuerpo
    const body: ITask = await request.json();

    // Eliminamos el _id si viene en el body para que MongoDB no se confunda
    // y forzamos el tipado a "any" solo para la inserción
    const { _id, ...taskData } = body;

    const newTask = {
      ...taskData,
      createdAt: new Date(),
    };

    const result = await db.collection("tasks").insertOne(newTask as any);

    return NextResponse.json({
      ...newTask,
      _id: result.insertedId
    }, { status: 201 });

  } catch (e) {
    return NextResponse.json({ error: "Error al crear la tarea" }, { status: 500 });
  }

}
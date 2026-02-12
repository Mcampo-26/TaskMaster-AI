import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // 1. Conectamos a la DB y traemos las tareas
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");
    const tasks = await db.collection("tasks").find({}).toArray();

    // 2. Creamos un resumen de las tareas para la "IA"
    const tareasListadas = tasks.map(t => `- ${t.title} (${t.priority})`).join('\n');

    // 3. Simulamos la respuesta lógica usando el contexto de las tareas
    // Más adelante, aquí enviaremos 'tareasListadas' a OpenAI/Gemini
    let aiResponse = "";

    if (message.toLowerCase().includes("tareas")) {
      aiResponse = `Actualmente tienes ${tasks.length} tareas en tu lista:\n${tareasListadas}`;
    } else {
      aiResponse = `Entiendo. Sobre tus ${tasks.length} tareas actuales, ¿hay alguna en particular que quieras revisar o priorizar?`;
    }

    return NextResponse.json({ text: aiResponse });
  } catch (error) {
    console.error("Error en el chat:", error);
    return NextResponse.json({ error: "Error al consultar tareas" }, { status: 500 });
  }
}
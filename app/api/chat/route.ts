import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Conexión a MongoDB y obtención de tareas
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");
    const tasks = await db.collection("tasks").find({}).toArray();

    // 2. Crear el contexto para la IA
    const listaTareas = tasks.map(t => `- ${t.title} (Prioridad: ${t.priority || 'N/A'})`).join("\n");
    
    const promptCompleto = `
      Eres un asistente de productividad personal. 
      Esta es la lista actual de tareas del usuario:
      ${listaTareas}

      El usuario dice: ${message}
    `;

    // 3. Petición a Gemini 2.5 Flash
    //const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptCompleto }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Error de IA", detail: data.error?.message }, { status: response.status });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ text: aiResponse });

  } catch (error: any) {
    console.error("ERROR EN API/CHAT:", error);
    return NextResponse.json({ error: "Error interno", detail: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("---- API CHAT START ----");

    const { message } = await request.json();
    console.log("Mensaje:", message);

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API KEY definida?:", !!apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no definida" },
        { status: 500 }
      );
    }

    // 1️⃣ Mongo
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");
    const tasks = await db.collection("tasks").find({}).toArray();
    console.log("Tareas:", tasks.length);

    // 2️⃣ Prompt
    const listaTareas = tasks
      .map(t => `- ${t.title} (Prioridad: ${t.priority || 'N/A'})`)
      .join("\n");

    const promptCompleto = `
Eres un asistente de productividad personal.
Esta es la lista actual de tareas del usuario:
${listaTareas}

El usuario dice: ${message}
`;

    // 3️⃣ Llamada a Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptCompleto }]
          }]
        })
      }
    );

    const data = await response.json();

    console.log("Status Gemini:", response.status);
    console.dir(data, { depth: null });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error IA", detail: data },
        { status: response.status }
      );
    }

    // 🔥 EXTRACCIÓN SEGURA DEL TEXTO (Gemini 2.5)
    const parts = data?.candidates?.[0]?.content?.parts || [];

    const aiResponse = parts
      .map((p: any) => p.text || "")
      .join("")
      .trim();

    if (!aiResponse) {
      console.error("Gemini no devolvió texto:", data);
      return NextResponse.json(
        { error: "Gemini no devolvió texto", detail: data },
        { status: 500 }
      );
    }

    console.log("Texto Gemini:", aiResponse);
    console.log("---- API CHAT END OK ----");

    return NextResponse.json({ text: aiResponse });

  } catch (error: any) {
    console.error("ERROR EN API/CHAT:", error);
    return NextResponse.json(
      { error: "Error interno", detail: error.message },
      { status: 500 }
    );
  }
}

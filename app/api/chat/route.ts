import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const client = await clientPromise;
    const db = client.db("TaskMasterAI");
    const tasks = await db.collection("tasks").find({}).toArray();

    // Incluimos el ID para que la IA sepa exactamente qué borrar o mover
    const listaTareas = tasks
      .map((t) => `- ${t.title} | ID: ${t._id.toString()} | Estado: ${t.status}`)
      .join("\n");

    const promptCompleto = `
Actúa como un sistema de gestión de tareas.
Tareas actuales:
${listaTareas}

Usuario dice: "${message}"

Debes responder ÚNICAMENTE un objeto JSON con este formato:
{
  "text": "Mensaje amable para el usuario",
  "action": "CREATE_TASK" | "UPDATE_STATUS" | "DELETE_TASK" | "EDIT_TASK" | "NONE",
  "payload": {
    "id": "ID_DE_LA_TAREA_CORRESPONDIENTE",
    "status": "completed",
    "title": "nombre si es nueva"
  }
}
Si el usuario dice "listo" o "terminado", la acción es UPDATE_STATUS y status es "completed".
Si pide borrar, la acción es DELETE_TASK.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: promptCompleto }] }],
          // Forzamos a que la respuesta sea JSON puro
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Error IA", detail: data }, { status: response.status });

    const aiRawResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Devolvemos el JSON que generó la IA
    return NextResponse.json(JSON.parse(aiRawResponse));

  } catch (error: any) {
    return NextResponse.json({ error: "Error interno", detail: error.message }, { status: 500 });
  }
}
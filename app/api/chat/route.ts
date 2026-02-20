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

    const listaTareas = tasks
      .map((t) => `- ${t.title} | ID: ${t._id.toString()} | Estado: ${t.status}`)
      .join("\n");

    const promptCompleto = `
Actúa como un sistema de gestión de tareas.
Fecha de hoy: ${new Date().toISOString().split('T')[0]}
Tareas actuales:
${listaTareas}

Usuario dice: "${message}"

Debes responder ÚNICAMENTE un objeto JSON con este formato:
{
  "text": "Mensaje amable para el usuario",
  "action": "CREATE_TASK" | "UPDATE_STATUS" | "DELETE_TASK" | "EDIT_TASK" | "NONE",
  "payload": {
    "id": "ID_DE_LA_TAREA_CORRESPONDIENTE",
    "status": "pending",
    "title": "nombre de la tarea",
    "priority": "high" | "medium" | "low",
    "dueDate": "YYYY-MM-DD"
  }
}
Si el usuario dice "listo" o "terminado", la acción es UPDATE_STATUS y status es "completed".
Si pide borrar, la acción es DELETE_TASK.
Para nuevas tareas, intenta extraer la prioridad (high/medium/low) y la fecha (YYYY-MM-DD). Si no hay fecha, usa null.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: promptCompleto }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Error IA", detail: data }, { status: response.status });

    const aiRawResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    return NextResponse.json(JSON.parse(aiRawResponse));

  } catch (error: any) {
    return NextResponse.json({ error: "Error interno", detail: error.message }, { status: 500 });
  }
}
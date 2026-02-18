import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Mensaje vacío" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no definida" },
        { status: 500 }
      );
    }

    // Mongo
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");
    const tasks = await db.collection("tasks").find({}).toArray();

    const listaTareas = tasks
      .map((t) => `- ${t.title} (Prioridad: ${t.priority || "N/A"})`)
      .join("\n");

    const promptCompleto = `
Eres un asistente de productividad personal.
Esta es la lista actual de tareas del usuario:
${listaTareas}

El usuario dice: ${message}
`;

    // Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptCompleto }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error IA", detail: data },
        { status: response.status }
      );
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];

    const aiResponse = parts
      .map((p: any) => p.text || "")
      .join("")
      .trim();

    if (!aiResponse) {
      return NextResponse.json(
        { error: "Gemini no devolvió texto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: aiResponse });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Error interno", detail: error.message },
      { status: 500 }
    );
  }
}

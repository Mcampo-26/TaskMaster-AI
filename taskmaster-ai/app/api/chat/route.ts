import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Aquí es donde luego conectaremos con OpenAI/Gemini
    // Por ahora, simulamos una respuesta inteligente
    const aiResponse = `Recibí tu mensaje: "${message}". Pronto podré ayudarte a organizar tus tareas con inteligencia real. 🚀`;

    return NextResponse.json({ text: aiResponse });
  } catch (error) {
    return NextResponse.json({ error: "Error en el cerebro de IA" }, { status: 500 });
  }
}
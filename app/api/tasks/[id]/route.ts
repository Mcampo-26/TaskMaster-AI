import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ error: "Cuerpo de petición vacío" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    
    // 1. AGREGAMOS imageUrl AQUÍ
    const { status, priority, title, description, links, category, aiSummary, dueDate, imageUrl } = body;

    const client = await clientPromise;
    const db = client.db("TaskMasterAI");

    const updateData: any = { updatedAt: new Date() };
    
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (links !== undefined) updateData.links = links;
    if (category !== undefined) updateData.category = category;
    if (aiSummary !== undefined) updateData.aiSummary = aiSummary;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    
    // 2. AGREGAMOS LA CONDICIÓN PARA GUARDAR LA IMAGEN
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const result = await db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error detallado en PATCH:", error);
    return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 });
  }
}

// --- DELETE se mantiene igual ---
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");

    const result = await db.collection("tasks").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "No se encontró la tarea" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Tarea eliminada con éxito",
      success: true 
    });
  } catch (error: any) {
    console.error("Error en DELETE [id]:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
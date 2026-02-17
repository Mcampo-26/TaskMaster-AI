import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function PATCH(request: Request) {
  try {
    const rawBody = await request.text();
    if (!rawBody) return NextResponse.json({ error: "Cuerpo vacío" }, { status: 400 });

    const { filter, update } = JSON.parse(rawBody);
    const client = await clientPromise;
    const db = client.db("TaskMasterAI");

    // filter es {} para afectar a todas las tareas
    const result = await db.collection("tasks").updateMany(
      filter || {}, 
      { $set: { ...update, updatedAt: new Date() } }
    );

    return NextResponse.json({ 
      success: true, 
      modifiedCount: result.modifiedCount,
      message: `Se actualizaron ${result.modifiedCount} tareas.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
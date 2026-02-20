// lib/aiActions.ts

// 1. CREAR: Mantenemos tu lógica de extraer del payload
export const aiCreateTask = async (payload: any) => {
  // Extraemos datos, manejando si payload es un string o un objeto
  const title = typeof payload === 'string' ? payload : payload?.title;
  const dueDate = payload?.dueDate || null;
  const priority = payload?.priority || 'medium';
  const description = payload?.description || "";

  // Validación de título
  if (!title || typeof title !== 'string') {
    console.error("AI_ERROR: Título inválido", payload);
    return false;
  }

  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      title: title.trim(), 
      status: 'pending', 
      priority,
      dueDate,
      description
    }),
  });
  
  return res.ok;
};

// 2. ACTUALIZAR (Sin cambios, tal cual la pasaste)
export const aiUpdateTask = async (id: string, updates: any) => {
  if (!id || id === "ID_DE_LA_TAREA_CORRESPONDIENTE") return false; // Evita usar el placeholder de la IA
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.ok;
};

// 3. ELIMINAR (Sin cambios)
export const aiDeleteTask = async (id: string) => {
  if (!id || id === "ID_DE_LA_TAREA_CORRESPONDIENTE") return false;
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
};

// 4. ACTUALIZACIÓN MASIVA (Tal cual la pasaste)
export const aiUpdateBulkTasks = async (tasks: any[], updates: any) => {
  if (!tasks || tasks.length === 0) return false;
  const promises = tasks.map(task => 
    fetch(`/api/tasks/${task._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
  );
  const results = await Promise.all(promises);
  return results.every(res => res.ok);
};
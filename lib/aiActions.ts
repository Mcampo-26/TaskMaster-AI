// 1. CREAR (Ahora acepta un objeto con más datos)
export const aiCreateTask = async (data: { title: string; dueDate?: string; priority?: string; description?: string }) => {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      title: data.title, 
      status: 'pending', 
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      description: data.description || ""
    }),
  });
  return res.ok;
};

// 2. ACTUALIZAR (Mover o Editar) - Se queda igual, ya es flexible
export const aiUpdateTask = async (id: string, updates: any) => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.ok;
};

// 3. ELIMINAR
export const aiDeleteTask = async (id: string) => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
};

// 4. ACTUALIZACIÓN MASIVA
export const aiUpdateBulkTasks = async (tasks: any[], updates: any) => {
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
export interface ITask {
    _id?: string; // El ? significa que es opcional (MongoDB lo genera solo)
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt?: Date;
    userId: string; // Referencia al usuario dueño de la tarea
    
    // --- Campos para la IA ---
    embedding?: number[]; // Para búsqueda semántica futura
    aiSummary?: string;   // Resumen generado por la IA
  }
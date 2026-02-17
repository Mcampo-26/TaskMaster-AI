export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  category?: string;
  
  // --- Campos nuevos para el Menú ---
  links?: string[];        
  attachments?: string[];  
  dueDate?: string | Date; // <--- AGREGAMOS ESTO PARA EL CALENDARIO

  // --- Campos para la IA ---
  embedding?: number[];
  aiSummary?: string;
}
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
  dueDate?: string | Date; 
  
  // --- CAMPO PARA LA PORTADA (NUEVO) ---
  imageUrl?: string; // <--- AGREGAMOS ESTO PARA RENDERIZAR LA IMAGEN

  // --- Campos para la IA ---
  embedding?: number[];
  aiSummary?: string;
}
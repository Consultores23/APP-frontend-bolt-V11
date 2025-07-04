// src/components/audiencias/ComentariosAudienciaSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ComentarioAudiencia } from '../../types/comentarioAudiencia';
import { Responsable } from '../../types/responsable';
import Button from '../ui/Button';
import { Send, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ComentariosAudienciaSectionProps {
  audienciaId: string;
  responsables: Responsable[];
}

const ComentariosAudienciaSection: React.FC<ComentariosAudienciaSectionProps> = ({ audienciaId, responsables }) => {
  const [comments, setComments] = useState<ComentarioAudiencia[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedResponsableId, setSelectedResponsableId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comentariosaudiencias')
        .select('*')
        .eq('audiencia_id', audienciaId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      console.error('Error fetching comments:', err.message);
      toast.error('Error al cargar los comentarios.');
    } finally {
      setIsLoading(false);
    }
  }, [audienciaId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleNewCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCommentText(e.target.value);
  };

  const handleResponsableSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedResponsableId(e.target.value);
  };

  const handleSubmitComment = async () => {
    if (!newCommentText.trim()) {
      toast.error('El comentario no puede estar vacío.');
      return;
    }
    if (!selectedResponsableId) {
      toast.error('Debes seleccionar un responsable para el comentario.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comentariosaudiencias')
        .insert({
          audiencia_id: audienciaId,
          responsable_id: selectedResponsableId,
          comentario_texto: newCommentText,
        })
        .select()
        .single();

      if (error) throw error;

      setComments((prev) => [data, ...prev]);
      setNewCommentText('');
      toast.success('Comentario añadido correctamente.');
    } catch (err: any) {
      console.error('Error adding comment:', err.message);
      toast.error('Error al añadir el comentario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponsableName = (id: string) => {
    const responsable = responsables.find((r) => r.id === id);
    return responsable ? `${responsable.nombre} ${responsable.apellido || ''}`.trim() : 'Desconocido';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Existing Comments Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Cargando comentarios...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No hay comentarios para esta audiencia.</div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <User size={14} className="mr-2" />
                  <span className="font-medium text-white">{getResponsableName(comment.responsable_id)}</span>
                  <span className="ml-auto">{formatDateTime(comment.fecha_creacion)}</span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{comment.comentario_texto}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Comment Section */}
      <div className="bg-dark-700 rounded-lg p-4 border border-dark-600 mt-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white mb-3">Añadir Nuevo Comentario</h3>
        <div className="mb-3">
          <label htmlFor="responsable-select" className="block text-sm font-medium text-gray-200 mb-1.5">
            Responsable del comentario *
          </label>
          <select
            id="responsable-select"
            value={selectedResponsableId}
            onChange={handleResponsableSelectChange}
            className="w-full rounded-md py-2.5 bg-dark-800 border border-dark-500 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
          >
            <option value="">Seleccionar responsable</option>
            {responsables.map((resp) => (
              <option key={resp.id} value={resp.id}>
                {resp.nombre} {resp.apellido}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="new-comment" className="block text-sm font-medium text-gray-200 mb-1.5">
            Comentario
          </label>
          <textarea
            id="new-comment"
            value={newCommentText}
            onChange={handleNewCommentChange}
            rows={3}
            className="w-full rounded-md py-2.5 px-4 bg-dark-800 border border-dark-500 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            placeholder="Escribe tu comentario aquí..."
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSubmitComment} isLoading={isSubmitting}>
            <Send size={18} className="mr-2" /> Enviar Comentario
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComentariosAudienciaSection;
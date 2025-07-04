// src/components/actividades/ActivityFilesSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Download, Eye, File, Loader } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Editor from '../Editor';

const CLOUD_STORAGE_API_URL = import.meta.env.VITE_CLOUD_STORAGE_API_URL;

interface CloudStorageFile {
  name: string;
  size: number;
  updated: string;
  content_type: string;
  isDir?: boolean;
}

interface ProcessedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  modDate: Date;
  contentType: string;
}

interface ActivityFilesSectionProps {
  activityId: string;
  processId: string;
}

const ActivityFilesSection: React.FC<ActivityFilesSectionProps> = ({
  activityId,
  processId,
}) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bucketName, setBucketName] = useState<string>('');
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<string[]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<any>(null);

  // Fetch bucket name from process
  const fetchBucketName = useCallback(async () => {
    if (!processId) return;

    try {
      const { data, error } = await supabase
        .from('procesos')
        .select('bucket_path')
        .eq('id', processId)
        .single();

      if (error) throw error;
      if (data?.bucket_path) {
        setBucketName(data.bucket_path);
      }
    } catch (err: any) {
      console.error('Error fetching bucket name:', err.message);
      toast.error('Error al cargar la información del bucket.');
    }
  }, [processId]);

  // Fetch activity's attached files
  const fetchActivityFiles = useCallback(async () => {
    if (!activityId) return;

    try {
      const { data, error } = await supabase
        .from('actividades')
        .select('archivos_adjuntos')
        .eq('id', activityId)
        .single();

      if (error) throw error;
      setArchivosAdjuntos(data?.archivos_adjuntos || []);
    } catch (err: any) {
      console.error('Error fetching activity files:', err.message);
      toast.error('Error al cargar los archivos de la actividad.');
    }
  }, [activityId]);

  // Fetch file details from cloud storage
  const fetchFileDetails = useCallback(async () => {
    if (!bucketName || archivosAdjuntos.length === 0) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const filePromises = archivosAdjuntos.map(async (filePath) => {
        try {
          const response = await fetch(
            `${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files`
          );
          if (!response.ok) throw new Error('Error fetching files');

          const data = await response.json();
          const cloudFiles: CloudStorageFile[] = data.files || [];

          // Find the specific file
          const fileInfo = cloudFiles.find(file => file.name === filePath);
          
          if (fileInfo) {
            return {
              id: fileInfo.name,
              name: fileInfo.name.split('/').pop() || fileInfo.name,
              path: fileInfo.name,
              size: fileInfo.size,
              modDate: new Date(fileInfo.updated),
              contentType: fileInfo.content_type,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching details for file ${filePath}:`, error);
          return null;
        }
      });

      const fileDetails = await Promise.all(filePromises);
      const validFiles = fileDetails.filter(file => file !== null) as ProcessedFile[];
      setFiles(validFiles);
    } catch (err: any) {
      console.error('Error fetching file details:', err.message);
      toast.error('Error al cargar los detalles de los archivos.');
    } finally {
      setIsLoading(false);
    }
  }, [bucketName, archivosAdjuntos]);

  // Initial data fetch
  useEffect(() => {
    fetchBucketName();
    fetchActivityFiles();
  }, [fetchBucketName, fetchActivityFiles]);

  // Fetch file details when bucket and files are available
  useEffect(() => {
    fetchFileDetails();
  }, [fetchFileDetails]);

  const handleDownloadFile = async (file: ProcessedFile) => {
    try {
      const response = await fetch(
        `${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files/${file.id}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'No response body' }));
        console.error('Error getting download URL:', response.status, errorData);
        throw new Error(`Error getting download URL: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Descargando ${file.name}`);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      toast.error('Error al descargar el archivo.');
    }
  };

  const handlePreviewFile = (file: ProcessedFile) => {
    // Create a file object compatible with the Editor component
    const fileForPreview = {
      id: file.id,
      name: file.name,
      size: file.size,
      modDate: file.modDate,
      isDir: false,
    };
    
    setSelectedFileForPreview(fileForPreview);
    setIsPreviewModalOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader size={20} className="animate-spin" />
          <span>Cargando archivos...</span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <File size={48} className="mx-auto mb-4 opacity-50" />
        <p>No hay archivos adjuntos en esta actividad.</p>
        <p className="text-sm mt-2">Los archivos aparecerán aquí cuando se adjunten a la actividad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-dark-600 pb-3">
        <h3 className="text-lg font-medium text-white">
          Archivos Adjuntos ({files.length})
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Archivos relacionados con esta actividad
        </p>
      </div>

      {/* Files list with scroll */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center p-4 bg-dark-700 border border-dark-600 rounded-lg hover:border-secondary-500 transition-colors"
          >
            {/* File icon */}
            <div className="flex-shrink-0 mr-4">
              <File size={24} className="text-gray-400" />
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate" title={file.name}>
                {file.name}
              </p>
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <span>{formatFileSize(file.size)}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(file.modDate)}</span>
              </div>
              {file.path !== file.name && (
                <p className="text-xs text-gray-500 truncate mt-1" title={file.path}>
                  Ruta: {file.path}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreviewFile(file)}
                title="Vista previa"
              >
                <Eye size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadFile(file)}
                title="Descargar archivo"
              >
                <Download size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Vista Previa: ${selectedFileForPreview?.name || 'Archivo'}`}
      >
        <div className="h-96">
          <Editor
            selectedFile={selectedFileForPreview}
            bucketName={bucketName}
            cloudStorageApiUrl={CLOUD_STORAGE_API_URL}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ActivityFilesSection;
// src/components/audiencias/AudienciaFilesSelection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { File, Check } from 'lucide-react';

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
  isDir: boolean;
  modDate: Date;
}

interface AudienciaFilesSelectionProps {
  processId: string;
  onSelectionChange: (selectedFilePaths: string[]) => void;
  initialSelectedFiles?: string[];
}

const AudienciaFilesSelection: React.FC<AudienciaFilesSelectionProps> = ({
  processId,
  onSelectionChange,
  initialSelectedFiles = [],
}) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set(initialSelectedFiles));
  const [isLoading, setIsLoading] = useState(true);
  const [bucketName, setBucketName] = useState<string>('');

  // Fetch bucket name from process
  useEffect(() => {
    const fetchBucketName = async () => {
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
        } else {
          toast.error('No se pudo cargar el bucket para este proceso.');
        }
      } catch (err: any) {
        console.error('Error fetching bucket name:', err.message);
        toast.error('Error al cargar la información del bucket.');
      }
    };

    fetchBucketName();
  }, [processId]);

  const fetchAllFiles = useCallback(async () => {
    if (!bucketName) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files`
      );
      if (!response.ok) throw new Error('Error fetching files');

      const data = await response.json();
      const cloudFiles: CloudStorageFile[] = data.files || [];

      // Process all files into a flat list
      const processedFiles: ProcessedFile[] = cloudFiles
        .filter(file => file.name !== '' && !file.name.endsWith('/'))
        .map(file => ({
          id: file.name, // Use full path as ID
          name: file.name.split('/').pop() || file.name, // Get just the filename
          path: file.name, // Keep full path for reference
          size: file.size,
          isDir: file.isDir || false,
          modDate: new Date(file.updated),
        }))
        .filter(file => !file.isDir) // Only include actual files, not directories
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

      setFiles(processedFiles);
    } catch (err: any) {
      console.error('Error fetching files:', err.message);
      toast.error('Error al cargar los archivos.');
    } finally {
      setIsLoading(false);
    }
  }, [bucketName]);

  useEffect(() => {
    if (bucketName) {
      fetchAllFiles();
    }
  }, [bucketName, fetchAllFiles]);

  // Update selection when files change or initial selection changes
  useEffect(() => {
    setSelectedFileIds(new Set(initialSelectedFiles));
  }, [initialSelectedFiles]);

  // Notify parent component when selection changes
  useEffect(() => {
    onSelectionChange(Array.from(selectedFileIds));
  }, [selectedFileIds, onSelectionChange]);

  const handleFileToggle = (fileId: string) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFileIds.size === files.length) {
      // Deselect all
      setSelectedFileIds(new Set());
    } else {
      // Select all
      setSelectedFileIds(new Set(files.map(file => file.id)));
    }
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
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  if (!bucketName) {
    return (
      <div className="text-center text-gray-400 py-8">
        No se pudo cargar el bucket de archivos para este proceso.
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <File size={48} className="mx-auto mb-4 opacity-50" />
        <p>No hay archivos disponibles en este proceso.</p>
        <p className="text-sm mt-2">Los archivos aparecerán aquí una vez que se suban al proceso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with select all option */}
      <div className="flex items-center justify-between border-b border-dark-600 pb-3">
        <h3 className="text-lg font-medium text-white">
          Seleccionar Archivos ({files.length} disponibles)
        </h3>
        <button
          onClick={handleSelectAll}
          className="text-sm text-secondary-400 hover:text-secondary-300 transition-colors"
        >
          {selectedFileIds.size === files.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
        </button>
      </div>

      {/* Selected files count */}
      {selectedFileIds.size > 0 && (
        <div className="bg-secondary-500/10 border border-secondary-500/20 rounded-lg p-3">
          <p className="text-secondary-400 text-sm">
            <Check size={16} className="inline mr-2" />
            {selectedFileIds.size} archivo{selectedFileIds.size !== 1 ? 's' : ''} seleccionado{selectedFileIds.size !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Files list */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
        {files.map((file) => {
          const isSelected = selectedFileIds.has(file.id);

          return (
            <div
              key={file.id}
              className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer hover:bg-dark-700 ${
                isSelected
                  ? 'border-secondary-500 bg-secondary-500/10'
                  : 'border-dark-600 bg-dark-800'
              }`}
              onClick={() => handleFileToggle(file.id)}
            >
              {/* Checkbox */}
              <div className="flex-shrink-0 mr-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-secondary-500 bg-secondary-500'
                      : 'border-gray-400 bg-transparent'
                  }`}
                >
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
              </div>

              {/* File icon */}
              <div className="flex-shrink-0 mr-3">
                <File size={20} className="text-gray-400" />
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
                    {file.path}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="text-xs text-gray-500 pt-3 border-t border-dark-600">
        <p>Los archivos seleccionados se adjuntarán a esta audiencia y podrán ser consultados posteriormente.</p>
      </div>
    </div>
  );
};

export default AudienciaFilesSelection;
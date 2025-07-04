import React, { useEffect, useState } from 'react';
import { FileData } from 'chonky';
import { toast } from 'react-hot-toast';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';

interface EditorProps {
  selectedFile: FileData | null;
  bucketName: string;
  cloudStorageApiUrl: string;
}

const Editor: React.FC<EditorProps> = ({ selectedFile, bucketName, cloudStorageApiUrl }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Supported file types for react-doc-viewer
  const supportedTypes = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff',
    'mp4', 'txt', 'csv', 'html', 'htm', 'odt'
  ];

  useEffect(() => {
    const getFilePreview = async () => {
      setPreviewUrl(null);
      setFileType(null);
      setIsLoading(false);

      if (!selectedFile || !bucketName || !cloudStorageApiUrl) {
        return;
      }

      const fileName = selectedFile.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (!fileExtension) {
        setFileType('unknown');
        return;
      }

      // Check if file type is supported by react-doc-viewer
      if (supportedTypes.includes(fileExtension)) {
        setFileType('doc-viewer-supported');
        setIsLoading(true);

        try {
          // Use selectedFile.id which contains the full path for the API call
          const response = await fetch(
            `${cloudStorageApiUrl}/buckets/${bucketName}/files/${selectedFile.id}`
          );
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No response body' }));
            console.error('Error getting download URL for preview:', response.status, errorData);
            throw new Error(`Error getting download URL for preview: ${errorData.message || response.statusText}`);
          }
          
          const data = await response.json();
          setPreviewUrl(data.download_url);
        } catch (err) {
          console.error('Error fetching preview URL:', err);
          toast.error('Error al cargar la vista previa del archivo.');
          setPreviewUrl(null);
          setFileType('error');
        } finally {
          setIsLoading(false);
        }
      } else {
        setFileType('unsupported');
      }
    };

    getFilePreview();
  }, [selectedFile, bucketName, cloudStorageApiUrl]);

  const renderPreview = () => {
    if (!selectedFile) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-center">
            Selecciona un archivo para ver su vista previa.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary-500 mx-auto mb-2"></div>
            <p className="text-gray-400">Cargando vista previa...</p>
          </div>
        </div>
      );
    }

    if (fileType === 'doc-viewer-supported' && previewUrl) {
      const documents = [
        {
          uri: previewUrl,
          fileName: selectedFile.name,
        }
      ];

      return (
        <div className="h-full w-full">
          <DocViewer
            documents={documents}
            pluginRenderers={DocViewerRenderers}
            config={{
              header: {
                disableHeader: true, // Disable the default header to maintain our custom UI
              },
            }}
            style={{
              height: '100%',
              width: '100%',
            }}
            theme={{
              primary: '#2ba6ff',
              secondary: '#1a1a1a',
              tertiary: '#2ba6ff99',
              textPrimary: '#ffffff',
              textSecondary: '#2ba6ff',
              textTertiary: '#00000099', // Changed to a darker shade for better contrast on light backgrounds
              disableThemeScrollbar: false,
            }}
          />
        </div>
      );
    }

    if (fileType === 'error') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-400">
            <p className="mb-2">Error al cargar la vista previa.</p>
            <p className="text-sm">Intenta descargar el archivo para verlo.</p>
          </div>
        </div>
      );
    }

    if (fileType === 'unsupported') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <p className="mb-2">Tipo de archivo no soportado para vista previa.</p>
            <p className="text-sm">Tipos soportados: PDF, Word, Excel, PowerPoint, imágenes, videos MP4, etc.</p>
            <p className="text-sm mt-2">Puedes descargar el archivo para verlo.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No se puede mostrar la vista previa para este archivo.</p>
      </div>
    );
  };

  return (
    <div className="h-full bg-dark-700 rounded-xl border border-dark-600 p-4 flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">
        Vista Previa: {selectedFile?.name || 'Ninguno'}
      </h2>
      <div className="flex-1"> {/* Removed overflow-auto here */}
        {renderPreview()}
      </div>
    </div>
  );
};

export default Editor;

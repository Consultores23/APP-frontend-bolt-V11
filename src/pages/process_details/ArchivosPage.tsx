// src/pages/process_details/ArchivosPage.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileBrowser, 
  FileArray, 
  FileData, 
  FileHelper, 
  ChonkyActions,
  defineFileAction,
  ChonkyIconName
} from 'chonky';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Editor from '../../components/Editor'; // Import the new Editor component

const CLOUD_STORAGE_API_URL = import.meta.env.VITE_CLOUD_STORAGE_API_URL;

interface CloudStorageFile {
  name: string;
  size: number;
  updated: string;
  content_type: string;
  isDir?: boolean;
}

// Define custom file actions
const MyFileActions = {
  CreateFolder: defineFileAction({
    id: 'create_folder',
    button: {
      name: 'Nueva Carpeta',
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.folderCreate,
      iconOnly: true 
    }
  }),
  
  DeleteFiles: defineFileAction({
    id: 'delete_files',
    button: {
      name: 'Eliminar',
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.trash,
      iconOnly: true 
    },
    requiresSelection: true
  }),

  UploadFiles: defineFileAction({
    id: 'upload_files',
    button: {
      name: 'Subir Archivos',
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.upload,
      iconOnly: true 
    }
  }),

  DownloadFiles: defineFileAction({
    id: 'download_files',
    button: {
      name: 'Descargar',
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.download,
      iconOnly: true 
    }
  })
};

const ArchivosPage: React.FC = () => {
  const { id: processId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileArray>([]);
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [bucketName, setBucketName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileData | null>(null); // New state for preview

  // State for resizing
  const [fileBrowserWidth, setFileBrowserWidth] = useState(0); 
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);

  // Set initial width on mount
  useEffect(() => {
    if (fileBrowserWidth === 0) { 
      setFileBrowserWidth(window.innerWidth * 0.6); 
    }
  }, [fileBrowserWidth]);

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
        }
      } catch (err) {
        console.error('Error fetching bucket name:', err);
        toast.error('Error al cargar la información del bucket');
      }
    };

    fetchBucketName();
  }, [processId]);

  const buildFolderChain = useCallback(() => {
    const chain: FileData[] = [{ id: '/', name: 'Raíz', isDir: true }];
    
    if (currentFolderPath) {
      const parts = currentFolderPath.split('/').filter(Boolean);
      let currentPath = '';
      
      parts.forEach(part => {
        currentPath += `${part}/`;
        chain.push({
          id: currentPath,
          name: part,
          isDir: true
        });
      });
    }
    
    return chain;
  }, [currentFolderPath]);

  const fetchFiles = useCallback(async () => {
    if (!bucketName) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files?prefix=${currentFolderPath}`);
      if (!response.ok) throw new Error('Error fetching files');
      
      const data = await response.json();
      const files: CloudStorageFile[] = data.files || [];

      // Process files to identify directories
      const processedFiles = new Map<string, FileData>();
      const currentPrefix = currentFolderPath;
      const prefixLength = currentPrefix.length;

      files.forEach(file => {
        const relativePath = file.name.slice(prefixLength);
        const parts = relativePath.split('/');

        if (parts.length > 1 && parts[parts.length - 1] !== '') {
          // This is a file in a subdirectory
          const dirPath = parts[0];
          if (!processedFiles.has(dirPath)) {
            processedFiles.set(dirPath, {
              id: `${currentPrefix}${dirPath}/`,
              name: dirPath,
              isDir: true,
              modDate: new Date(file.updated),
            });
          }
        } else if (parts[0] !== '') {
          // This is a file in the current directory
          processedFiles.set(file.name, {
            id: file.name,
            name: parts[0],
            size: file.size,
            modDate: new Date(file.updated),
            isDir: file.isDir || false,
          });
        }
      });

      const fileArray: FileData[] = Array.from(processedFiles.values());

      // Add parent folder if not in root
      if (currentFolderPath) {
        fileArray.unshift({
          id: '..',
          name: '..',
          isDir: true,
        });
      }

      setFiles(fileArray);
    } catch (err) {
      console.error('Error fetching files:', err);
      toast.error('Error al cargar los archivos');
    } finally {
      setIsLoading(false);
    }
  }, [bucketName, currentFolderPath]);

  useEffect(() => {
    if (bucketName) {
      fetchFiles();
    }
  }, [bucketName, fetchFiles]);

const handleCreateFolder = async (folderName: string) => {
  if (!folderName.trim()) return;
  
  try {
    const formData = new FormData();
    
    // Crear un archivo placeholder vacío
    const placeholderFile = new Blob([''], { type: 'text/plain' });
    formData.append('file', placeholderFile, '.keep');
    
    // Agregar el prefijo del objeto (ruta de la carpeta)
    const folderPath = `${currentFolderPath}${folderName}/`;
    formData.append('object_prefix', folderPath);

    const response = await fetch(
      `${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) throw new Error('Error creating folder');
    
    toast.success('Carpeta creada correctamente');
    fetchFiles();
  } catch (err) {
    console.error('Error creating folder:', err);
    toast.error('Error al crear la carpeta');
  }
};


  const handleFileUpload = async (files: FileList) => {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('object_prefix', currentFolderPath);

        const response = await fetch(
          `${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) throw new Error(`Error uploading file ${file.name}`);
      }

      toast.success('Archivos subidos correctamente');
      fetchFiles();
    } catch (err) {
      console.error('Error uploading files:', err);
      toast.error('Error al subir los archivos');
    }
  };

  const handleDownloadFile = async (file: FileData) => {
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
      window.open(data.download_url, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Error al descargar el archivo');
    }
  };

  const handleDeleteFiles = async (filesToDelete: FileData[]) => {
    try {
        for (const file of filesToDelete) {
            let objectNameToDelete = file.id; 

            if (file.isDir) {
                objectNameToDelete = `${file.id}.keep`; 
            }

            const response = await fetch(
                `${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files/${objectNameToDelete}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
                if (file.isDir) {
                    toast.error(`No se pudo eliminar la carpeta "${file.name}". Asegúrate de que esté vacía.`);
                } else {
                    throw new Error(errorData.error || `Error deleting ${file.name}`);
                }
            } else {
                toast.success(`"${file.name}" eliminado correctamente.`);
            }
        }

        fetchFiles();
    } catch (err: any) {
        console.error('Error deleting files:', err);
        toast.error(`Error al eliminar elementos: ${err.message || err}`);
    }
};

  const handleFileAction = async (data: any) => {
    if (data.id === ChonkyActions.OpenFiles.id) {
      const { targetFile } = data.payload;
      
      if (targetFile && FileHelper.isDirectory(targetFile)) {
        if (targetFile.id === '..') {
          const newPath = currentFolderPath.split('/').slice(0, -2).join('/') + '/';
          setCurrentFolderPath(newPath);
        } else if (targetFile.id === '/') { 
            setCurrentFolderPath(''); 
        } else {
          setCurrentFolderPath(targetFile.id);
        }
        setSelectedFileForPreview(null); // Clear preview when navigating folders
      } else if (targetFile && !FileHelper.isDirectory(targetFile)) {
        // Set file for preview when a non-directory file is opened
        setSelectedFileForPreview(targetFile);
        // Removed automatic download on preview selection
      }
    }
    else if (data.id === MyFileActions.CreateFolder.id) {
      const folderName = prompt('Ingrese el nombre de la carpeta:');
      if (folderName) {
        await handleCreateFolder(folderName);
      }
    }
    else if (data.id === MyFileActions.UploadFiles.id) {
      fileInputRef.current?.click();
    }
    else if (data.id === MyFileActions.DeleteFiles.id) {
      const filesToProcess = data.state.selectedFilesForAction; 
      if (filesToProcess.length && window.confirm('¿Está seguro de que desea eliminar los elementos seleccionados?')) {
        await handleDeleteFiles(filesToProcess);
      }
    }
    else if (data.id === MyFileActions.DownloadFiles.id) {
      const filesToProcess = data.state.selectedFilesForAction; 
      for (const file of filesToProcess) {
        if (!file.isDir) {
          await handleDownloadFile(file);
        }
      }
    }
  };

  const fileActions = [
    ChonkyActions.EnableGridView,
    ChonkyActions.EnableListView,
    ChonkyActions.SelectAllFiles,
    ChonkyActions.ClearSelection,
    MyFileActions.CreateFolder,
    MyFileActions.UploadFiles,
    MyFileActions.DeleteFiles,
    MyFileActions.DownloadFiles,
  ];

  // Resizing logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startX.current = e.clientX;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const dx = e.clientX - startX.current;
    setFileBrowserWidth(prevWidth => {
      const newWidth = prevWidth + dx;
      const minPaneWidth = 300; 
      const maxPaneWidth = window.innerWidth - 300; 
      return Math.max(minPaneWidth, Math.min(maxPaneWidth, newWidth));
    });
    startX.current = e.clientX;
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);


  return (
    <div className="flex flex-col h-screen bg-dark-900"> 
      <header className="bg-dark-800 border-b border-dark-700 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Archivos del Proceso</h1>
        <Button onClick={() => navigate(`/procesos/${processId}/detalle`)} variant="outline">
          <ArrowLeft size={16} className="mr-2" /> Volver al Detalle
        </Button>
      </header>

      <main className="flex-1 p-8"> 
        <div className="h-full flex"> 
          <div
            className="flex-shrink-0"
            style={{ width: fileBrowserWidth + 'px' }} 
          >
            <div className="h-full bg-dark-700 rounded-xl border border-dark-600"> 
              <FileBrowser
                files={files}
                folderChain={buildFolderChain()}
                fileActions={fileActions}
                onFileAction={handleFileAction}
                darkMode
              />
            </div>
          </div>
          <div
            className="w-2 cursor-ew-resize bg-dark-600 hover:bg-secondary-500 transition-colors"
            onMouseDown={handleMouseDown}
          ></div>
          <div className="flex-1 ml-2"> 
            <Editor 
              selectedFile={selectedFileForPreview} 
              bucketName={bucketName} 
              cloudStorageApiUrl={CLOUD_STORAGE_API_URL} 
            />
          </div>
        </div>
      </main>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
      />
    </div>
  );
};

export default ArchivosPage;
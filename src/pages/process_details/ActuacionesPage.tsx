import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Actuacion } from '../../types/actuacion';
import { Process } from '../../types/process';
import { toast } from 'react-hot-toast';
import { Plus, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ActuacionTable from '../../components/actuaciones/ActuacionTable';
import ActuacionForm from '../../components/actuaciones/ActuacionForm';
import ActuacionDetailModal from '../../components/actuaciones/ActuacionDetailModal';

interface ProcessContext {
  process: Process;
}

const ITEMS_PER_PAGE = 5;
const CLOUD_STORAGE_API_URL = import.meta.env.VITE_CLOUD_STORAGE_API_URL;

const ActuacionesPage: React.FC = () => {
  const { process } = useOutletContext<ProcessContext>();
  const [actuaciones, setActuaciones] = useState<Actuacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActuaciones, setTotalActuaciones] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingActuacion, setEditingActuacion] = useState<Actuacion | null>(null);
  const [selectedActuacion, setSelectedActuacion] = useState<Actuacion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchActuaciones = useCallback(async (page: number) => {
    if (!process?.id) return;
    setIsLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      const { data, error, count } = await supabase
        .from('actuaciones')
        .select('*', { count: 'exact' })
        .eq('process_id', process.id)
        .order('fecha_actuacion', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setActuaciones(data || []);
      setTotalActuaciones(count || 0);
    } catch (err: any) {
      toast.error('Error al cargar las actuaciones.');
    } finally {
      setIsLoading(false);
    }
  }, [process?.id]);

  useEffect(() => {
    fetchActuaciones(currentPage);
  }, [currentPage, fetchActuaciones]);

  const totalPages = Math.ceil(totalActuaciones / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleCreateActuacion = () => {
    setEditingActuacion(null);
    setIsCreateModalOpen(true);
  };
  const handleEditActuacion = (actuacion: Actuacion) => {
    setEditingActuacion(actuacion);
    setIsEditModalOpen(true);
  };
  const handleDeleteActuacion = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actuación?')) {
      try {
        const { error } = await supabase.from('actuaciones').delete().eq('id', id);
        if (error) throw error;
        toast.success('Actuación eliminada correctamente.');
        fetchActuaciones(currentPage);
      } catch (err: any) {
        toast.error('Error al eliminar la actuación.');
      }
    }
  };
  const handleViewDetails = (actuacion: Actuacion) => {
    setSelectedActuacion(actuacion);
    setIsDetailModalOpen(true);
  };
  
  const uploadFilesToStorage = async (files: FileList, bucketName: string): Promise<string[]> => {
    const uploadedPaths: string[] = [];
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('object_prefix', 'Actuaciones/');
        const response = await fetch(`${CLOUD_STORAGE_API_URL}/buckets/${bucketName}/files`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`Error uploading file ${file.name}`);
        const result = await response.json();
        uploadedPaths.push(result.file_details.name);
      } catch (error) {
        toast.error(`Error al subir el archivo ${file.name}`);
      }
    }
    return uploadedPaths;
  };

  const handleFormSubmit = async (formData: Omit<Actuacion, 'id'>, files: FileList | null) => {
    setIsSubmitting(true);
    try {
      let storagePath = formData.storage_path;
      if (files && files.length > 0 && process.bucket_path) {
        const uploadedPaths = await uploadFilesToStorage(files, process.bucket_path);
        if (uploadedPaths.length > 0) {
          storagePath = JSON.stringify(uploadedPaths);
        }
      }
      const actuacionData = { ...formData, storage_path: storagePath || null };
      if (editingActuacion) {
        const { error } = await supabase.from('actuaciones').update(actuacionData).eq('id', editingActuacion.id);
        if (error) throw error;
        toast.success('Actuación actualizada correctamente.');
        setIsEditModalOpen(false);
      } else {
        const { error } = await supabase.from('actuaciones').insert(actuacionData);
        if (error) throw error;
        toast.success('Actuación creada correctamente.');
        setIsCreateModalOpen(false);
      }
      setEditingActuacion(null);
      fetchActuaciones(currentPage);
    } catch (err: any) {
      toast.error(`Error al guardar la actuación: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  const handleCloseEditModal = () => setIsEditModalOpen(false);
  const handleCloseDetailModal = () => setIsDetailModalOpen(false);
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('spreadsheetml')) {
        toast.error('Por favor, selecciona un archivo Excel (.xlsx o .xls).');
        return;
      }
      readExcelFile(file);
    }
  };

  const readExcelFile = (file: File) => {
    setIsSubmitting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (json.length === 0) {
          toast.error('El archivo Excel está vacío.');
          return;
        }
        const headers = json[0];
        const rows = json.slice(1);
        const importedActuaciones: Omit<Actuacion, 'id'>[] = rows.map(row => {
          const actuacion: any = { process_id: process?.id || '' };
          headers.forEach((header: string, index: number) => {
            const value = row[index];
            if (value) {
              switch (header.trim()) {
                case 'Fecha de Actuación': actuacion.fecha_actuacion = new Date(value).toISOString().split('T')[0]; break;
                case 'Actuación': actuacion.actuacion_texto = String(value); break;
                case 'Anotación': actuacion.anotacion = String(value); break;
                case 'Fecha inicio Término': actuacion.fecha_inicio_termino = new Date(value).toISOString().split('T')[0]; break;
                case 'Fecha finaliza T': actuacion.fecha_finaliza_termino = new Date(value).toISOString().split('T')[0]; break;
                case 'Fecha de Registro': actuacion.fecha_registro = new Date(value).toISOString(); break;
              }
            }
          });
          return actuacion;
        }).filter(act => act.fecha_actuacion && act.actuacion_texto && act.anotacion && act.fecha_registro);
        
        if (importedActuaciones.length === 0) {
          toast.error('No se encontraron actuaciones válidas para importar.');
          return;
        }

        const { error } = await supabase.from('actuaciones').insert(importedActuaciones);
        if (error) throw error;

        toast.success(`Se importaron ${importedActuaciones.length} actuaciones correctamente.`);
        fetchActuaciones(currentPage);
      } catch (err: any) {
        toast.error(`Error al importar el archivo: ${err.message}`);
      } finally {
        setIsSubmitting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Actuaciones</h2>
          <p className="text-gray-400">Gestiona las actuaciones relacionadas con este proceso.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleImportClick} variant="outline" disabled={isSubmitting}>
            <Upload size={18} className="mr-2" /> Importar
          </Button>
          <Button onClick={handleCreateActuacion} disabled={isSubmitting}>
            <Plus size={18} className="mr-2" /> Crear Actuación
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ActuacionTable
          actuaciones={actuaciones}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleEditActuacion}
          onDelete={handleDeleteActuacion}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
        />
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls" style={{ display: 'none' }} />

      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} title="Crear Nueva Actuación">
        <ActuacionForm initialData={null} onSubmit={handleFormSubmit} onCancel={handleCloseCreateModal} isLoading={isSubmitting} processId={process?.id || ''} />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Actuación">
        <ActuacionForm initialData={editingActuacion} onSubmit={handleFormSubmit} onCancel={handleCloseEditModal} isLoading={isSubmitting} processId={process?.id || ''} />
      </Modal>

      <ActuacionDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} actuacion={selectedActuacion} />
    </div>
  );
};

export default ActuacionesPage;

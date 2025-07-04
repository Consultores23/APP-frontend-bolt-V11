export interface AuditLog {
  id: string;
  created_at: string;
  table_name: string;
  record_id: string;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  user_id: string | null;
}

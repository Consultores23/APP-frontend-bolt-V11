import { Process } from './process';
import { Client } from './client';

export type ProcessWithClient = Process & {
  clientes: Pick<Client, 'nombre'> | null;
};

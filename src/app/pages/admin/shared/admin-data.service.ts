import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { supabase } from '../../../core/supabase.client';

type Row = Record<string, unknown>;

/** Thin Supabase CRUD wrapper with toast feedback, used by all admin screens. */
@Injectable()
export class AdminDataService {
  private readonly toast = inject(MessageService);

  async list<T>(table: string, orderBy = 'sort_order'): Promise<T[]> {
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: true });
    if (error) {
      this.toast.add({ severity: 'error', summary: 'Load failed', detail: error.message });
      return [];
    }
    return (data ?? []) as T[];
  }

  async upsert(table: string, row: Row): Promise<boolean> {
    const { error } = await supabase.from(table).upsert(row);
    if (error) {
      this.toast.add({ severity: 'error', summary: 'Save failed', detail: error.message });
      return false;
    }
    this.toast.add({ severity: 'success', summary: 'Saved' });
    return true;
  }

  async update(table: string, id: string | number, patch: Row): Promise<boolean> {
    const { error } = await supabase.from(table).update(patch).eq('id', id);
    if (error) {
      this.toast.add({ severity: 'error', summary: 'Update failed', detail: error.message });
      return false;
    }
    return true;
  }

  async remove(table: string, id: string | number): Promise<boolean> {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      this.toast.add({ severity: 'error', summary: 'Delete failed', detail: error.message });
      return false;
    }
    this.toast.add({ severity: 'success', summary: 'Deleted' });
    return true;
  }
}

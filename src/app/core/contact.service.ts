import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { ContactMessage } from './models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  async send(message: ContactMessage): Promise<{ ok: boolean }> {
    const { error } = await supabase.from('contact_messages').insert({
      first_name: message.first_name,
      last_name: message.last_name || null,
      email: message.email,
      phone: message.phone || null,
      message: message.message,
    });
    return { ok: !error };
  }
}

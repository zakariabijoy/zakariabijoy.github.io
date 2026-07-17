import { Injectable, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);

  private readonly readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  /** Resolves once the persisted session (if any) has been restored. */
  ready(): Promise<void> {
    return this.readyPromise;
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }
}

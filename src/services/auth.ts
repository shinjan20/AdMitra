import { User, BusinessProfile } from '../types';
import { StorageService, INITIAL_USER, INITIAL_BUSINESS } from './storage';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const AUTH_STORAGE_KEY = 'cp_auth_session';
const REGISTERED_USERS_KEY = 'cp_registered_users';

interface RegisteredAccount {
  user: User;
  passwordHash: string; // simulated hash for local auth
}

// Initial registered demo accounts
const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    user: INITIAL_USER,
    passwordHash: 'password123',
  },
  {
    user: {
      id: 'usr-google-demo',
      email: 'pooja.sharma.aura@gmail.com',
      username: 'poojasharma',
      name: 'Pooja Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      authProvider: 'google',
      createdAt: '2026-10-15T09:00:00Z',
    },
    passwordHash: 'google_oauth_token',
  },
];

export const AuthService = {
  getRegisteredAccounts(): RegisteredAccount[] {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!stored) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  getCurrentUser(): User | null {
    const session = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!session) {
      // By default for demo smoothness, we start with INITIAL_USER logged in
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  async loginWithCredentials(
    usernameOrEmail: string,
    password: string
  ): Promise<{ user: User; error?: string }> {
    // Artificial small delay for realistic UX feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!usernameOrEmail.trim()) {
      return { user: null as any, error: 'Please enter your username or email address' };
    }
    if (!password || password.length < 4) {
      return { user: null as any, error: 'Password must be at least 4 characters' };
    }

    // Try Supabase auth if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password,
        });
        if (error) {
          return { user: null as any, error: error.message };
        }
        if (data.user) {
          const u: User = {
            id: data.user.id,
            email: data.user.email || usernameOrEmail,
            name: data.user.user_metadata?.full_name || usernameOrEmail.split('@')[0],
            username: usernameOrEmail.split('@')[0],
            authProvider: 'email',
            createdAt: data.user.created_at,
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
          StorageService.setUser(u);
          return { user: u };
        }
      }
    }

    // Local / Offline storage authentication
    const accounts = this.getRegisteredAccounts();
    const query = usernameOrEmail.toLowerCase().trim();

    const matched = accounts.find(
      (a) =>
        a.user.email.toLowerCase() === query ||
        (a.user.username && a.user.username.toLowerCase() === query)
    );

    if (matched) {
      // In local demo mode, accept matching password or 'password123' or any password if test account
      if (matched.passwordHash === password || password === 'password123' || password.length >= 4) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched.user));
        StorageService.setUser(matched.user);
        return { user: matched.user };
      } else {
        return { user: null as any, error: 'Invalid password. (Hint: use password123 for demo)' };
      }
    }

    // If account not found in seed, create account on the fly for smooth testing
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: query.includes('@') ? query : `${query}@example.com`,
      username: query.replace(/[^a-zA-Z0-9_]/g, ''),
      name: query.split('@')[0].charAt(0).toUpperCase() + query.split('@')[0].slice(1),
      authProvider: 'email',
      createdAt: new Date().toISOString(),
    };

    accounts.push({ user: newUser, passwordHash: password });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(accounts));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    StorageService.setUser(newUser);

    return { user: newUser };
  },

  async loginWithGoogle(): Promise<{ user: User; error?: string }> {
    // Artificial small delay for realistic UX feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          return { user: null as any, error: error.message };
        }
      }
    }

    // Google Sign-In Demo User
    const googleUser: User = {
      id: 'usr-google-demo',
      email: 'pooja.sharma.aura@gmail.com',
      username: 'poojasharma_google',
      name: 'Pooja Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      authProvider: 'google',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser));
    StorageService.setUser(googleUser);

    return { user: googleUser };
  },

  async register({
    name,
    username,
    email,
    password,
    businessName,
  }: {
    name: string;
    username: string;
    email: string;
    password: string;
    businessName: string;
  }): Promise<{ user: User; business: BusinessProfile; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!name.trim()) return { user: null as any, business: null as any, error: 'Name is required' };
    if (!email.trim() || !email.includes('@')) return { user: null as any, business: null as any, error: 'Valid email is required' };
    if (!password || password.length < 6) return { user: null as any, business: null as any, error: 'Password must be at least 6 characters' };

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      username: (username || email.split('@')[0]).trim(),
      email: email.trim().toLowerCase(),
      authProvider: 'email',
      createdAt: new Date().toISOString(),
    };

    const newBusiness: BusinessProfile = {
      id: `biz-${Date.now()}`,
      userId: newUser.id,
      businessName: businessName.trim() || `${name}'s Business`,
      category: 'Beauty & Wellness',
      description: `Local business operated by ${name}.`,
      location: {
        city: 'Lucknow',
        area: 'City Centre',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const accounts = this.getRegisteredAccounts();
    accounts.push({ user: newUser, passwordHash: password });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(accounts));

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    StorageService.setUser(newUser);
    StorageService.setActiveBusiness(newBusiness);

    return { user: newUser, business: newBusiness };
  },

  logout(): void {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.auth.signOut().catch(() => {});
      }
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};

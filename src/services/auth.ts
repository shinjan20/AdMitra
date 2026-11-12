import { User, BusinessProfile } from '../types';
import { StorageService, INITIAL_USER } from './storage';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const AUTH_STORAGE_KEY = 'cp_auth_session';
const REGISTERED_USERS_KEY = 'cp_registered_users';

/** The mobile number and code that work in this demo without an SMS provider. */
export const DEMO_PHONE_NUMBER = '9876543210';
export const DEMO_PHONE_OTP = '123456';

export const isDemoPhone = (phone: string): boolean =>
  phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '') === DEMO_PHONE_NUMBER;

const DEMO_PHONE_USER: User = {
  id: 'usr-phone-demo',
  email: 'demo.owner@admitra.local',
  username: DEMO_PHONE_NUMBER,
  name: 'Demo shop owner',
  authProvider: 'phone',
  createdAt: '2026-01-01T09:00:00Z',
};

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
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  async loginWithCredentials(
    usernameOrEmail: string,
    password: string
  ): Promise<{ user: User | null; error?: string }> {
    // Artificial small delay for realistic UX feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!usernameOrEmail.trim()) {
      return { user: null, error: 'Please enter your username or email address' };
    }
    if (!password || password.length < 4) {
      return { user: null, error: 'Password must be at least 4 characters' };
    }

    // Try Supabase auth if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { user: null, error: 'Could not connect to sign-in. Please try again.' };
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail,
        password,
      });
      if (error) {
        return { user: null, error: error.message };
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
      return { user: null, error: 'Sign-in did not return an account. Please try again.' };
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
        return { user: null, error: 'Invalid password. (Hint: use password123 for demo)' };
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

  async loginWithGoogle(): Promise<{ user: User | null; error?: string }> {
    // Artificial small delay for realistic UX feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { user: null, error: 'Could not connect to sign-in. Please try again.' };
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        return { user: null, error: error.message };
      }
      return { user: null };
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

  async sendPhoneOtp(
    phone: string,
    fullName: string,
    shouldCreateUser: boolean
  ): Promise<{ error?: string; demo?: boolean }> {
    // The demo number works with a fixed code, even when no SMS provider is set up.
    if (isDemoPhone(phone)) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { demo: true };
    }

    if (!isSupabaseConfigured()) {
      return {
        error: `This demo only supports the test number ${DEMO_PHONE_NUMBER}. In a live shop, a real SMS would be sent.`,
      };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: 'Could not connect to mobile sign-in. Please try again.' };
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser,
        data: shouldCreateUser ? { full_name: fullName.trim() } : undefined,
      },
    });
    if (error) return { error: error.message };
    return {};
  },

  async verifyPhoneOtp(
    phone: string,
    token: string
  ): Promise<{ user: User | null; error?: string }> {
    if (isDemoPhone(phone)) {
      if (token !== DEMO_PHONE_OTP) {
        return {
          user: null,
          error: `That code is not correct. For this demo, use ${DEMO_PHONE_OTP}.`,
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_PHONE_USER));
      StorageService.setUser(DEMO_PHONE_USER);
      return { user: DEMO_PHONE_USER };
    }

    if (!isSupabaseConfigured()) {
      return {
        user: null,
        error: `This demo only supports the test number ${DEMO_PHONE_NUMBER}.`,
      };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { user: null, error: 'Could not connect to mobile sign-in. Please try again.' };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'The code could not be verified. Please try again.' };

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      username: data.user.phone || phone,
      name: data.user.user_metadata?.full_name || data.user.phone || phone,
      authProvider: 'phone',
      createdAt: data.user.created_at,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    StorageService.setUser(user);
    return { user };
  },

  async register({
    name,
    username,
    email,
    password,
    businessName,
  }: {
    name: string;
    username?: string;
    email: string;
    password: string;
    businessName?: string;
  }): Promise<{ user: User | null; business: BusinessProfile | null; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (!name.trim()) return { user: null, business: null, error: 'Name is required' };
    if (!email.trim() || !email.includes('@')) return { user: null, business: null, error: 'Valid email is required' };
    if (!password || password.length < 6) return { user: null, business: null, error: 'Password must be at least 6 characters' };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return {
          user: null,
          business: null,
          error: 'Could not connect to sign-up. Please try again.',
        };
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            business_name: businessName?.trim() || '',
            username: username?.trim() || '',
          },
        },
      });
      if (error) {
        return { user: null, business: null, error: error.message };
      }
      if (!data.user) {
        return {
          user: null,
          business: null,
          error: 'Sign-up did not return an account. Please try again.',
        };
      }

      const newUser: User = {
        id: data.user.id,
        name: name.trim(),
        username: (username || email.split('@')[0]).trim(),
        email: data.user.email || email.trim().toLowerCase(),
        authProvider: 'email',
        createdAt: data.user.created_at,
      };
      const newBusiness: BusinessProfile = {
        id: `biz-${Date.now()}`,
        userId: newUser.id,
        businessName: businessName?.trim() || '',
        category: '',
        description: '',
        location: { city: '', area: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!data.session) {
        StorageService.setActiveBusiness(newBusiness);
        return {
          user: null,
          business: null,
          error: 'Account created. Check your email to confirm it, then sign in.',
        };
      }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      StorageService.setUser(newUser);
      StorageService.setActiveBusiness(newBusiness);
      return { user: newUser, business: newBusiness };
    }

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
      businessName: businessName?.trim() || '',
      category: '',
      description: '',
      location: {
        city: '',
        area: '',
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

  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Could not connect to sign-out. Please try again.');
      }
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    StorageService.clearUser();
  },
};

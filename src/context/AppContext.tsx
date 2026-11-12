import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  BusinessProfile,
  Campaign,
  ConnectedAccount,
  MarketingPlan,
  User,
  CampaignStatus,
  FunnelEvent,
} from '../types';
import { StorageService } from '../services/storage';
import { AuthService, isDemoPhone } from '../services/auth';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient';
import {
  APP_LANGUAGES,
  AppLanguage,
  getInitialLanguage,
  saveLanguage,
  translate,
  UiKey,
} from '../services/language';
import {
  EMPTY_CONTENT,
  loadContentDictionary,
  localizeContent,
  type ContentTranslations,
} from '../services/contentLanguage';
import { createDemoCampaigns } from '../utils/demoData';

export type NavigationPage =
  | 'landing'
  | 'dashboard'
  | 'marketing-plan'
  | 'connected-accounts'
  | 'create-campaign'
  | 'campaign-details'
  | 'creative-studio'
  | 'business-profile'
  | 'settings';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: UiKey, values?: Record<string, string | number>) => string;
  tr: (text: string, values?: Record<string, string | number>) => string;
  showShopSetup: boolean;
  completeShopSetup: (details: {
    language: AppLanguage;
    businessName: string;
    category: string;
    city: string;
    area: string;
    whatsappNumber: string;
  }) => void;
  deferShopSetup: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  setPostAuthPage: (page: NavigationPage | null) => void;
  logout: () => Promise<void>;
  activeBusiness: BusinessProfile;
  businesses: BusinessProfile[];
  campaigns: Campaign[];
  marketingPlans: MarketingPlan[];
  connectedAccounts: ConnectedAccount[];
  activeDraft: Partial<Campaign> | null;
  showProductTour: boolean;
  completeProductTour: () => void;
  activePage: NavigationPage;
  selectedCampaignId: string | null;
  toasts: ToastMessage[];
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
  setActiveBusiness: (biz: BusinessProfile) => void;
  updateBusiness: (biz: BusinessProfile) => void;
  createNewBusiness: (biz: Omit<BusinessProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => BusinessProfile;
  saveCampaign: (campaign: Campaign) => void;
  deleteCampaign: (id: string) => void;
  updateCampaignStatus: (id: string, status: CampaignStatus) => void;
  saveMarketingPlan: (plan: MarketingPlan, options?: { silent?: boolean }) => MarketingPlan;
  approveMarketingPlan: (planId: string) => MarketingPlan | null;
  updateConnectedAccount: (
    provider: ConnectedAccount['provider'],
    status: ConnectedAccount['status'],
  ) => void;
  updateActiveDraft: (updater: Partial<Campaign> | ((prev: Partial<Campaign> | null) => Partial<Campaign>)) => void;
  clearActiveDraft: () => void;
  navigateTo: (page: NavigationPage, campaignId?: string) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  logFunnel: (eventName: FunnelEvent['eventName'], campaignId?: string, metadata?: Record<string, any>) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);
  const [contentDictionary, setContentDictionary] = useState<ContentTranslations>(EMPTY_CONTENT);
  const [contentReady, setContentReady] = useState(language === 'en');
  const [user, setUserState] = useState<User | null>(() =>
    isSupabaseConfigured() ? null : StorageService.getUser()
  );
  const [showProductTour, setShowProductTour] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const postAuthPageRef = useRef<NavigationPage | null>(null);
  const [activeBusiness, setActiveBusinessState] = useState<BusinessProfile>(() => StorageService.getActiveBusiness());
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(() => StorageService.getAllBusinesses());
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => StorageService.getCampaigns());
  const [marketingPlans, setMarketingPlans] = useState<MarketingPlan[]>(() =>
    StorageService.getMarketingPlans(),
  );
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() =>
    StorageService.getConnectedAccounts(StorageService.getActiveBusiness().id),
  );
  const [activeDraft, setActiveDraftState] = useState<Partial<Campaign> | null>(() => StorageService.getActiveDraft());
  // The demo number signs in without Supabase, so it must keep its place after a reload.
  const startupUser = StorageService.getUser();
  const startupUserIsDemo = Boolean(startupUser && isDemoPhone(startupUser.username || ''));
  const [activePage, setActivePage] = useState<NavigationPage>(() => 'landing');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showShopSetup, setShowShopSetup] = useState(() => {
    const storedUser = !isSupabaseConfigured() || startupUserIsDemo ? startupUser : null;
    return Boolean(
      storedUser &&
        localStorage.getItem(`admitra:shop-setup:complete:${storedUser.id}`) !== 'true'
    );
  });

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    if (!APP_LANGUAGES.some((item) => item.code === nextLanguage)) {
      throw new Error(`Unsupported app language: ${nextLanguage}`);
    }
    setLanguageState(nextLanguage);
    saveLanguage(nextLanguage);
    if (user) localStorage.setItem(`admitra:language:${user.id}`, nextLanguage);
  }, [user]);

  const t = useCallback(
    (key: UiKey, values?: Record<string, string | number>) =>
      translate(language, key, values, contentDictionary),
    [language, contentDictionary]
  );
  const tr = useCallback(
    (text: string, values?: Record<string, string | number>) =>
      localizeContent(language, text, values, contentDictionary),
    [language, contentDictionary]
  );

  useEffect(() => {
    let cancelled = false;
    loadContentDictionary(language)
      .then((dictionary) => {
        if (cancelled) return;
        setContentDictionary(dictionary);
        setContentReady(true);
      })
      .catch(() => {
        if (!cancelled) setContentReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);
  const setPostAuthPage = useCallback((page: NavigationPage | null) => {
    postAuthPageRef.current = page;
  }, []);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    StorageService.clearLegacySettings();
  }, []);

  useEffect(() => {
    setConnectedAccounts(StorageService.getConnectedAccounts(activeBusiness.id));
  }, [activeBusiness.id]);
  // Sync draft to local storage
  useEffect(() => {
    StorageService.saveActiveDraft(activeDraft);
  }, [activeDraft]);

  // Load demo campaigns for landing page (when not authenticated and no campaigns exist)
  useEffect(() => {
    if (!isSupabaseConfigured() && campaigns.length === 0 && activePage === 'landing') {
      const demoCampaigns = createDemoCampaigns(activeBusiness.id, 'demo-user');
      setCampaigns(demoCampaigns);
      console.log('[AppContext] Loaded demo campaigns for landing page');
    }
  }, [activePage, campaigns.length, activeBusiness.id]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      StorageService.setUser(newUser);
      const savedLanguage = localStorage.getItem(`admitra:language:${newUser.id}`);
      if (APP_LANGUAGES.some((item) => item.code === savedLanguage)) {
        const accountLanguage = savedLanguage as AppLanguage;
        setLanguageState(accountLanguage);
        saveLanguage(accountLanguage);
      }
      const accountBusinesses = StorageService.getAllBusinesses().filter(
        (business) => business.userId === newUser.id
      );
      const currentBusiness = accountBusinesses.find(
        (business) => business.id === StorageService.getActiveBusiness().id
      ) || accountBusinesses[0] || {
        id: `biz-${newUser.id}`,
        userId: newUser.id,
        businessName: '',
        category: '',
        description: '',
        location: { city: '', area: '' },
        whatsappNumber: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActiveBusinessState(currentBusiness);
      setBusinesses(accountBusinesses);
      setActivePage('creative-studio');
      setSelectedCampaignId(null);
      const setupKey = `admitra:shop-setup:complete:${newUser.id}`;
      const setupComplete = localStorage.getItem(setupKey) === 'true';
      setShowShopSetup(!setupComplete);
      setShowProductTour(false);
      if (setupComplete && postAuthPageRef.current) {
        setActivePage(postAuthPageRef.current);
        postAuthPageRef.current = null;
      }
    } else {
      const previousUser = StorageService.getUser();
      if (previousUser) {
        localStorage.removeItem(`admitra:tour:pending:${previousUser.id}`);
      }
      setShowProductTour(false);
      setShowShopSetup(false);
      setActivePage('landing');
      postAuthPageRef.current = null;
      StorageService.clearUser();
    }
  }, []);

  const completeShopSetup = (details: {
    language: AppLanguage;
    businessName: string;
    category: string;
    city: string;
    area: string;
    whatsappNumber: string;
  }) => {
    if (!user) return;
    setLanguage(details.language);
    localStorage.setItem(`admitra:language:${user.id}`, details.language);
    const belongsToUser = activeBusiness.userId === user.id;
    const now = new Date().toISOString();
    const updatedBusiness: BusinessProfile = belongsToUser
      ? {
          ...activeBusiness,
          businessName: details.businessName.trim(),
          category: details.category,
          location: {
            ...activeBusiness.location,
            city: details.city.trim(),
            area: details.area.trim(),
          },
          whatsappNumber: details.whatsappNumber.trim(),
          updatedAt: now,
        }
      : {
          id: `biz-${user.id}`,
          userId: user.id,
          businessName: details.businessName.trim(),
          category: details.category,
          description: '',
          location: { city: details.city.trim(), area: details.area.trim() },
          whatsappNumber: details.whatsappNumber.trim(),
          createdAt: now,
          updatedAt: now,
        };
    setActiveBusinessState(updatedBusiness);
    StorageService.setActiveBusiness(updatedBusiness);
    setBusinesses(StorageService.getAllBusinesses());
    localStorage.setItem(`admitra:shop-setup:complete:${user.id}`, 'true');
    setShowShopSetup(false);
    setShowProductTour(false);
    setActivePage(postAuthPageRef.current || 'creative-studio');
    postAuthPageRef.current = null;
  };

  const deferShopSetup = () => {
    setShowShopSetup(false);
    // Go back to landing page instead of business profile
    setActivePage('landing');
    postAuthPageRef.current = null;
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      if (user) {
        localStorage.removeItem(`admitra:tour:pending:${user.id}`);
      }
      showToast({
        type: 'info',
        title: tr('Signed out'),
        message: tr('You have been signed out of AdMitra.'),
      });
    } catch (error) {
      console.error('Could not sign out:', error);
      showToast({
        type: 'error',
        title: tr('Could not sign out'),
        message: error instanceof Error ? error.message : tr('Please try again.'),
      });
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Supabase is configured but its client could not be initialized.');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        // The demo number is not a Supabase account. A missing Supabase
        // session must not sign the practice user out.
        const stored = StorageService.getUser();
        if (stored && isDemoPhone(stored.username || '')) return;
        setUser(null);
        return;
      }

      const supabaseUser = session.user;
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Business owner',
        authProvider: supabaseUser.phone
          ? 'phone'
          : supabaseUser.app_metadata?.provider === 'google'
            ? 'google'
            : 'email',
        createdAt: supabaseUser.created_at,
      });
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const completeProductTour = () => {
    if (user) {
      localStorage.setItem(`admitra:tour:seen:${user.id}`, 'true');
      localStorage.removeItem(`admitra:tour:pending:${user.id}`);
    }
    setShowProductTour(false);
    if (postAuthPageRef.current) {
      setActivePage(postAuthPageRef.current);
      postAuthPageRef.current = null;
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setActiveBusiness = (biz: BusinessProfile) => {
    setActiveBusinessState(biz);
    StorageService.setActiveBusiness(biz);
    setConnectedAccounts(StorageService.getConnectedAccounts(biz.id));
    showToast({
      type: 'info',
      title: tr('Shop switched'),
      message: tr('Now managing {name}', { name: biz.businessName }),
    });
  };

  const updateBusiness = (biz: BusinessProfile) => {
    const updated = { ...biz, updatedAt: new Date().toISOString() };
    setActiveBusinessState(updated);
    StorageService.setActiveBusiness(updated);
    setBusinesses(StorageService.getAllBusinesses());
    showToast({
      type: 'success',
      title: tr('Shop details saved'),
      message: tr('Your shop details have been saved.'),
    });
  };

  const createNewBusiness = (data: Omit<BusinessProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): BusinessProfile => {
    const newBiz: BusinessProfile = {
      ...data,
      id: `biz-${Date.now()}`,
      userId: user?.id || 'usr-demo-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageService.setActiveBusiness(newBiz);
    setActiveBusinessState(newBiz);
    setBusinesses(StorageService.getAllBusinesses());
    StorageService.logFunnelEvent('business_profile_created', undefined, { name: newBiz.businessName });
    showToast({
      type: 'success',
      title: tr('Shop created'),
      message: tr('{name} is ready for its first ad.', { name: newBiz.businessName }),
    });
    return newBiz;
  };

  const saveCampaign = (campaign: Campaign) => {
    const saved = StorageService.saveCampaign(campaign);
    setCampaigns(StorageService.getCampaigns());
    return saved;
  };

  const deleteCampaign = (id: string) => {
    StorageService.deleteCampaign(id);
    setCampaigns(StorageService.getCampaigns());
    showToast({
      type: 'info',
      title: tr('Ad deleted'),
      message: tr('The ad plan has been removed.'),
    });
  };

  const updateCampaignStatus = (id: string, status: CampaignStatus) => {
    const updated = StorageService.updateCampaignStatus(id, status);
    if (updated) {
      setCampaigns(StorageService.getCampaigns());
      if (status === 'paused') {
        StorageService.logFunnelEvent('campaign_paused', id);
        showToast({
          type: 'warning',
          title: tr('Ad plan paused'),
          message: tr('{name} is paused as a practice plan.', { name: updated.campaignName }),
        });
      } else if (status === 'active') {
        StorageService.logFunnelEvent('campaign_resumed', id);
        showToast({
          type: 'success',
          title: tr('Ad plan resumed'),
          message: tr('{name} is active as a practice plan again.', { name: updated.campaignName }),
        });
      } else if (status === 'completed') {
        StorageService.logFunnelEvent('campaign_completed', id);
        showToast({
          type: 'info',
          title: tr('Ad plan finished'),
          message: tr('{name} has finished its practice run.', { name: updated.campaignName }),
        });
      }
    }
  };

  const updateActiveDraft = (
    updater: Partial<Campaign> | ((prev: Partial<Campaign> | null) => Partial<Campaign>)
  ) => {
    setActiveDraftState((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return updated;
    });
  };

  const saveMarketingPlan = (plan: MarketingPlan, options?: { silent?: boolean }) => {
    const saved = StorageService.saveMarketingPlan(plan);
    setMarketingPlans(StorageService.getMarketingPlans());
    if (!options?.silent) {
      showToast({
        type: 'info',
        title: tr('Spending plan saved'),
        message: tr('This is still a draft until you approve it.'),
      });
    }
    return saved;
  };

  const approveMarketingPlan = (planId: string) => {
    const approved = StorageService.approveMarketingPlan(planId);
    if (approved) {
      setMarketingPlans(StorageService.getMarketingPlans());
      showToast({
        type: 'success',
        title: tr('Plan approved'),
        message: tr('You approved this practice plan. No money has been spent.'),
      });
    }
    return approved;
  };

  const updateConnectedAccount = (
    provider: ConnectedAccount['provider'],
    status: ConnectedAccount['status'],
  ) => {
    const updated = StorageService.setConnectedAccountStatus(activeBusiness.id, provider, status);
    setConnectedAccounts(updated);
    showToast({
      type: status === 'demo_connected' ? 'info' : 'success',
      title: status === 'demo_connected' ? tr('Practice connection saved') : tr('Account disconnected'),
      message:
        status === 'demo_connected'
          ? tr('This is a practice connection. No real account, payment or posting access is active.')
          : tr('The practice connection has been removed for this shop.'),
    });
  };

  const clearActiveDraft = () => {
    setActiveDraftState(null);
    StorageService.saveActiveDraft(null);
  };

  const navigateTo = (page: NavigationPage, campaignId?: string) => {
    setActivePage(page);
    setSelectedCampaignId(campaignId || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logFunnel = (
    eventName: FunnelEvent['eventName'],
    campaignId?: string,
    metadata?: Record<string, any>
  ) => {
    StorageService.logFunnelEvent(eventName, campaignId, metadata);
  };

  const resetAllData = () => {
    StorageService.resetAllToSeed();
    setUser(StorageService.getUser());
    setActiveBusinessState(StorageService.getActiveBusiness());
    setBusinesses(StorageService.getAllBusinesses());
    setCampaigns(StorageService.getCampaigns());
    setActiveDraftState(null);
    setMarketingPlans(StorageService.getMarketingPlans());
    setConnectedAccounts(StorageService.getConnectedAccounts(StorageService.getActiveBusiness().id));
    showToast({
      type: 'info',
      title: tr('Practice data reset'),
      message: tr('The sample shop and ad plans have been restored.'),
    });
  };

  // Hold the first paint until the selected language's content dictionary is
  // available so the UI never flashes English before localising.
  if (!contentReady) return null;

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        language,
        setLanguage,
        t,
        tr,
        showShopSetup,
        completeShopSetup,
        deferShopSetup,
        showAuthModal,
        setShowAuthModal,
        setPostAuthPage,
        logout,
        activeBusiness,
        businesses,
        campaigns,
        marketingPlans,
        connectedAccounts,
        activeDraft,
        showProductTour,
        completeProductTour,
        activePage,
        selectedCampaignId,
        toasts,
        showOnboardingModal,
        setShowOnboardingModal,
        setActiveBusiness,
        updateBusiness,
        createNewBusiness,
        saveCampaign,
        deleteCampaign,
        updateCampaignStatus,
        saveMarketingPlan,
        approveMarketingPlan,
        updateConnectedAccount,
        updateActiveDraft,
        clearActiveDraft,
        navigateTo,
        showToast,
        dismissToast,
        logFunnel,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

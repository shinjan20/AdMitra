import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessProfile,
  Campaign,
  User,
  AppSettings,
  CampaignStatus,
  FunnelEvent,
} from '../types';
import { StorageService } from '../services/storage';

export type NavigationPage =
  | 'dashboard'
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
  user: User;
  activeBusiness: BusinessProfile;
  businesses: BusinessProfile[];
  campaigns: Campaign[];
  activeDraft: Partial<Campaign> | null;
  settings: AppSettings;
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
  const [user, setUser] = useState<User>(() => StorageService.getUser());
  const [activeBusiness, setActiveBusinessState] = useState<BusinessProfile>(() => StorageService.getActiveBusiness());
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(() => StorageService.getAllBusinesses());
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => StorageService.getCampaigns());
  const [activeDraft, setActiveDraftState] = useState<Partial<Campaign> | null>(() => StorageService.getActiveDraft());
  const [settings, setSettingsState] = useState<AppSettings>(() => StorageService.getSettings());
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  // Sync draft to local storage
  useEffect(() => {
    StorageService.saveActiveDraft(activeDraft);
  }, [activeDraft]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setActiveBusiness = (biz: BusinessProfile) => {
    setActiveBusinessState(biz);
    StorageService.setActiveBusiness(biz);
    showToast({
      type: 'info',
      title: 'Business Switched',
      message: `Now managing ${biz.businessName}`,
    });
  };

  const updateBusiness = (biz: BusinessProfile) => {
    const updated = { ...biz, updatedAt: new Date().toISOString() };
    setActiveBusinessState(updated);
    StorageService.setActiveBusiness(updated);
    setBusinesses(StorageService.getAllBusinesses());
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your business details have been saved.',
    });
  };

  const createNewBusiness = (data: Omit<BusinessProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): BusinessProfile => {
    const newBiz: BusinessProfile = {
      ...data,
      id: `biz-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageService.setActiveBusiness(newBiz);
    setActiveBusinessState(newBiz);
    setBusinesses(StorageService.getAllBusinesses());
    StorageService.logFunnelEvent('business_profile_created', undefined, { name: newBiz.businessName });
    showToast({
      type: 'success',
      title: 'Business Created',
      message: `${newBiz.businessName} is ready for campaign creation.`,
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
      title: 'Campaign Deleted',
      message: 'The campaign has been removed.',
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
          title: 'Campaign Paused',
          message: `"${updated.campaignName}" delivery has been paused.`,
        });
      } else if (status === 'active') {
        StorageService.logFunnelEvent('campaign_resumed', id);
        showToast({
          type: 'success',
          title: 'Campaign Resumed',
          message: `"${updated.campaignName}" is now active again.`,
        });
      } else if (status === 'completed') {
        StorageService.logFunnelEvent('campaign_completed', id);
        showToast({
          type: 'info',
          title: 'Campaign Completed',
          message: `"${updated.campaignName}" has finished its run.`,
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

  const clearActiveDraft = () => {
    setActiveDraftState(null);
    StorageService.saveActiveDraft(null);
  };

  const navigateTo = (page: NavigationPage, campaignId?: string) => {
    setActivePage(page);
    if (campaignId) {
      setSelectedCampaignId(campaignId);
    }
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
    setSettingsState(StorageService.getSettings());
    showToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'Restored default SMB sample business and campaigns.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeBusiness,
        businesses,
        campaigns,
        activeDraft,
        settings,
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


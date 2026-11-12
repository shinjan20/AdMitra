import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/Toast';
import { OfflineStatus } from './components/common/OfflineStatus';
import { AuthModal } from './components/auth/AuthModal';
import { CreativeStudioPage } from './components/creative-studio/CreativeStudioPage';
import { BusinessProfilePage } from './components/business-profile/BusinessProfilePage';
import { ProductTour } from './components/common/ProductTour';
import { LandingPage } from './components/common/LandingPage';
import { ShopSetupPage } from './components/onboarding/ShopSetupPage';
import { CampaignWizard } from './components/campaign-wizard/CampaignWizard';
import { CampaignDashboardPage } from './components/dashboard/CampaignDashboardPage';
import { MarketingPlanPage } from './components/marketing-plan/MarketingPlanPage';
import { ConnectedAccountsPage } from './components/connected-accounts/ConnectedAccountsPage';
import { SettingsPage } from './components/settings/SettingsPage';

const MainContent: React.FC = () => {
  const {
    activePage,
    navigateTo,
    showAuthModal,
    setShowAuthModal,
    showProductTour,
    completeProductTour,
    showShopSetup,
    setPostAuthPage,
  } = useApp();

  // Debug logging
  React.useEffect(() => {
    console.log('[MainContent] showAuthModal changed:', showAuthModal);
  }, [showAuthModal]);

  const isLandingPage = activePage === 'landing';

  const handleSignIn = () => {
    console.log('[MainContent] handleSignIn called');
    setPostAuthPage(null);
    console.log('[MainContent] About to call setShowAuthModal(true)');
    setShowAuthModal(true);
    console.log('[MainContent] Called setShowAuthModal(true)');
  };

  const handleCreateCampaign = () => {
    console.log('[MainContent] handleCreateCampaign called');
    setPostAuthPage('create-campaign');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col font-sans">
      {showShopSetup ? (
        <ShopSetupPage />
      ) : isLandingPage ? (
        <LandingPage
          onSignIn={handleSignIn}
          onCreateCampaign={handleCreateCampaign}
        />
      ) : (
        <>
          <Navbar />
          <main className="w-full flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 md:pb-10">
            {activePage === 'business-profile' ? (
              <BusinessProfilePage />
            ) : activePage === 'marketing-plan' ? (
              <MarketingPlanPage />
            ) : activePage === 'connected-accounts' ? (
              <ConnectedAccountsPage />
            ) : activePage === 'settings' ? (
              <SettingsPage />
            ) : activePage === 'create-campaign' ? (
              <CampaignWizard />
            ) : activePage === 'dashboard' || activePage === 'campaign-details' ? (
              <CampaignDashboardPage />
            ) : (
              <CreativeStudioPage />
            )}
          </main>
        </>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {showProductTour && <ProductTour onComplete={completeProductTour} />}
      <ToastContainer />
      <OfflineStatus />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;

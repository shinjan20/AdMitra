import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { BusinessOnboardingModal } from './components/onboarding/BusinessOnboardingModal';
import { JTBDLauncher } from './components/dashboard/JTBDLauncher';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CampaignList } from './components/dashboard/CampaignList';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { CampaignWizard } from './components/campaign-wizard/CampaignWizard';
import { CampaignDetailModal } from './components/campaign-details/CampaignDetailModal';
import { CreativeStudioPage } from './components/creative-studio/CreativeStudioPage';
import { BusinessProfilePage } from './components/business-profile/BusinessProfilePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activePage,
    selectedCampaignId,
    navigateTo,
    activeBusiness,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {/* VIEW 1: DASHBOARD */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              {/* Major JTBD Flow: Prominent 1-Click Goal Launcher */}
              <JTBDLauncher />

              {/* Minimalist Overview Metrics */}
              <DashboardOverview />

              {/* Campaign Table & Activity Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-8">
                  <CampaignList
                    onSelectCampaign={(id) => navigateTo('dashboard', id)}
                  />
                </div>
                <div className="lg:col-span-4 space-y-4">
                  <RecentActivity />

                  {/* Plain English SMB Conversion Insight */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Tip for {activeBusiness.category} in {activeBusiness.location.city}
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Direct WhatsApp ads convert 3x faster than traditional websites because local customers prefer asking questions before visiting in person.
                    </p>
                  </div>
                </div>
              </div>

              {/* Drilldown Modal if campaign is selected */}
              {selectedCampaignId && (
                <CampaignDetailModal
                  campaignId={selectedCampaignId}
                  onClose={() => navigateTo('dashboard', undefined)}
                />
              )}
            </div>
          )}

          {/* VIEW 2: CREATE CAMPAIGN WIZARD */}
          {activePage === 'create-campaign' && <CampaignWizard />}

          {/* VIEW 3: CREATIVE STUDIO */}
          {activePage === 'creative-studio' && <CreativeStudioPage />}

          {/* VIEW 4: BUSINESS PROFILE */}
          {activePage === 'business-profile' && <BusinessProfilePage />}

          {/* VIEW 5: SETTINGS */}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      <BusinessOnboardingModal />
      <ToastContainer />
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

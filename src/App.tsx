import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { BusinessOnboardingModal } from './components/onboarding/BusinessOnboardingModal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CampaignList } from './components/dashboard/CampaignList';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { CampaignWizard } from './components/campaign-wizard/CampaignWizard';
import { CampaignDetailModal } from './components/campaign-details/CampaignDetailModal';
import { CreativeStudioPage } from './components/creative-studio/CreativeStudioPage';
import { BusinessProfilePage } from './components/business-profile/BusinessProfilePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { Sparkles, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activePage,
    selectedCampaignId,
    navigateTo,
    activeBusiness,
    campaigns,
    setShowOnboardingModal,
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* VIEW 1: DASHBOARD */}
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Hero Banner */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-blue-100 border border-white/20 backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    AI Campaign Assistant Ready
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Welcome back, {activeBusiness.businessName}
                  </h1>
                  <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                    Turn your business goals into high-converting advertisements in under 10 minutes.
                    No marketing degree or complex ad configurations required.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => navigateTo('create-campaign')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-xl shadow-md transition-all hover:scale-102"
                  >
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    Create New Campaign
                  </button>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <DashboardOverview />

              {/* Campaign Table & Activity Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8">
                  <CampaignList
                    onSelectCampaign={(id) => navigateTo('dashboard', id)}
                  />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <RecentActivity />

                  {/* Indian SMB Tip Card */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      SMB Ad Success Tip
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      For Indian local services, ads pointing directly to WhatsApp have a 3.4x higher response
                      rate than standard website landing pages because customers like getting instant quote replies.
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


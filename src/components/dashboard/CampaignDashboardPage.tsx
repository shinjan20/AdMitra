import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CampaignList } from './CampaignList';
import { DashboardOverview } from './DashboardOverview';
import { CampaignDetailModal } from '../campaign-details/CampaignDetailModal';

export const CampaignDashboardPage: React.FC = () => {
  const { activeBusiness, navigateTo, selectedCampaignId, tr } = useApp();

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl font-bold sm:text-4xl">
            {tr('Ads for {business}', { business: activeBusiness.businessName || tr('your shop') })}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[color:var(--ink-soft)]">
            {tr('Your saved ad plans. Nothing is posted or charged, and all results shown are practice numbers.')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigateTo('marketing-plan')}
            className="btn-secondary min-h-11 px-4 text-sm"
          >
            {tr('Spending plan')}
          </button>
          <button
            type="button"
            onClick={() => navigateTo('creative-studio')}
            className="btn-primary min-h-11 px-4 text-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {tr('Make an ad')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <DashboardOverview />
      <CampaignList
        onSelectCampaign={(campaignId) => navigateTo('campaign-details', campaignId)}
      />
      <CampaignDetailModal
        campaignId={selectedCampaignId}
        onClose={() => navigateTo('dashboard')}
      />
    </div>
  );
};

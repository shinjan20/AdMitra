import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Link2,
  Lock,
  ShieldCheck,
  Unplug,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConnectedAccount } from '../../types';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';
import { formatDate } from '../../utils/date';

const providerMarks: Record<ConnectedAccount['provider'], string> = {
  google_ads: 'G',
  meta: 'M',
  whatsapp: 'W',
  ga4: 'A',
  google_business: 'B',
};

const statusCopy: Record<ConnectedAccount['status'], { label: string; className: string }> = {
  not_connected: {
    label: 'Not connected',
    className: 'bg-slate-100 text-slate-700',
  },
  demo_connected: {
    label: 'Practice connection',
    className: 'bg-amber-50 text-amber-900 border border-amber-200',
  },
  needs_attention: {
    label: 'Needs attention',
    className: 'bg-rose-50 text-rose-800 border border-rose-200',
  },
};

export const ConnectedAccountsPage: React.FC = () => {
  const {
    activeBusiness,
    connectedAccounts,
    updateConnectedAccount,
    navigateTo,
    tr,
  } = useApp();

  const connectedCount = connectedAccounts.filter(
    (account) => account.status === 'demo_connected',
  ).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <header>
        <p className="text-sm font-medium text-slate-500">{tr('Ad accounts')}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {tr('Connect an account when you need it')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {tr('You can try how a connection works without giving access to a real account. Nothing here can post an ad or spend money.')}
        </p>
      </header>

      <DemoNoticeBadge />

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        <p className="font-semibold">{tr('These are practice connections.')}</p>
        <p className="mt-1">
          {tr('Nothing is really connected. No password, payment or posting access is used. A practice connection is saved only in this browser so you can see how this step works.')}
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3 sm:p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tr('Business')}</p>
          <p className="mt-1 font-semibold text-slate-900">{activeBusiness.businessName || tr('Not set')}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tr('Practice connections')}</p>
          <p className="mt-1 font-semibold text-slate-900">
            {tr('{connected} of {total}', { connected: connectedCount, total: connectedAccounts.length })}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tr('Real data')}</p>
          <p className="mt-1 inline-flex items-center gap-2 font-semibold text-slate-900">
            <Unplug className="h-4 w-4 text-slate-500" aria-hidden="true" />
            {tr('None')}
          </p>
        </div>
      </section>

      <div className="space-y-3">
        {connectedAccounts.map((account) => {
          const status = statusCopy[account.status];
          const connected = account.status === 'demo_connected';
          return (
            <section key={account.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                    {providerMarks[account.provider]}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900">{tr(account.label)}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {tr(status.label)}
                      </span>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                      {tr(account.whyAccess)}
                    </p>
                  </div>
                </div>

                {connected ? (
                  <button
                    type="button"
                    onClick={() => updateConnectedAccount(account.provider, 'not_connected')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Unplug className="h-4 w-4" aria-hidden="true" />
                    {tr('Remove practice connection')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateConnectedAccount(account.provider, 'demo_connected')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                    {tr('Try a practice connection')}
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    {tr('What it would access')}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {account.scopes.map((scope) => (
                      <li key={scope} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                        {scope}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {tr('Connection status')}
                  </p>
                  {connected ? (
                    <div className="mt-1.5 space-y-1">
                      <p className="inline-flex items-center gap-1.5 font-medium text-amber-900">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        {tr('Practice only — no real access is saved.')}
                      </p>
                      <p>{tr('Practice account: {account}', { account: account.externalAccountId || tr('Not set') })}</p>
                      <p>{tr('Last checked: {date}', { date: account.lastChecked ? formatDate(account.lastChecked) : tr('Not checked') })}</p>
                    </div>
                  ) : (
                    <p className="mt-1.5">
                      {tr('Nothing is shared with this company in the demo.')}
                    </p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          {tr('What a live connection would need')}
        </h2>
        <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-slate-600 sm:grid-cols-2">
          <li>{tr('Google Ads: you would sign in to Google and approve access. Google would also review the app.')}</li>
          <li>{tr('Facebook and Instagram: you would sign in to Meta, choose your business page, and approve access.')}</li>
          <li>{tr('WhatsApp: a business account and approved reply templates would be needed.')}</li>
          <li>{tr('Google Analytics: optional website visit numbers. It does not replace the results shown by Google or Meta.')}</li>
          <li>{tr('Google Business Profile: you would sign in and approve access to your public shop listing.')}</li>
          <li>{tr('AdMitra never holds your ad money or saves your card details.')}</li>
        </ul>
        <button
          type="button"
          onClick={() => navigateTo('marketing-plan')}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {tr('Review the spending plan')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
};

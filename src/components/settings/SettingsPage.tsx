import React from 'react';
import { RotateCcw, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoNoticeBadge } from '../common/DemoNoticeBadge';

export const SettingsPage: React.FC = () => {
  const { resetAllData, tr } = useApp();
  const [isResetting, setIsResetting] = React.useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <header>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Settings className="h-4 w-4" aria-hidden="true" />
          {tr('Settings')}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {tr('Settings and practice data')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {tr('Practice shops and ad plans are saved in this browser only. No ad is delivered and no result is real.')}
        </p>
      </header>

      <DemoNoticeBadge />

      <section className="rounded-2xl border border-rose-200 bg-white p-5 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-rose-900">
          <RotateCcw className="h-4 w-4 text-rose-600" aria-hidden="true" />
          {tr('Reset practice data')}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          {tr('Restore the sample shop and ad plans. This also clears drafts saved in this browser.')}
        </p>
        <button
          type="button"
          disabled={isResetting}
          onClick={() => {
            if (window.confirm(tr('Reset practice data saved in this browser?'))) {
              setIsResetting(true);
              try {
                resetAllData();
              } finally {
                setIsResetting(false);
              }
            }
          }}
          className="min-h-11 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
        >
          {isResetting ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {tr('Resetting...')}
            </span>
          ) : (
            tr('Reset practice data')
          )}
        </button>
      </section>
    </div>
  );
};

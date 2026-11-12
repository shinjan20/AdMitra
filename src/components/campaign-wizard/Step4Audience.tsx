import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Audience } from '../../types';
import { useApp } from '../../context/AppContext';

interface Step4AudienceProps {
  audience: Audience | null;
  onUpdateAudience: (audience: Audience) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Audience: React.FC<Step4AudienceProps> = ({
  audience,
  onUpdateAudience,
  onNext,
  onBack,
}) => {
  const { activeBusiness, tr } = useApp();
  const [city, setCity] = useState(audience?.locationCity || activeBusiness.location.city);
  const [area, setArea] = useState(audience?.locationArea || activeBusiness.location.area);
  const [distance, setDistance] = useState(audience?.radiusKm || 5);
  const hasPresetDistance = [5, 10, 20].includes(distance);

  useEffect(() => {
    onUpdateAudience({
      id: audience?.id || `aud-${Date.now()}`,
      campaignId: audience?.campaignId || '',
      locationCity: city,
      locationArea: area,
      radiusKm: distance,
      ageRangeMin: audience?.ageRangeMin || 20,
      ageRangeMax: audience?.ageRangeMax || 45,
      gender: audience?.gender || 'all',
      interests: audience?.interests || [],
      rationale: tr('People within {distance} km of {area} in {city}.', {
        distance,
        area: area || city,
        city,
      }),
    });
  }, [city, area, distance]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {tr('Choose an area')}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tr('Set where people might see this sample ad. No ad will be published.')}
        </p>
      </div>

      <div className="max-w-xl space-y-5">
        <div>
          <label htmlFor="audience-city" className="mb-1.5 block text-sm font-medium text-slate-700">
            {tr('Town or city')}
          </label>
          <input
            id="audience-city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            maxLength={100}
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label htmlFor="audience-area" className="mb-1.5 block text-sm font-medium text-slate-700">
            {tr('Nearby area or landmark')}
          </label>
          <input
            id="audience-area"
            type="text"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            maxLength={100}
            placeholder={tr('For example: Civil Lines')}
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label htmlFor="audience-distance" className="mb-1.5 block text-sm font-medium text-slate-700">
            {tr('How far around this area?')}
          </label>
          <select
            id="audience-distance"
            value={distance}
            onChange={(event) => setDistance(Number(event.target.value))}
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {!hasPresetDistance && <option value={distance}>{tr('Current choice · {distance} km', { distance })}</option>}
            <option value={5}>{tr('Nearby · 5 km')}</option>
            <option value={10}>{tr('Nearby areas · 10 km')}</option>
            <option value={20}>{tr('Wider area · 20 km')}</option>
          </select>
        </div>

        <div className="flex items-start gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <p>
            {tr('This sample is set for {location} and the nearby area.', {
              location: area ? `${area}, ${city}` : city,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {tr('Back')}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!city.trim()}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tr('Continue')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

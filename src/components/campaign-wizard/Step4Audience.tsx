import React, { useState, useEffect } from 'react';
import { Audience } from '../../types';
import { useApp } from '../../context/AppContext';
import { INDIAN_CITIES, INDIAN_SMB_PRESETS } from '../../utils/presets';
import {
  MapPin,
  Users,
  ArrowRight,
  ArrowLeft,
  Tag,
  Plus,
  X,
  Compass,
} from 'lucide-react';

interface Step4AudienceProps {
  audience: Audience | null;
  onUpdateAudience: (aud: Audience) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Audience: React.FC<Step4AudienceProps> = ({
  audience,
  onUpdateAudience,
  onNext,
  onBack,
}) => {
  const { activeBusiness } = useApp();

  const matchingPreset = INDIAN_SMB_PRESETS.find(
    (p) => p.category.toLowerCase() === activeBusiness.category.toLowerCase()
  );

  const defaultInterests = matchingPreset?.recommendedInterests || [
    'Local Services',
    'Special Offers',
    'Quality Living',
  ];

  const [city, setCity] = useState(audience?.locationCity || activeBusiness.location.city || 'Lucknow');
  const [area, setArea] = useState(audience?.locationArea || activeBusiness.location.area || '');
  const [radiusKm, setRadiusKm] = useState(audience?.radiusKm || 10);
  const [ageMin, setAgeMin] = useState(audience?.ageRangeMin || 20);
  const [ageMax, setAgeMax] = useState(audience?.ageRangeMax || 45);
  const [gender, setGender] = useState<'all' | 'men' | 'women'>(audience?.gender || 'all');
  const [interests, setInterests] = useState<string[]>(
    audience?.interests && audience.interests.length > 0 ? audience.interests : defaultInterests
  );
  const [newInterestInput, setNewInterestInput] = useState('');

  const calculateAudienceSize = () => {
    const baseDensity = city === 'Mumbai' || city === 'Delhi NCR' ? 12000 : 7500;
    const radiusFactor = Math.pow(radiusKm / 5, 1.4);
    const ageFactor = (ageMax - ageMin) / 40;
    const genderFactor = gender === 'all' ? 1 : 0.52;
    const est = Math.round(baseDensity * radiusFactor * ageFactor * genderFactor);

    const lower = Math.round(est * 0.85);
    const upper = Math.round(est * 1.25);
    return `${lower.toLocaleString('en-IN')} - ${upper.toLocaleString('en-IN')} people`;
  };

  const estimatedSize = calculateAudienceSize();

  const handleSyncAudience = () => {
    onUpdateAudience({
      id: audience?.id || `aud-${Date.now()}`,
      campaignId: audience?.campaignId || '',
      locationCity: city,
      locationArea: area,
      radiusKm,
      ageRangeMin: ageMin,
      ageRangeMax: ageMax,
      gender,
      interests,
      estimatedAudienceSize: estimatedSize,
      rationale: `Targeting residents within ${radiusKm}km of ${area ? area + ', ' : ''}${city} aged ${ageMin}-${ageMax}.`,
    });
  };

  useEffect(() => {
    handleSyncAudience();
  }, [city, area, radiusKm, ageMin, ageMax, gender, interests]);

  const handleAddInterest = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (tag: string) => {
    setInterests(interests.filter((i) => i !== tag));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
          Who should see your advertisement?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Reach people in your city and neighborhood most likely to contact your business.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Location & Radius */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Target Location & Radius
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-medium"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Locality / Landmark
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Hazratganj"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Radius */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-700">Distance Radius</span>
                <span className="text-slate-900 font-semibold px-2 py-0.5 rounded bg-slate-100">
                  {radiusKm} km radius
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="35"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Immediate area (2 km)</span>
                <span>Entire city (35 km)</span>
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Demographics
            </span>

            {/* Gender Toggle */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Genders' },
                { id: 'women', label: 'Women' },
                { id: 'men', label: 'Men' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGender(g.id as any)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    gender === g.id
                      ? 'border-slate-900 bg-slate-100 text-slate-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Age Range */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-700">Age Range</span>
                <span className="text-slate-900 font-semibold px-2 py-0.5 rounded bg-slate-100">
                  {ageMin} to {ageMax} yrs
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="18"
                  max={ageMax - 2}
                  value={ageMin}
                  onChange={(e) => setAgeMin(Math.max(18, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
                <input
                  type="number"
                  min={ageMin + 2}
                  max="65"
                  value={ageMax}
                  onChange={(e) => setAgeMax(Math.min(65, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              Customer Interests
            </span>

            <div className="flex flex-wrap gap-1.5">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(tag)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom interest tag"
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest(newInterestInput);
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={() => handleAddInterest(newInterestInput)}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Estimated Reach (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                Estimated Reach
              </span>
              <span className="text-[11px] font-medium text-emerald-700">Balanced</span>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Potential Local Audience</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {estimatedSize}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Active people within {radiusKm} km of {area ? `${area}, ` : ''}{city}.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed">
              <strong>Local Advice:</strong> Customers for {activeBusiness.category.toLowerCase()} generally travel within {radiusKm} km. This targeting ensures your budget is spent only on nearby people.
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <button
          onClick={() => {
            handleSyncAudience();
            onNext();
          }}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-all"
        >
          Save Audience & Next: Budget
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

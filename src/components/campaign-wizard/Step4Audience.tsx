import React, { useState, useEffect } from 'react';
import { Audience } from '../../types';
import { useApp } from '../../context/AppContext';
import { INDIAN_CITIES, INDIAN_SMB_PRESETS } from '../../utils/presets';
import {
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Tag,
  Plus,
  X,
  Compass,
  CheckCircle2,
  Info,
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
    'Community News',
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

  // Estimate audience size dynamically based on city, radius, and age
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
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
            Step 4 of 6
          </span>
          <span className="text-xs text-slate-500 font-medium">Audience Configuration</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
          Who should see your advertisement?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Reach people in your city and neighborhood most likely to visit or contact your business.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Geographic Location & Radius */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Geographic Targeting
              </span>
              <span className="text-[11px] text-slate-500">Local Area Focus</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Locality / Landmark
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Hazratganj, Indiranagar"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Radius Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">Distance Radius from Business</span>
                <span className="text-blue-600 font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
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
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Immediate neighborhood (2 km)</span>
                <span>Entire Metro Area (35 km)</span>
              </div>
            </div>
          </div>

          {/* Demographics: Age & Gender */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Demographics
              </span>
            </div>

            {/* Gender Toggle */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Target Gender
              </label>
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
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      gender === g.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">Target Age Range</span>
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {ageMin} to {ageMax} years old
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">Minimum Age</label>
                  <input
                    type="number"
                    min="18"
                    max={ageMax - 2}
                    value={ageMin}
                    onChange={(e) => setAgeMin(Math.max(18, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium">Maximum Age</label>
                  <input
                    type="number"
                    min={ageMin + 2}
                    max="65"
                    value={ageMax}
                    onChange={(e) => setAgeMax(Math.min(65, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg mt-0.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interests & Categories */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Interests & Customer Affinities
              </span>
            </div>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-1.5">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(tag)}
                    className="text-blue-500 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Input to add tag */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom interest tag (e.g. Wedding Shopping, Vegan Food)"
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest(newInterestInput);
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddInterest(newInterestInput)}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Audience Summary & Reach Gauge (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-400" />
                Audience Reach Estimator
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
                Optimized
              </span>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Estimated Target Size</p>
              <h3 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
                {estimatedSize}
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Active social media users within {radiusKm} km of {area ? `${area}, ` : ''}{city}.
              </p>
            </div>

            {/* Visual Gauge */}
            <div className="space-y-1.5 pt-2 border-t border-slate-700/80">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Audience Breadth:</span>
                <span className="font-bold text-emerald-400">Ideal Local Fit</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(95, Math.max(30, (radiusKm / 35) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                Neither too broad (wasting ad money) nor too narrow (slow delivery).
              </p>
            </div>

            {/* Plain explanation */}
            <div className="p-3 bg-white/10 rounded-xl text-xs text-slate-200 leading-relaxed space-y-1 backdrop-blur-xs">
              <p className="font-semibold text-white">Why this works:</p>
              <p>
                People in {city} will travel roughly {radiusKm} km for {activeBusiness.category.toLowerCase()} services. By matching interests to their habits, your ad reaches high-intent prospects.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Creative
        </button>

        <button
          onClick={() => {
            handleSyncAudience();
            onNext();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:shadow"
        >
          Save Audience & Next: Budget
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


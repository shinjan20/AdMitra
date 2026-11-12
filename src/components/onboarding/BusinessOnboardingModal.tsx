import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { INDIAN_SMB_PRESETS, INDIAN_CITIES } from '../../utils/presets';
import { Building2, Sparkles, MapPin, Phone, MessageSquare, Globe, Camera, ArrowRight, Check } from 'lucide-react';

export const BusinessOnboardingModal: React.FC = () => {
  const {
    showOnboardingModal,
    setShowOnboardingModal,
    createNewBusiness,
    setActiveBusiness,
    activeBusiness,
  } = useApp();

  const [useCustom, setUseCustom] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    category: 'Beauty & Wellness',
    description: '',
    city: 'Lucknow',
    area: '',
    address: '',
    websiteUrl: '',
    phone: '',
    whatsappNumber: '',
    instagramHandle: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectPreset = (presetId: string) => {
    const preset = INDIAN_SMB_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const newBiz = createNewBusiness({
      businessName: preset.name,
      category: preset.category,
      description: preset.description,
      location: {
        city: preset.city,
        area: preset.area,
      },
      websiteUrl: preset.websiteUrl,
      phone: preset.phone,
      whatsappNumber: preset.whatsappNumber,
      instagramHandle: preset.instagramHandle,
    });

    setShowOnboardingModal(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description.trim() || formData.description.length < 15) {
      newErrors.description = 'Please provide at least 15 characters describing what your business offers';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createNewBusiness({
      businessName: formData.businessName.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      location: {
        city: formData.city.trim(),
        area: formData.area.trim() || 'Central City Area',
        address: formData.address.trim(),
      },
      websiteUrl: formData.websiteUrl.trim(),
      phone: formData.phone.trim(),
      whatsappNumber: formData.whatsappNumber.trim() || formData.phone.trim(),
      instagramHandle: formData.instagramHandle.trim(),
    });

    setShowOnboardingModal(false);
  };

  return (
    <Modal
      isOpen={showOnboardingModal}
      onClose={() => setShowOnboardingModal(false)}
      title="Business Profile Onboarding"
      subtitle="Add your business details to personalize campaign and ad copy suggestions."
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Toggle between Preset or Custom */}
        <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setUseCustom(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              !useCustom
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Pick an Indian SMB Preset (1-Click Instant Demo)
          </button>
          <button
            type="button"
            onClick={() => setUseCustom(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              useCustom
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Create Custom Business Profile
          </button>
        </div>

        {!useCustom ? (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              Choose a sample business to explore the demo, or create a profile for your business:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {INDIAN_SMB_PRESETS.map((preset) => {
                const isCurrentActive = activeBusiness.businessName === preset.name;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:shadow-md hover:border-blue-400 group relative ${
                      isCurrentActive
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    {isCurrentActive && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded mb-1.5">
                      {preset.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {preset.city} ({preset.area.split('&')[0].trim()})
                      </span>
                      <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Use this <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Sweets & Bakery"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.businessName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.businessName && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{errors.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Beauty & Wellness">Beauty & Wellness (Salon, Spa, Makeup)</option>
                  <option value="Education & Coaching">Education & Coaching (IIT, Board, Prep)</option>
                  <option value="Restaurant & Dining">Restaurant & Dining (Cafe, Bakery, Cloud Kitchen)</option>
                  <option value="Fitness & Gym">Fitness & Gym (Crossfit, Yoga, Gym)</option>
                  <option value="Retail & Fashion">Retail & Fashion (Boutique, Jewellery, Footwear)</option>
                  <option value="Healthcare & Clinic">Healthcare & Clinic (Dental, Eyecare, Diagnostics)</option>
                  <option value="Home & Professional Services">Home & Professional Services</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Description & Speciality <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what your business does, your key services, and what makes you special..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target City (India) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Locality / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gomti Nagar, HSR Layout, Andheri West"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-rose-500" /> Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="@yourbusiness"
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOnboardingModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                Save & Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

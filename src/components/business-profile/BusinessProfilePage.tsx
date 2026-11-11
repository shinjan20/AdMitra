import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INDIAN_CITIES, INDIAN_SMB_PRESETS } from '../../utils/presets';
import {
  Building2,
  MapPin,
  Phone,
  MessageSquare,
  Camera,
  Globe,
  Sparkles,
  Save,
  CheckCircle2,
  Store,
} from 'lucide-react';

export const BusinessProfilePage: React.FC = () => {
  const {
    activeBusiness,
    updateBusiness,
    setShowOnboardingModal,
    showToast,
  } = useApp();

  const [formData, setFormData] = useState({
    businessName: activeBusiness.businessName,
    category: activeBusiness.category,
    description: activeBusiness.description,
    city: activeBusiness.location.city,
    area: activeBusiness.location.area || '',
    address: activeBusiness.location.address || '',
    websiteUrl: activeBusiness.websiteUrl || '',
    phone: activeBusiness.phone || '',
    whatsappNumber: activeBusiness.whatsappNumber || '',
    instagramHandle: activeBusiness.instagramHandle || '',
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      ...activeBusiness,
      businessName: formData.businessName,
      category: formData.category,
      description: formData.description,
      location: {
        city: formData.city,
        area: formData.area,
        address: formData.address,
      },
      websiteUrl: formData.websiteUrl,
      phone: formData.phone,
      whatsappNumber: formData.whatsappNumber,
      instagramHandle: formData.instagramHandle,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Business Profile
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            {activeBusiness.businessName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your business details provide essential context for AI campaign recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowOnboardingModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Switch SMB Demo Preset
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            Basic Business Details
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identity and core offering used for AI copy generation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Beauty & Wellness">Beauty & Wellness (Salon, Spa, Makeup)</option>
              <option value="Education & Coaching">Education & Coaching (IIT, Board, Prep)</option>
              <option value="Restaurant & Dining">Restaurant & Dining (Cafe, Bakery, Kitchen)</option>
              <option value="Fitness & Gym">Fitness & Gym (CrossFit, Gym, Yoga)</option>
              <option value="Retail & Fashion">Retail & Fashion (Boutique, Footwear)</option>
              <option value="Healthcare & Clinic">Healthcare & Clinic (Dental, Eyecare)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description & Core Offerings <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="border-b border-slate-100 pb-2 pt-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Location & Physical Address
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Landmark</label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-b border-slate-100 pb-2 pt-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            Customer Contact Channels
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Number
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-rose-500" /> Instagram Handle
            </label>
            <input
              type="text"
              value={formData.instagramHandle}
              onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Profile Updated
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

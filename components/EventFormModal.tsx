import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, Calendar, MapPin, DollarSign, Type, Star } from 'lucide-react';
import { Event } from '../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<Event>) => Promise<void>;
  initialData?: Event | null;
  userRole?: string;
}

const CATEGORIES = ['Party', 'Hike', 'Diving', 'Wellness', 'Workshop'];

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, userRole }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: 0,
    category: 'Party',
    imageUrl: '',
    status: 'pending', // Default for new events, override if admin
    isFeatured: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: 0,
        category: 'Party',
        imageUrl: '',
        status: 'pending',
        isFeatured: false
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Added text-gray-900 to force dark text inside the white modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-gray-900">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-900">{initialData ? 'Edit Event' : 'Create Event'}</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Event Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative overflow-hidden group"
            >
              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white font-bold text-sm">Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Title</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900"
                  placeholder="Event Name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Time</label>
              <input 
                type="text" 
                required
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                placeholder="08:00 AM"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900"
                  placeholder="Place name"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Price (EGP)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          <div>
             <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
             <textarea 
               required
               value={formData.description}
               onChange={e => setFormData({...formData, description: e.target.value})}
               className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none h-24 resize-none bg-white text-gray-900"
               placeholder="Tell people about the event..."
             />
          </div>
          
          {/* Admin Only: Feature Event */}
          {userRole === 'admin' && (
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
               <label className="flex items-center gap-3 cursor-pointer">
                 <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition ${formData.isFeatured ? 'bg-dahab-gold border-dahab-gold' : 'border-gray-400 bg-white'}`}>
                    {formData.isFeatured && <Star size={12} className="text-white" fill="currentColor" />}
                 </div>
                 <input 
                   type="checkbox" 
                   className="hidden"
                   checked={formData.isFeatured || false}
                   onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                 />
                 <div>
                   <span className="block font-bold text-gray-900 text-sm">Feature Event</span>
                   <span className="text-xs text-gray-500">Show this event on the home page hero section</span>
                 </div>
               </label>
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-dahab-teal text-white py-3 rounded-xl font-bold hover:bg-teal-700 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (initialData ? 'Update Event' : 'Create Event')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
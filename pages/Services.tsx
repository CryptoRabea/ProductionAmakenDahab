import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Phone, ShieldCheck, Car, Briefcase } from 'lucide-react';
import { ServiceProvider, User } from '../types';
import { db } from '../services/mockDatabase';
import ReviewsModal from '../components/ReviewsModal';

interface ServicesProps {
  user: User | null;
}

const Services: React.FC<ServicesProps> = ({ user }) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'Driver' | 'Other'>('all');
  const [loading, setLoading] = useState(true);

  // Reviews Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProviderForReview, setSelectedProviderForReview] = useState<{id: string, title: string} | null>(null);

  useEffect(() => {
    // Poll data to check for rating updates
    const fetchProviders = () => {
      db.getProviders().then(data => {
        setProviders(data);
        setLoading(false);
      });
    };
    
    fetchProviders();
    // In a real app with real-time DB, this wouldn't be needed, 
    // but here we want to see rating updates after modal closes.
    const interval = setInterval(fetchProviders, 5000);
    return () => clearInterval(interval);
  }, []);

  const openReviews = (provider: ServiceProvider) => {
    setSelectedProviderForReview({ id: provider.id, title: provider.name });
    setReviewModalOpen(true);
  };

  const filteredProviders = activeTab === 'all' 
    ? providers 
    : providers.filter(p => activeTab === 'Driver' ? p.serviceType === 'Driver' : p.serviceType !== 'Driver');

  return (
    <div className="space-y-8">
      {/* Header with Tabs */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-gray-900">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Services Directory</h1>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            {['all', 'Driver', 'Other'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-white shadow text-dahab-teal' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'all' ? 'All Services' : tab === 'Driver' ? 'Drivers' : 'Home Services'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-blue-900 text-lg">Drive or Work with AmakenDahab</h3>
            <p className="text-sm text-blue-700">Join our verified network of local professionals.</p>
          </div>
          <div className="flex gap-3">
             <Link 
               to="/login?role=provider" 
               className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 flex items-center gap-2"
             >
               <Car size={16} />
               Are you a Driver?
             </Link>
             <Link 
               to="/login?role=provider" 
               className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
             >
               <Briefcase size={16} />
               List a Service
             </Link>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 opacity-70">Loading directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col gap-4 text-gray-900">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={provider.imageUrl} alt={provider.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-1">
                      {provider.name}
                      {provider.isVerified && <ShieldCheck size={16} className="text-dahab-teal" />}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs uppercase">{provider.serviceType}</span>
                  </div>
                </div>
                <button 
                  onClick={() => openReviews(provider)}
                  className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-sm font-bold hover:bg-yellow-100 transition"
                >
                  <Star size={14} fill="currentColor" />
                  {provider.rating}
                </button>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2">{provider.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                <Link 
                  to={`/book/service/${provider.id}`} 
                  className="flex-1 bg-dahab-teal text-white py-2 rounded-lg font-medium text-center text-sm hover:bg-teal-700 transition"
                >
                  Book
                </Link>
                <a href={`tel:${provider.phone}`} className="flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                  <Phone size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Reviews Modal */}
      <ReviewsModal 
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        itemId={selectedProviderForReview?.id || null}
        itemTitle={selectedProviderForReview?.title || ''}
        user={user}
      />
    </div>
  );
};

export default Services;
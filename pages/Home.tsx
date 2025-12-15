import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/mockDatabase';
import { Event } from '../types';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles, Car, Briefcase, XCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import Editable from '../components/Editable';

const Home: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings, isEditing } = useSettings();

  useEffect(() => {
    if (settings.heroImages.length === 0) return;

    // Slideshow Timer
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % settings.heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [settings.heroImages]);

  const fetchFeatured = async () => {
    const data = await db.getPublicEvents();
    // Filter for explicitly featured events
    const featured = data.filter(e => e.isFeatured);
    
    // If we have featured events, show them. Otherwise fallback to the first 3 recent ones.
    if (featured.length > 0) {
      setFeaturedEvents(featured);
    } else {
      setFeaturedEvents(data.slice(0, 3));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeatured();
  }, [isEditing]); // Re-fetch when editing toggles to ensure fresh state

  const handleRemoveFeatured = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    if(window.confirm('Remove this event from Featured list?')) {
        await db.toggleFeaturedEvent(eventId, false);
        fetchFeatured();
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px] group">
        {/* Slideshow Background */}
        <div className="absolute inset-0 bg-gray-900">
          {settings.heroImages.length > 0 ? (
            settings.heroImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out transform ${
                  index === currentImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Dahab scenery ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              </div>
            ))
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
              No images configured
            </div>
          )}
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16 z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg flex flex-col md:block gap-2">
            <Editable id="home-hero-title-1" defaultContent="Experience the Soul of" className="inline-block mr-2" />
            <span className="text-dahab-gold">
               <Editable id="home-hero-title-highlight" defaultContent={settings.appName.split(' ')[0]} />
            </span>
          </h1>
          <div className="text-gray-100 text-lg md:text-xl max-w-2xl mb-8 drop-shadow-md font-medium">
             <Editable id="home-hero-subtitle" defaultContent="The ultimate social hub. Discover events, book reliable drivers, and connect with the community." />
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link to="/events" className="bg-dahab-teal text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-dahab-teal/50">
              <Editable id="home-btn-events" defaultContent="Find Events" />
            </Link>
            <Link to="/services" className="bg-white/10 backdrop-blur-md text-white border border-white/50 px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition shadow-lg">
              <Editable id="home-btn-drivers" defaultContent="Book a Driver" />
            </Link>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-6 right-8 z-20 flex gap-2">
          {settings.heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentImage ? 'bg-dahab-gold w-6' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">
            <Editable id="home-cat-title" defaultContent={`Explore ${settings.appName.split(' ')[0]}`} />
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Events & Parties', icon: '🎉', link: '/events', color: 'bg-purple-100 text-purple-600' },
            { title: 'Drivers & Services', icon: '🚕', link: '/services', color: 'bg-yellow-100 text-yellow-600' },
            { title: 'Community Hub', icon: '👥', link: '/community', color: 'bg-blue-100 text-blue-600' },
            { title: 'More & Guide', icon: '🗺️', link: '/more', color: 'bg-teal-100 text-teal-600' },
          ].map((cat, idx) => (
            <Link key={idx} to={cat.link} className={`p-6 rounded-2xl ${cat.color} hover:opacity-90 transition flex flex-col items-center justify-center gap-3 text-center h-40 group`}>
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              <span className="font-bold">{cat.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Events Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
             <h2 className="text-2xl font-bold flex items-center gap-2">
               <Sparkles className="text-dahab-gold" fill="currentColor" size={24} />
               <Editable id="home-featured-title" defaultContent="Featured Events" />
             </h2>
             <div className="opacity-80 text-sm mt-1">
                <Editable id="home-featured-subtitle" defaultContent="Don't miss out on these popular activities" />
             </div>
          </div>
          <Link to="/events" className="text-dahab-teal font-bold flex items-center gap-1 hover:underline text-sm bg-teal-50 px-3 py-1 rounded-full">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
               <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <div key={event.id} className="relative group h-full">
                {/* Remove Button for Admin Edit Mode */}
                {isEditing && (
                  <button 
                    onClick={(e) => handleRemoveFeatured(e, event.id)}
                    className="absolute -top-3 -right-3 z-30 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"
                    title="Remove from Featured"
                  >
                    <XCircle size={20} />
                  </button>
                )}
                
                <Link to={`/book/event/${event.id}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/50 to-transparent opacity-60"></div>
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm border border-white/20">
                      {event.category}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-dahab-teal/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg border border-white/20">
                      {event.price} EGP
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-1 group-hover:text-dahab-teal transition-colors">{event.title}</h3>
                    <div className="space-y-3 text-sm text-gray-500 mb-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                          <Calendar size={16} />
                        </div>
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <Clock size={16} />
                        </div>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                          <MapPin size={16} />
                        </div>
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between text-dahab-teal font-bold group-hover:translate-x-1 transition-transform">
                      <span>Book Now</span>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Drive with Us Banner */}
      <section className="bg-gray-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-dahab-teal rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-bold">
            <Editable id="home-banner-title" defaultContent={`Drive with ${settings.appName}`} />
          </h2>
          <div className="text-gray-400 max-w-md">
            <Editable id="home-banner-desc" defaultContent="Are you a local driver or service provider? Join our verified network and grow your business today." />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto relative z-10">
           <div className="flex flex-col gap-2 w-full md:w-auto">
             <Link to="/login?role=provider" className="bg-dahab-gold text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition text-center shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2">
               <Car size={20} /> Register as Driver
             </Link>
             <Link to="/login?role=provider" className="bg-gray-800 text-white border border-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-700 transition text-center shadow-lg flex items-center justify-center gap-2">
               <Briefcase size={20} /> List a Service
             </Link>
             <span className="text-xs text-gray-500 text-center mt-1">Requires admin verification</span>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

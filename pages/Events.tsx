import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, Search, X, CalendarPlus, Heart, MessageSquare, Map as MapIcon, List, Download, ExternalLink, Star, Plus, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import { Event, User } from '../types';
import { db } from '../services/mockDatabase';
import ReviewsModal from '../components/ReviewsModal';
import EventMap from '../components/EventMap';
import { useSettings } from '../contexts/SettingsContext';
import EventFormModal from '../components/EventFormModal';

const CATEGORIES = ['All', 'Party', 'Hike', 'Diving', 'Wellness', 'Workshop'];

// Helper to generate Google Calendar URL
const getGoogleCalendarUrl = (event: Event) => {
  const [year, month, day] = event.date.split('-').map(Number);
  const [timeStr, modifier] = event.time.split(' ');
  let [hours, minutes] = timeStr.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Default duration 2 hours

  const format = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${format(startDate)}/${format(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
};

// Helper to download ICS file for Outlook/Apple Calendar
const downloadICS = (event: Event) => {
  const [year, month, day] = event.date.split('-').map(Number);
  const [timeStr, modifier] = event.time.split(' ');
  let [hours, minutes] = timeStr.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));
  
  const format = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AmakenDahab//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@amakendahab.com`,
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(startDate)}`,
    `DTEND:${format(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const CalendarExportButton = ({ event }: { event: Event }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-xl border-2 transition flex items-center justify-center ${isOpen ? 'border-dahab-teal text-dahab-teal bg-teal-50' : 'border-gray-100 text-gray-500 hover:border-dahab-teal hover:text-dahab-teal hover:bg-teal-50'}`}
        title="Add to Calendar"
      >
        <CalendarPlus size={20} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-200">
           <div className="text-xs font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">Add to Calendar</div>
           <button 
             onClick={() => { window.open(getGoogleCalendarUrl(event), '_blank'); setIsOpen(false); }}
             className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-dahab-teal rounded-lg flex items-center gap-2 transition-colors"
           >
             <ExternalLink size={16} /> Google Calendar
           </button>
           <button 
             onClick={() => { downloadICS(event); setIsOpen(false); }}
             className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-dahab-teal rounded-lg flex items-center gap-2 transition-colors"
           >
             <Download size={16} /> Outlook / iCal
           </button>
           
           {/* Arrow at bottom */}
           <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

interface EventsProps {
  user: User | null;
  onToggleSave: (id: string) => void;
}

const Events: React.FC<EventsProps> = ({ user, onToggleSave }) => {
  const { isEditing } = useSettings();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // URL Params for category
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Reviews Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedEventForReview, setSelectedEventForReview] = useState<{id: string, title: string} | null>(null);

  // Edit/Create Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Initialize category from URL if present
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    }
    fetchEvents();
  }, [searchParams]);

  const fetchEvents = () => {
    db.getPublicEvents().then(data => {
      setEvents(data);
      setLoading(false);
    });
  };

  const openReviews = (e: React.MouseEvent, event: Event) => {
    e.preventDefault(); 
    setSelectedEventForReview({ id: event.id, title: event.title });
    setReviewModalOpen(true);
  };

  const handleToggleFeatured = async (e: React.MouseEvent, event: Event) => {
    e.preventDefault();
    e.stopPropagation();
    await db.toggleFeaturedEvent(event.id, !event.isFeatured);
    fetchEvents();
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (e: React.MouseEvent, event: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm("Delete this event permanently?")) {
        await db.deleteEvent(eventId);
        fetchEvents();
    }
  };

  const handleEventSubmit = async (data: Partial<Event>) => {
    if(editingEvent) {
        await db.updateEvent({ ...editingEvent, ...data } as Event);
    } else {
        await db.addEvent({
             id: Math.random().toString(36).substr(2, 9),
             title: data.title!,
             description: data.description!,
             date: data.date!,
             time: data.time!,
             location: data.location!,
             price: data.price!,
             imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=800',
             category: data.category!,
             organizerId: user?.id || 'admin',
             status: 'approved',
             isFeatured: data.isFeatured || false
        } as Event);
    }
    fetchEvents();
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Upcoming Events</h1>
              {isEditing && (
                <button 
                  onClick={handleCreateEvent}
                  className="border-2 border-dashed border-dahab-teal text-dahab-teal px-4 py-1.5 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-50 transition animate-pulse hover:animate-none"
                >
                  <Plus size={20} /> Add Event
                </button>
              )}
            </div>
            <p className="opacity-80">Discover what's happening in town</p>
          </div>
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex self-end">
             <button 
               onClick={() => setViewMode('list')}
               className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-dahab-teal text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               <List size={20} />
             </button>
             <button 
               onClick={() => setViewMode('map')}
               className={`p-2 rounded-lg transition ${viewMode === 'map' ? 'bg-dahab-teal text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               <MapIcon size={20} />
             </button>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input - Force text-gray-900 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/50 transition shadow-sm text-gray-900"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 items-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? 'bg-dahab-teal text-white border-dahab-teal shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 opacity-70 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-dahab-teal border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
            <button 
                onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                className="mt-4 text-dahab-teal font-bold hover:underline"
            >
                Clear Filters
            </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="h-[600px] bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
           <EventMap events={filteredEvents} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
             const isSaved = user?.savedEventIds?.includes(event.id);
             return (
              <div key={event.id} className="relative group/card bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition duration-300 flex flex-col h-full text-gray-900 overflow-hidden">
                {/* Admin Toggle Featured */}
                {isEditing && (
                  <>
                     <button 
                      onClick={(e) => handleToggleFeatured(e, event)}
                      className={`absolute top-4 left-4 z-20 p-2 rounded-full shadow-lg transition transform hover:scale-110 ${event.isFeatured ? 'bg-dahab-gold text-white' : 'bg-gray-200 text-gray-500'}`}
                      title={event.isFeatured ? "Remove from Featured" : "Add to Featured"}
                    >
                      <Star size={20} fill={event.isFeatured ? "currentColor" : "none"} />
                    </button>
                    
                    <button 
                      onClick={(e) => handleDeleteEvent(e, event.id)}
                      className="absolute top-4 left-16 z-20 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition transform hover:scale-110"
                      title="Delete Event"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}

                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className={`w-full h-full object-cover transition duration-700 ${isEditing ? 'opacity-80' : 'group-hover/card:scale-110'}`}
                  />
                  
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button 
                           onClick={(e) => handleEditEvent(e, event)}
                           className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-white hover:scale-105 transition z-20"
                        >
                           <ImageIcon size={16} /> Change Image
                        </button>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => onToggleSave(event.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition"
                      >
                        <Heart 
                          size={18} 
                          className={`transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                        />
                      </button>
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm flex items-center">
                        {event.category}
                      </div>
                    </div>
                  )}
                  
                  {isEditing && (
                     <button 
                        onClick={(e) => handleEditEvent(e, event)}
                        className="absolute bottom-4 left-4 z-20 bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 hover:bg-blue-600 text-xs font-bold"
                     >
                        <Edit size={12} /> Edit Details
                     </button>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                    <span className="text-dahab-teal font-bold whitespace-nowrap ml-2">{event.price} EGP</span>
                  </div>
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar size={16} className="text-dahab-gold" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock size={16} className="text-dahab-gold" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin size={16} className="text-dahab-gold" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                    <button 
                      onClick={(e) => openReviews(e, event)}
                      className="p-3 rounded-xl border-2 border-gray-100 text-gray-500 hover:border-dahab-teal hover:text-dahab-teal hover:bg-teal-50 transition flex items-center justify-center"
                      title="See Reviews"
                    >
                      <MessageSquare size={20} />
                    </button>
                    
                    <CalendarExportButton event={event} />

                    <Link 
                      to={`/book/event/${event.id}`}
                      className="flex-1 flex items-center justify-center bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-dahab-teal transition shadow-lg shadow-gray-200"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviews Modal */}
      <ReviewsModal 
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        itemId={selectedEventForReview?.id || null}
        itemTitle={selectedEventForReview?.title || ''}
        user={user}
      />

      {/* Edit/Create Event Modal */}
      <EventFormModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSubmit={handleEventSubmit}
          initialData={editingEvent}
          userRole={isEditing ? 'admin' : undefined} 
      />
    </div>
  );
};

export default Events;
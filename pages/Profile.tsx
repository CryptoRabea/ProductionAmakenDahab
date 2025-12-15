import React, { useEffect, useState } from 'react';
import { User, Event, Booking } from '../types';
import { db } from '../services/mockDatabase';
import { Mail, Shield, User as UserIcon, Calendar, MapPin, Heart, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: User;
  onToggleSave: (id: string) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onToggleSave, onLogout }) => {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'bookings'>('saved');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all events
    const allEvents = await db.getEvents();
    
    // Filter Saved
    const saved = allEvents.filter(e => user.savedEventIds?.includes(e.id));
    setSavedEvents(saved);

    // Fetch bookings
    const userBookings = await db.getUserBookings(user.id);
    setBookings(userBookings);
    
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-dahab-teal to-blue-500">
           <button 
             onClick={onLogout}
             className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/30 transition shadow-lg"
           >
             <LogOut size={16} /> Logout
           </button>
        </div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg z-10">
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <UserIcon size={40} className="text-gray-400" />
              </div>
            </div>
            <div className="flex-1 space-y-1 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Mail size={16} /> {user.email}
                </div>
                <div className="flex items-center gap-1 capitalize">
                  <Shield size={16} /> {user.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-3 font-medium text-sm transition border-b-2 whitespace-nowrap ${
            activeTab === 'saved' 
              ? 'border-dahab-teal text-dahab-teal' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Saved ({savedEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 font-medium text-sm transition border-b-2 whitespace-nowrap ${
            activeTab === 'bookings' 
              ? 'border-dahab-teal text-dahab-teal' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {activeTab === 'saved' && (
            <div className="space-y-6">
              {savedEvents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                  <Heart className="mx-auto text-gray-300 mb-2" size={40} />
                  <p className="text-gray-500">You haven't saved any events yet.</p>
                  <Link to="/events" className="text-dahab-teal font-bold hover:underline mt-2 inline-block">
                    Browse Events
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg transition">
                      <div className="relative h-40">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                         <button
                            onClick={() => onToggleSave(event.id)}
                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-red-500 hover:bg-white transition"
                          >
                            <Heart size={16} fill="currentColor" />
                          </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{event.title}</h3>
                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                           <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-dahab-gold" /> {event.date}
                           </div>
                           <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-dahab-gold" /> {event.location}
                           </div>
                        </div>
                        <Link 
                          to={`/book/event/${event.id}`}
                          className="mt-auto w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-dahab-teal hover:text-white transition text-center"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               {bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No bookings found.</div>
               ) : (
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-900">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr>
                        <th className="p-4">Item</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium">Booking #{booking.id.substr(0, 6)}</td>
                          <td className="p-4 capitalize">{booking.itemType}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500">{new Date(booking.timestamp).toLocaleDateString()}</td>
                          <td className="p-4 text-right font-bold">{booking.amount} EGP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
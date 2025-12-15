import React, { useEffect, useState } from 'react';
import { User, Event, UserRole, Booking } from '../types';
import { db } from '../services/mockDatabase';
import { Plus, Clock, CheckCircle, XCircle, Calendar, MapPin, Edit2, Trash2, Eye, BarChart3, Users, DollarSign, ShieldAlert, LogOut, Upload, Loader2, Smartphone } from 'lucide-react';
import EventFormModal from '../components/EventFormModal';
import { useNavigate } from 'react-router-dom';

interface ProviderDashboardProps {
  onLogout: () => void;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Payment State
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('dahab_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== UserRole.PROVIDER) {
        navigate('/'); // Redirect if not provider
      } else {
        setUser(parsedUser);
        fetchData(parsedUser.id);
      }
    } else {
      navigate('/login');
    }
  }, []);

  const fetchData = async (userId: string) => {
    setLoading(true);
    const allEvents = await db.getEvents();
    // Filter events where organizer is the current provider
    const mine = allEvents.filter(e => e.organizerId === userId);
    setMyEvents(mine);
    
    const allBookings = await db.getBookings();
    const myItemIds = mine.map(e => e.id);
    const providerBookings = allBookings.filter(b => myItemIds.includes(b.itemId)); 
    setBookings(providerBookings);

    setLoading(false);
  };

  const handleOpenEventModal = (event?: Event) => {
    setEditingEvent(event || null);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    if (!user) return;
    
    if (editingEvent) {
      await db.updateEvent({ ...editingEvent, ...eventData, status: 'pending' } as Event);
    } else {
      await db.addEvent({
        id: Math.random().toString(36).substr(2, 9),
        title: eventData.title!,
        description: eventData.description!,
        date: eventData.date!,
        time: eventData.time!,
        location: eventData.location!,
        price: eventData.price!,
        imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=800',
        category: eventData.category!,
        organizerId: user.id,
        status: 'pending'
      } as Event);
    }
    await fetchData(user.id);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await db.deleteEvent(id);
      if (user) fetchData(user.id);
    }
  };

  const handlePaymentSubmit = async () => {
    if(!user || !paymentFile) return;
    setIsSubmittingPayment(true);
    // Simulate upload
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64 = reader.result as string;
        await db.submitProviderPayment(user.id, base64);
        setIsSubmittingPayment(false);
        // Force refresh user to see new status
        const updated = await db.getUser(user.id);
        if(updated) {
            setUser(updated);
            localStorage.setItem('dahab_user', JSON.stringify(updated));
        }
    };
    reader.readAsDataURL(paymentFile);
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;
  if (!user) return null;

  // Subscription Paywall for Stage 2 (pending_payment)
  if (user.providerStatus === 'pending_payment') {
      return (
          <div className="max-w-xl mx-auto py-10 px-4">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden text-center">
                  <div className="bg-dahab-teal p-6 text-white">
                      <h1 className="text-2xl font-bold">Provider Subscription</h1>
                      <p className="opacity-90">Step 2 of 2: Activate your account</p>
                  </div>
                  <div className="p-8 space-y-6">
                      <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-center gap-3 text-left">
                          <CheckCircle className="shrink-0" />
                          <div>
                              <p className="font-bold">Profile Approved!</p>
                              <p className="text-sm">Your application has been reviewed. To start listing events and services, please pay the annual subscription fee.</p>
                          </div>
                      </div>

                      <div className="border-2 border-dahab-gold/30 bg-yellow-50 rounded-2xl p-6">
                          <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">Annual Subscription</p>
                          <h2 className="text-4xl font-bold text-gray-900 mb-1">500 EGP</h2>
                          <p className="text-sm text-gray-500">/ Year</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
                          <h3 className="font-bold text-gray-900">How to pay:</h3>
                          <div className="flex items-center gap-3">
                              <Smartphone className="text-red-500" />
                              <div>
                                  <p className="font-bold text-sm">Vodafone Cash</p>
                                  <p className="font-mono text-gray-600">010 1234 5678</p>
                              </div>
                          </div>
                          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                             Transfer the amount and upload the screenshot below.
                          </div>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition relative">
                           <input 
                             type="file" 
                             accept="image/*"
                             onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           />
                           <div className="flex flex-col items-center gap-2 pointer-events-none">
                              <Upload className="text-gray-400" size={32} />
                              <span className="font-medium text-gray-600">{paymentFile ? paymentFile.name : "Upload Receipt"}</span>
                           </div>
                      </div>

                      <button 
                        onClick={handlePaymentSubmit}
                        disabled={!paymentFile || isSubmittingPayment}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 flex justify-center"
                      >
                         {isSubmittingPayment ? <Loader2 className="animate-spin" /> : "Submit Payment for Verification"}
                      </button>

                       <button onClick={onLogout} className="text-red-500 text-sm font-bold hover:underline">
                           Logout
                       </button>
                  </div>
              </div>
          </div>
      )
  }

  // Payment Review State
  if (user.providerStatus === 'payment_review') {
      return (
          <div className="max-w-lg mx-auto py-20 px-4 text-center">
               <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Clock size={40} className="text-blue-600" />
               </div>
               <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Under Review</h1>
               <p className="text-gray-500 mb-8">
                   We have received your receipt. The admin will verify the transaction and activate your account shortly.
               </p>
               <button onClick={onLogout} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-bold">
                   Logout & Check Later
               </button>
          </div>
      )
  }

  // Active Dashboard (Approved)
  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
           <div>
              <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
              <p className="text-gray-500">Manage your events and view your stats.</p>
           </div>
           <button onClick={onLogout} className="md:hidden p-2 text-red-500 bg-red-50 rounded-full">
             <LogOut size={20} />
           </button>
        </div>
        
        <button 
          onClick={() => handleOpenEventModal()}
          className="bg-dahab-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg hover:shadow-dahab-teal/50 transition w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Create Event
        </button>
      </div>

      {/* Account Status Banner */}
      {user.providerStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="text-yellow-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-800">Account Pending Verification</h3>
            <p className="text-sm text-yellow-700">Your provider account is currently under review by the admin. Check back soon for subscription details.</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Calendar size={20} /></div>
             <span className="text-xs font-bold text-gray-400 uppercase">Events</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900">{myEvents.length}</h3>
           <p className="text-xs text-gray-500 mt-1">Total Created</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><BarChart3 size={20} /></div>
             <span className="text-xs font-bold text-gray-400 uppercase">Views</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900">1.2k</h3>
           <p className="text-xs text-gray-500 mt-1">This Month</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign size={20} /></div>
             <span className="text-xs font-bold text-gray-400 uppercase">Bookings</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900">{bookings.length}</h3>
           <p className="text-xs text-gray-500 mt-1">Confirmed</p>
        </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Users size={20} /></div>
             <span className="text-xs font-bold text-gray-400 uppercase">Rating</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900">4.9</h3>
           <p className="text-xs text-gray-500 mt-1">Average</p>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg">My Events</h2>
        </div>
        
        {myEvents.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Calendar className="mx-auto mb-3 text-gray-300" size={40} />
            <p>You haven't created any events yet.</p>
            <button onClick={() => handleOpenEventModal()} className="text-dahab-teal font-bold hover:underline mt-2">Create your first event</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={event.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <div className="font-bold text-gray-900">{event.title}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {event.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="font-medium">{event.date}</div>
                      <div className="text-xs">{event.time}</div>
                    </td>
                    <td className="p-4">
                      {event.status === 'approved' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} /> Live</span>}
                      {event.status === 'pending' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700"><Clock size={12} /> Pending Approval</span>}
                      {event.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={12} /> Rejected</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                         <button 
                          onClick={() => handleOpenEventModal(event)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition" title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EventFormModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleEventSubmit}
        initialData={editingEvent}
      />
    </div>
  );
};

export default ProviderDashboard;

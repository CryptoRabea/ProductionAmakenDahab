import React, { useEffect, useState, useRef } from 'react';
import { db } from '../services/database';
import { Booking, BookingStatus, Event, User, UserRole, TransactionRecord } from '../types';
import { Check, X, Plus, Image as ImageIcon, Trash2, Upload, Palette, Settings, UserCheck, ShieldAlert, Edit2, Calendar, Clock, AlertCircle, Star, LogOut, DollarSign, ExternalLink, FileDown, History, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import EventFormModal from '../components/EventFormModal';

const PRESET_BACKGROUNDS = [
  { name: 'Dahab Mesh', value: 'radial-gradient(at 0% 0%, hsla(172, 85%, 93%, 1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(45, 90%, 96%, 1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(200, 85%, 95%, 1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(180, 80%, 94%, 1) 0px, transparent 50%)' },
  { name: 'Clean White', value: '#ffffff' },
  { name: 'Soft Gray', value: '#f3f4f6' },
  { name: 'Deep Ocean', value: 'linear-gradient(to bottom, #0f172a, #1e293b)' },
  { name: 'Sunset Glow', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' }
];

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingProviders, setPendingProviders] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'events' | 'pending-events' | 'verifications' | 'settings' | 'history'>('bookings');

  // Event Management State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Transaction History State
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Settings Hook
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Update local settings when global settings change (initial load)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const loadData = async () => {
    const b = await db.getBookings();
    setBookings(b);
    const p = await db.getPendingProviders();
    setPendingProviders(p);
    const e = await db.getEvents();
    setEvents(e);
  };

  const handleBookingAction = async (id: string, status: BookingStatus) => {
    await db.updateBookingStatus(id, status);
    await loadData();
  };

  // Stage 1 Approval (Request Payment) or Stage 2 (Final)
  const handleProviderAction = async (user: User, approve: boolean) => {
    if (!approve) {
      await db.rejectProvider(user.id);
    } else {
        if (user.providerStatus === 'pending') {
            // Stage 1: Approve profile -> Request Payment
            await db.requestProviderPayment(user.id);
        } else if (user.providerStatus === 'payment_review') {
            // Stage 2: Final Verification -> Active
            await db.approveProvider(user.id);
        }
    }
    await loadData();
  };

  // --- Event Handlers ---
  const handleOpenEventModal = (event?: Event) => {
    setEditingEvent(event || null);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    if (editingEvent) {
      // Edit existing
      await db.updateEvent({ ...editingEvent, ...eventData } as Event);
    } else {
      // Create new
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
        organizerId: 'admin1',
        status: 'approved', // Admins always approve their own
        isFeatured: eventData.isFeatured || false
      } as Event);
    }
    setEditingEvent(null);
    setIsEventModalOpen(false);
    await loadData();
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    if (window.confirm("Are you sure you want to delete this event?")) {
      // Optimistic update for immediate UI feedback
      setEvents(prev => prev.filter(ev => ev.id !== id));
      
      try {
        await db.deleteEvent(id);
      } catch (error) {
        console.error("Failed to delete event", error);
        await loadData();
      }
    }
  };

  const handleApproveEvent = async (event: Event) => {
    await db.updateEvent({ ...event, status: 'approved' });
    await loadData();
  };

  const handleRejectEvent = async (event: Event) => {
    await db.updateEvent({ ...event, status: 'rejected' });
    await loadData();
  };

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
    alert("Settings saved successfully!");
  };

  // --- Transaction History ---
  const loadTransactionHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const txs = await db.getTransactionsByMonth(selectedMonth, selectedYear);
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleExportXML = async () => {
    setIsExporting(true);
    try {
      const txs = await db.getTransactionsByMonth(selectedMonth, selectedYear);
      const xml = db.exportTransactionsToXML(txs);
      const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
      const filename = `transactions_${monthName}_${selectedYear}.xml`;
      db.downloadXML(xml, filename);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Failed to export transactions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllXML = async () => {
    setIsExporting(true);
    try {
      const txs = await db.getAllTransactions();
      const xml = db.exportTransactionsToXML(txs);
      const filename = `all_transactions_${new Date().toISOString().split('T')[0]}.xml`;
      db.downloadXML(xml, filename);
    } catch (error) {
      console.error('Error exporting all transactions:', error);
      alert('Failed to export transactions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Load history when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'history') {
      loadTransactionHistory();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const pendingEvents = events.filter(e => e.status === 'pending');

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 w-full justify-between md:justify-start">
           <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
           <button onClick={onLogout} className="md:hidden p-2 text-red-500 bg-red-50 rounded-full">
             <LogOut size={20} />
           </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'bookings' ? 'bg-dahab-teal text-white' : 'bg-white text-gray-700'}`}
          >
            Bookings ({bookings.filter(b => b.status === BookingStatus.PENDING).length})
          </button>
           <button 
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'verifications' ? 'bg-dahab-teal text-white' : 'bg-white text-gray-700'}`}
          >
            Verifications
            {pendingProviders.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{pendingProviders.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('pending-events')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'pending-events' ? 'bg-dahab-teal text-white' : 'bg-white text-gray-700'}`}
          >
            Event Approvals
             {pendingEvents.length > 0 && <span className="bg-orange-500 text-white text-xs px-1.5 rounded-full">{pendingEvents.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'events' ? 'bg-dahab-teal text-white' : 'bg-white text-gray-700'}`}
          >
            All Events
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'settings' ? 'bg-dahab-teal text-white' : 'bg-white text-gray-700'}`}
          >
            <Settings size={18} /> Settings
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'history' ? 'bg-dahab-teal text-white' : 'bg-white text-gray-700'}`}
          >
            <History size={18} /> History
          </button>
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Item</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Proof</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">No bookings found</td></tr>
                )}
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 text-gray-900">
                    <td className="p-4 font-medium">{booking.userName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${booking.itemType === 'event' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {booking.itemType.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">{booking.amount} EGP <br/><span className="text-xs text-gray-400">{booking.method}</span></td>
                    <td className="p-4 text-blue-600 text-sm underline cursor-pointer">View Receipt</td>
                    <td className="p-4 flex justify-end gap-2">
                      {booking.status === BookingStatus.PENDING ? (
                        <>
                          <button onClick={() => handleBookingAction(booking.id, BookingStatus.CONFIRMED)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                            <Check size={18} />
                          </button>
                          <button onClick={() => handleBookingAction(booking.id, BookingStatus.REJECTED)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <span className={`text-sm font-bold ${booking.status === BookingStatus.CONFIRMED ? 'text-green-600' : 'text-red-600'}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <UserCheck className="text-dahab-teal" />
            <h3 className="font-bold text-gray-900">Provider Approvals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Proof</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingProviders.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">No pending verifications</td></tr>
                )}
                {pendingProviders.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 text-gray-900">
                    <td className="p-4 font-bold">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      {user.providerStatus === 'pending' && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold flex items-center w-fit gap-1">
                            <ShieldAlert size={12} /> New Request
                          </span>
                      )}
                      {user.providerStatus === 'payment_review' && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold flex items-center w-fit gap-1">
                            <DollarSign size={12} /> Payment Review
                          </span>
                      )}
                    </td>
                    <td className="p-4">
                         {user.subscriptionReceipt ? (
                             <a href={user.subscriptionReceipt} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 text-sm underline">
                                 <ExternalLink size={14} /> Receipt
                             </a>
                         ) : (
                             <span className="text-gray-400 text-xs">-</span>
                         )}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleProviderAction(user, true)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-1"
                      >
                        <Check size={14} /> 
                        {user.providerStatus === 'pending' ? 'Request Payment' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleProviderAction(user, false)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 flex items-center gap-1"
                      >
                        <X size={14} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pending-events' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
             <AlertCircle className="text-orange-500" />
             <h3 className="font-bold text-gray-900">Pending Event Approvals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">Event</th>
                  <th className="p-4">Organizer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingEvents.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">No pending events</td></tr>
                )}
                {pendingEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 text-gray-900">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={event.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <span className="font-bold text-gray-900 block">{event.title}</span>
                          <span className="text-xs text-gray-500 line-clamp-1">{event.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{event.organizerId}</td>
                    <td className="p-4 text-sm text-gray-600">{event.date} at {event.time}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEventModal(event)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center gap-1"
                      >
                        <Edit2 size={14} /> View/Edit
                      </button>
                      <button 
                        onClick={() => handleApproveEvent(event)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-1"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => handleRejectEvent(event)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 flex items-center gap-1"
                      >
                        <X size={14} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Calendar className="text-dahab-teal" />
               <h3 className="font-bold text-gray-900">All Events</h3>
             </div>
             <button 
               onClick={() => handleOpenEventModal()}
               className="bg-dahab-teal text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2"
             >
               <Plus size={18} /> New Event
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">Event</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 text-gray-900">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={event.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{event.title}</span>
                              {event.isFeatured && <Star size={12} className="text-dahab-gold" fill="currentColor" />}
                           </div>
                           {event.isFeatured && <span className="text-[10px] text-dahab-gold font-bold uppercase tracking-wider">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{event.date}</td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          event.status === 'approved' ? 'bg-green-100 text-green-700' :
                          event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                       }`}>
                         {event.status || 'approved'}
                       </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEventModal(event)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteEvent(event.id, e)}
                        className="p-1.5 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 hover:text-red-500 transition-colors" title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Settings content */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <ImageIcon size={20} className="text-dahab-teal" /> App Branding
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">App Name</label>
                <input 
                  type="text" 
                  value={localSettings.appName}
                  onChange={(e) => setLocalSettings(prev => ({...prev, appName: e.target.value}))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Logo</label>
                <div className="flex items-center gap-4">
                  {localSettings.logoUrl ? (
                    <div className="w-16 h-16 border rounded-lg p-1 bg-white">
                      <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No Logo</div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      <Upload size={16} /> Upload New Logo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <Palette size={20} className="text-dahab-teal" /> Appearance
            </h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Background Style</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {PRESET_BACKGROUNDS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setLocalSettings(prev => ({...prev, backgroundStyle: preset.value}))}
                    className={`p-2 text-xs font-bold rounded-lg border-2 transition ${localSettings.backgroundStyle === preset.value ? 'border-dahab-teal bg-teal-50 text-dahab-teal' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <textarea 
                value={localSettings.backgroundStyle}
                onChange={(e) => setLocalSettings(prev => ({...prev, backgroundStyle: e.target.value}))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm font-mono h-20 bg-white text-gray-900"
                placeholder="CSS background property..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveSettings}
              className="bg-dahab-teal text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg transition transform hover:scale-105"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Export Controls */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <FileDown size={20} className="text-dahab-teal" /> Export Transaction History
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Export all booking requests and payment receipts as XML for record-keeping and accounting purposes.
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((month, idx) => (
                    <option key={idx + 1} value={idx + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-white text-gray-900"
                >
                  {[2024, 2025, 2026, 2027].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleExportXML}
                disabled={isExporting}
                className="bg-dahab-teal text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
                Export Monthly XML
              </button>
              <button
                onClick={handleExportAllXML}
                disabled={isExporting}
                className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
                Export All
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="text-dahab-teal" />
                <h3 className="font-bold text-gray-900">
                  Transactions - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
                </h3>
              </div>
              <span className="text-sm text-gray-500">{transactions.length} records</span>
            </div>

            {isLoadingHistory ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin mx-auto text-dahab-teal" size={32} />
                <p className="text-gray-500 mt-2">Loading transactions...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Item</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-400">No transactions found for this period</td></tr>
                    )}
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 text-gray-900">
                        <td className="p-4 text-sm">
                          {new Date(tx.timestamp).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            tx.type === 'booking_request' ? 'bg-purple-100 text-purple-700' :
                            tx.type === 'payment_receipt' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {tx.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{tx.userName}</span>
                          {tx.userEmail && <br />}
                          {tx.userEmail && <span className="text-xs text-gray-400">{tx.userEmail}</span>}
                        </td>
                        <td className="p-4 text-sm">
                          {tx.itemName || tx.itemId || '-'}
                          {tx.itemType && (
                            <span className="ml-2 text-xs text-gray-400">({tx.itemType})</span>
                          )}
                        </td>
                        <td className="p-4 font-bold">{tx.amount} EGP</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            tx.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            tx.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Modal - Pass Admin Role */}
      <EventFormModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleEventSubmit}
        initialData={editingEvent}
        userRole={UserRole.ADMIN} 
      />
    </div>
  );
};

export default AdminDashboard;

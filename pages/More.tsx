import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Heart, Mountain, Utensils, Home as HomeIcon, MoreHorizontal, ArrowRight } from 'lucide-react';

const More: React.FC = () => {
  const activityCategories = [
    { title: 'Diving', icon: <Anchor size={24} />, link: '/events?category=Diving', description: 'Explore the Red Sea depths', color: 'bg-blue-100 text-blue-600' },
    { title: 'Wellness', icon: <Heart size={24} />, link: '/events?category=Wellness', description: 'Yoga, meditation & spas', color: 'bg-rose-100 text-rose-600' },
    { title: 'Hiking', icon: <Mountain size={24} />, link: '/events?category=Hike', description: 'Canyons & mountain trails', color: 'bg-orange-100 text-orange-600' },
  ];

  const guideCategories = [
    { title: 'Accommodation', icon: <HomeIcon size={24} />, link: '#', description: 'Hotels, camps & apartments', color: 'bg-purple-100 text-purple-600', comingSoon: true },
    { title: 'Food & Dining', icon: <Utensils size={24} />, link: '#', description: 'Best restaurants in town', color: 'bg-green-100 text-green-600', comingSoon: true },
    { title: 'Misc Services', icon: <MoreHorizontal size={24} />, link: '#', description: 'Laundry, Sim cards & more', color: 'bg-gray-100 text-gray-600', comingSoon: true },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-dahab-teal text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
         <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Explore More</h1>
          <p className="opacity-90">Find specialized activities, local guides, and everything else Dahab offers.</p>
         </div>
         <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Activities & Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activityCategories.map((cat) => (
            <Link 
              key={cat.title} 
              to={cat.link}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4 group"
            >
              <div className={`p-4 rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{cat.title}</h3>
                <p className="text-xs text-gray-500">{cat.description}</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-dahab-teal" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dahab Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guideCategories.map((cat) => (
            <div 
              key={cat.title} 
              className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden ${cat.comingSoon ? 'opacity-75' : 'hover:shadow-md cursor-pointer'}`}
            >
              <div className={`p-4 rounded-xl ${cat.color}`}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{cat.title}</h3>
                <p className="text-xs text-gray-500">{cat.description}</p>
              </div>
              {cat.comingSoon && (
                <span className="absolute top-2 right-2 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  COMING SOON
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default More;
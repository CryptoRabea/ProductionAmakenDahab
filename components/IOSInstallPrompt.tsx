import React, { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';

const IOSInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    
    // Detect if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    // Only show if on iOS and NOT already installed
    if (isIos && !isStandalone) {
      // Delay showing the prompt so it doesn't block immediate interaction
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] animate-in slide-in-from-bottom duration-700">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-gray-200 relative max-w-md mx-auto">
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        
        <div className="flex gap-4 items-start">
           <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
             📲
           </div>
           <div className="flex-1">
             <h3 className="font-bold text-gray-900 mb-1">Install App</h3>
             <p className="text-sm text-gray-600 mb-3">
               Install AmakenDahab on your iPhone for the best experience.
             </p>
             <div className="text-sm flex flex-col gap-2 text-gray-800">
               <div className="flex items-center gap-2">
                 1. Tap the <Share size={16} className="text-blue-500" /> <span className="font-bold">Share</span> button
               </div>
               <div className="flex items-center gap-2">
                 2. Scroll down and tap <span className="font-bold bg-gray-100 px-2 py-0.5 rounded border">Add to Home Screen</span>
               </div>
             </div>
           </div>
        </div>
        
        {/* Pointer arrow pointing down towards Safari toolbar */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-b border-r border-gray-200"></div>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;
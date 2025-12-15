import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Edit2, Image as ImageIcon, Check, X } from 'lucide-react';

interface EditableProps {
  id: string; // Unique key for this content
  defaultContent: string;
  type?: 'text' | 'image' | 'rich-text';
  className?: string;
  children?: React.ReactNode; // For image wrappers or complex layouts
}

const Editable: React.FC<EditableProps> = ({ id, defaultContent, type = 'text', className = '', children }) => {
  const { isEditing, settings, updateContent } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempValue, setTempValue] = useState('');

  // Get current value from overrides or default
  const currentValue = settings.contentOverrides?.[id] || defaultContent;

  if (!isEditing) {
    if (type === 'image') {
      // If image, we assume children is an <img> tag or div that needs the source
      // But simpler: just render children, but children usually need the src.
      // Strategy: If children exists, we assume parent passes correct src. 
      // BUT we need to inject the overridden src.
      // Easier strategy: This component renders the <img> if type is image
      return <img src={currentValue} className={className} alt="content" />;
    }
    return <span className={className}>{currentValue}</span>;
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTempValue(currentValue);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    await updateContent(id, tempValue);
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        onClick={handleEditClick}
        className={`relative group cursor-pointer border-2 border-dashed border-dahab-teal/50 hover:border-dahab-teal hover:bg-dahab-teal/5 rounded transition-all ${className} ${type === 'image' ? 'inline-block' : ''}`}
        title="Click to edit"
      >
        {type === 'image' ? (
           <img src={currentValue} className={`w-full h-full object-cover opacity-80 ${className}`} alt="editable" />
        ) : (
           <span>{currentValue}</span>
        )}
        
        {/* Edit Icon Overlay */}
        <div className="absolute -top-3 -right-3 bg-dahab-teal text-white p-1.5 rounded-full shadow-lg z-10 scale-0 group-hover:scale-100 transition-transform">
          {type === 'image' ? <ImageIcon size={12} /> : <Edit2 size={12} />}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
             <h3 className="font-bold text-lg mb-4 text-gray-900">Edit {type === 'image' ? 'Image URL' : 'Text'}</h3>
             
             {type === 'text' ? (
               <textarea 
                 value={tempValue}
                 onChange={(e) => setTempValue(e.target.value)}
                 className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-dahab-teal/50 outline-none text-gray-900"
               />
             ) : (
               <div className="space-y-3">
                 <input 
                   type="text" 
                   value={tempValue}
                   onChange={(e) => setTempValue(e.target.value)}
                   className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-dahab-teal/50 outline-none text-gray-900"
                   placeholder="Enter Image URL..."
                 />
                 <div className="h-40 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                    {tempValue ? <img src={tempValue} className="h-full w-full object-contain" /> : <span className="text-gray-400">Preview</span>}
                 </div>
               </div>
             )}

             <div className="flex gap-3 mt-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
               <button onClick={handleSave} className="flex-1 py-2 rounded-xl bg-dahab-teal text-white font-bold hover:bg-teal-700">Save</button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Editable;

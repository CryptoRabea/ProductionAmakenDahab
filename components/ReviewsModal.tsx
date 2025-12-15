import React, { useState, useEffect } from 'react';
import { X, Star, Send, Loader2, User as UserIcon } from 'lucide-react';
import { Review, User } from '../types';
import { db } from '../services/mockDatabase';

interface ReviewsModalProps {
  itemId: string | null;
  itemTitle: string;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({ itemId, itemTitle, isOpen, onClose, user }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // New Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen && itemId) {
      setLoading(true);
      db.getReviews(itemId).then((data) => {
        setReviews(data);
        setLoading(false);
      });
      // Reset form
      setRating(5);
      setComment('');
    }
  }, [isOpen, itemId]);

  if (!isOpen || !itemId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setSubmitLoading(true);
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      itemId,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      timestamp: new Date().toISOString()
    };

    await db.addReview(newReview);
    
    // Refresh list
    const updatedReviews = await db.getReviews(itemId);
    setReviews(updatedReviews);
    
    setComment('');
    setRating(5);
    setSubmitLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Reviews</h3>
            <p className="text-sm text-gray-500">{itemTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
             <div className="text-center py-10 text-gray-500">
               <Loader2 className="animate-spin mx-auto mb-2" />
               Loading reviews...
             </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Star className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-gray-500">No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-dahab-teal/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-dahab-teal text-sm">{review.userName.charAt(0)}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-gray-900">{review.userName}</span>
                    <span className="text-xs text-gray-400">{new Date(review.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-yellow-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Review Form */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">Write a review</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-yellow-400 hover:scale-110 transition"
                    >
                      <Star size={20} fill={star <= rating ? "currentColor" : "none"} className={star <= rating ? "" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/50 text-sm resize-none h-24"
                  required
                />
                <button 
                  type="submit" 
                  disabled={submitLoading || !comment.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-dahab-teal text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition"
                >
                  {submitLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Login to leave a review</p>
              <button onClick={onClose} className="text-dahab-teal text-sm font-bold hover:underline">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
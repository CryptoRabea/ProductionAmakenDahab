import React, { useState, useEffect, useRef } from 'react';
import { User, Post, UserRole, Comment } from '../types';
import { db } from '../services/mockDatabase';
import { 
  Image, Video, Heart, MessageCircle, Share2, 
  Send, MoreHorizontal, ShieldCheck, Car, User as UserIcon, Loader2, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SocialHubProps {
  user: User | null;
}

const SocialHub: React.FC<SocialHubProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Post State
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Posts
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await db.getPosts();
    setPosts(data);
    setLoading(false);
  };

  // Image Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Post
  const handlePostSubmit = async () => {
    if (!user) return;
    if (!postContent.trim() && !selectedImage) return;

    setIsPosting(true);
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      content: postContent,
      imageUrl: selectedImage || undefined,
      likes: [],
      comments: [],
      timestamp: new Date().toISOString()
    };

    await db.createPost(newPost);
    await loadPosts();
    
    // Reset Form
    setPostContent('');
    setSelectedImage(null);
    setIsPosting(false);
  };

  // Actions
  const handleLike = async (postId: string) => {
    if (!user) return alert("Please login to like posts");
    // Optimistic UI update
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(user.id);
        return {
          ...p,
          likes: hasLiked ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id]
        };
      }
      return p;
    }));
    await db.toggleLikePost(postId, user.id);
  };

  const handleShare = () => {
    alert("Link copied to clipboard! (Simulated)");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-dahab-teal to-blue-500 rounded-2xl p-6 text-white text-center shadow-lg">
        <h1 className="text-2xl font-bold">Community Hub</h1>
        <p className="opacity-90">Connect with travelers, locals, and service providers.</p>
      </div>

      {/* Create Post Widget - Force Text Color */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-gray-900">
        {user ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <UserIcon className="text-gray-400" />
              </div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={`What's happening in Dahab, ${user.name.split(' ')[0]}?`}
                className="flex-1 bg-gray-50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-dahab-teal/20 resize-none h-24 text-gray-900"
              />
            </div>

            {selectedImage && (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 max-h-60">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-gray-500 hover:text-dahab-teal px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                  <Image size={20} />
                  <span className="text-sm font-medium hidden sm:inline">Photo</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-dahab-teal px-3 py-1.5 rounded-lg hover:bg-gray-50 transition" title="Video uploading coming soon">
                  <Video size={20} />
                  <span className="text-sm font-medium hidden sm:inline">Video</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageSelect}
                />
              </div>
              <button 
                onClick={handlePostSubmit}
                disabled={isPosting || (!postContent && !selectedImage)}
                className="bg-dahab-teal text-white px-6 py-2 rounded-full font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
              >
                {isPosting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Post
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3">Login to share your Dahab moments!</p>
            <Link to="/login" className="text-dahab-teal font-bold hover:underline">
              Sign In to Post
            </Link>
          </div>
        )}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              {/* Header Skeleton */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              {/* Content Skeleton */}
              <div className="px-4 pb-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              {/* Media Skeleton */}
              <div className="h-64 bg-gray-200 w-full" />
              {/* Footer Skeleton */}
              <div className="p-4 flex gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded-full" />
                <div className="h-8 w-16 bg-gray-200 rounded-full" />
                <div className="h-8 w-12 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              onLike={() => handleLike(post.id)}
              onShare={handleShare}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Post Card Sub-Component ---
const PostCard: React.FC<{
  post: Post; 
  currentUser: User | null; 
  onLike: () => void;
  onShare: () => void;
}> = ({ post, currentUser, onLike, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(post.comments);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const hasLiked = currentUser ? post.likes.includes(currentUser.id) : false;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentText.trim()) return;

    setIsSubmittingComment(true);
    const newComment: Comment = {
      id: Math.random().toString(36),
      authorId: currentUser.id,
      authorName: currentUser.name,
      content: commentText,
      timestamp: new Date().toISOString()
    };

    await db.addComment(post.id, newComment);
    setLocalComments([...localComments, newComment]);
    setCommentText('');
    setIsSubmittingComment(false);
  };

  const getRoleBadge = (role: UserRole, authorId: string) => {
    // Only show provider badge if explicitly set (we don't check verification status on old posts for now, 
    // but ideally we should propagate user status to posts or fetch user info)
    // For simplicity, we assume 'PROVIDER' role on a post author means they were approved at the time.
    
    switch (role) {
      case UserRole.ADMIN:
        return <span className="bg-dahab-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck size={10} /> ADMIN</span>;
      case UserRole.PROVIDER:
        return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Car size={10} /> PROVIDER</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500">
            {post.authorName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{post.authorName}</h3>
              {getRoleBadge(post.authorRole, post.authorId)}
            </div>
            <p className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {/* Post Media */}
      {post.imageUrl && (
        <div className="mt-2 bg-black/5 max-h-[500px] overflow-hidden flex items-center justify-center">
          <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex gap-1">
            <button 
              onClick={onLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition ${hasLiked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
              <span className="text-sm font-bold">{post.likes.length}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-50 transition"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-bold">{localComments.length}</span>
            </button>
            <button 
              onClick={onShare}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-50 transition"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <div className="space-y-4 mb-4">
              {localComments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {comment.authorName.charAt(0)}
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-gray-900">{comment.authorName}</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
              {localComments.length === 0 && <p className="text-center text-sm text-gray-400 italic">No comments yet.</p>}
            </div>

            {/* Comment Input */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="relative">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..." 
                  className="w-full bg-gray-100 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dahab-teal/30 text-gray-900"
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="absolute right-2 top-1.5 p-1.5 bg-dahab-teal text-white rounded-full hover:bg-teal-700 disabled:opacity-50 transition"
                >
                  <Send size={14} />
                </button>
              </form>
            ) : (
              <p className="text-center text-xs text-dahab-teal font-bold bg-teal-50 py-2 rounded-lg">Login to comment</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialHub;
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { MessageSquare, Heart, MessageCircle, Send, User, Clock, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Button } from "../Button";
import { Input } from "../Input";

export default function CommunityForum() {
  const { user } = useAuth();
  const currentUserRole = user?.role || "STUDENT";
  const currentUserName = user?.name || "Community Member";

  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem("pp_forum_posts");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(p => p.author !== "Alumni John" && p.author !== "Alumni Mike") : [];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [referralModalData, setReferralModalData] = useState(null);
  const [referralDetails, setReferralDetails] = useState({ role: "", link: "", message: "" });

  useEffect(() => {
    localStorage.setItem("pp_forum_posts", JSON.stringify(posts));
  }, [posts]);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post = {
      id: Date.now(),
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      author: currentUserName,
      role: currentUserRole,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    setPosts([post, ...posts]);
    setShowNewPostModal(false);
    setNewPost({ title: "", content: "", category: "General" });
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        // Simple toggle mock
        const isLiked = p.likedBy?.includes(currentUserName);
        const likedBy = p.likedBy || [];
        return {
          ...p,
          likes: isLiked ? p.likes - 1 : p.likes + 1,
          likedBy: isLiked ? likedBy.filter(n => n !== currentUserName) : [...likedBy, currentUserName]
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId) => {
    if (!commentText.trim()) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now(),
            author: currentUserName,
            role: currentUserRole,
            content: commentText,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return p;
    }));
    setCommentText("");
    setActiveCommentPostId(null);
  };

  const handleOfferReferral = (e) => {
    e.preventDefault();
    if (!referralDetails.role || !referralDetails.link) return;

    const notifs = JSON.parse(localStorage.getItem('student_notifications') || '[]');
    const newNotif = {
      id: Date.now(),
      message: `Private Referral for ${referralModalData.targetUser}: ${currentUserName} has offered you a referral for ${referralDetails.role}. Link: ${referralDetails.link}. ${referralDetails.message ? `Message: "${referralDetails.message}"` : ''}`,
      date: new Date().toLocaleDateString(),
      read: false
    };

    localStorage.setItem('student_notifications', JSON.stringify([newNotif, ...notifs]));
    window.dispatchEvent(new Event('notifications_updated'));
    
    setReferralModalData(null);
    setReferralDetails({ role: "", link: "", message: "" });
  };

  const timeAgo = (isoString) => {
    const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const categories = ["All", "General", "Interview Prep", "Job Referrals", "Events"];
  const filteredPosts = filterCategory === "All" ? posts : posts.filter(p => p.category === filterCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Community & Forum</h1>
          <p className="text-gray-500">Connect with alumni, ask questions, and share experiences.</p>
        </div>
        <Button onClick={() => setShowNewPostModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> New Discussion
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition-colors ${
              filterCategory === cat 
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No discussions found</h3>
            <p className="text-gray-500">Be the first to start a conversation in this category!</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {post.author}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          post.role === 'ALUMNI' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          post.role === 'RECRUITER' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {post.role}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {timeAgo(post.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {post.role === "STUDENT" && (currentUserRole === "ALUMNI" || currentUserRole === "RECRUITER") && (
                      <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => setReferralModalData({ targetUser: post.author })}>Offer Referral</Button>
                    )}
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">{post.category}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line leading-relaxed">{post.content}</p>

                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                  <button 
                    onClick={() => handleLike(post.id)} 
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${post.likedBy?.includes(currentUserName) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${post.likedBy?.includes(currentUserName) ? 'fill-current' : ''}`} /> {post.likes}
                  </button>
                  <button 
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> {post.comments.length} Comments
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentPostId === post.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2">
                    {post.comments.length > 0 ? (
                      <div className="space-y-4">
                        {post.comments.map(c => (
                          <div key={c.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-semibold text-sm text-gray-900">{c.author}</span>
                                {c.role && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    c.role === 'ALUMNI' ? 'bg-amber-100 text-amber-700' :
                                    c.role === 'RECRUITER' ? 'bg-purple-100 text-purple-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {c.role}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">{timeAgo(c.timestamp)}</span>
                                {c.role === "STUDENT" && (currentUserRole === "ALUMNI" || currentUserRole === "RECRUITER") && (
                                   <button onClick={() => setReferralModalData({ targetUser: c.author })} className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 hover:text-indigo-800 ml-2">Offer Referral</button>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">No comments yet. Start the conversation!</p>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Input 
                        placeholder="Add a comment..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="bg-gray-50 border-transparent focus:bg-white flex-1"
                      />
                      <Button onClick={() => handleAddComment(post.id)} className="bg-indigo-600 hover:bg-indigo-700 px-4">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Start a Discussion</h2>
              <button onClick={() => setShowNewPostModal(false)} className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="p-6 space-y-4 bg-gray-50/50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option>General</option>
                  <option>Interview Prep</option>
                  <option>Job Referrals</option>
                  <option>Events</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input 
                  required
                  placeholder="What's on your mind?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Provide some context..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white resize-none"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowNewPostModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Post Discussion</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Referral Modal */}
      {referralModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Offer Private Referral</h2>
              <button onClick={() => setReferralModalData(null)} className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleOfferReferral} className="p-6 space-y-4 bg-gray-50/50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Student</label>
                <div className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-100 text-gray-600 cursor-not-allowed">
                  {referralModalData.targetUser}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                <Input 
                  required
                  placeholder="e.g. Software Development Engineer"
                  value={referralDetails.role}
                  onChange={(e) => setReferralDetails({...referralDetails, role: e.target.value})}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Link / Career Portal URL</label>
                <Input 
                  required
                  type="url"
                  placeholder="https://..."
                  value={referralDetails.link}
                  onChange={(e) => setReferralDetails({...referralDetails, link: e.target.value})}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message (Optional)</label>
                <textarea 
                  rows="3"
                  placeholder="Say something nice..."
                  value={referralDetails.message}
                  onChange={(e) => setReferralDetails({...referralDetails, message: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white resize-none"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setReferralModalData(null)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Send Referral</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

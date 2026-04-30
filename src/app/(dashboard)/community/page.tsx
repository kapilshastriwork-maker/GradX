"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Heart, MessageCircle, Bookmark, Send, Search, Plus,
  Sparkles, Flag, Book, DollarSign, GraduationCap, Home, Award, Briefcase, MessageSquare
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

const categories = [
  { name: "Admissions", color: "bg-blue-100 text-blue-700" },
  { name: "Visa", color: "bg-amber-100 text-amber-700" },
  { name: "Finance", color: "bg-emerald-100 text-emerald-700" },
  { name: "SOP", color: "bg-purple-100 text-purple-700" },
  { name: "Accommodation", color: "bg-orange-100 text-orange-700" },
  { name: "Scholarships", color: "bg-pink-100 text-pink-700" },
  { name: "Career", color: "bg-cyan-100 text-cyan-700" },
  { name: "General", color: "bg-gray-100 text-gray-700" },
];

const countryFlags: Record<string, string> = {
  USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦", Germany: "🇩🇪",
  Australia: "🇦🇺", Singapore: "🇸🇬", Ireland: "🇮🇪", Netherlands: "🇳🇱"
};

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    category: "Admissions",
    title: "",
    content: "",
    country: "",
    field: ""
  });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
        if (data) {
          setNewPost(prev => ({
            ...prev,
            country: data.target_country || "",
            field: data.field_of_study || ""
          }));
        }
      }
      fetchPosts();
    };
    fetchData();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const getDaysAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days} days ago`;
  };

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      await supabase
        .from("community_posts")
        .update({ likes: (post.likes || 0) + 1 })
        .eq("id", postId);
      fetchPosts();
    }
  };

  const fetchReplies = async (postId: string) => {
    const { data } = await supabase
      .from("post_replies")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setReplies(data || []);
  };

  const handleExpand = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      await fetchReplies(postId);
    }
  };

  const handleReply = async (postId: string) => {
    if (!replyText.trim()) return;
    
    const { error } = await supabase.from("post_replies").insert({
      post_id: postId,
      user_id: user?.id,
      author_name: profile?.full_name || user?.email?.split("@")[0],
      author_initials: profile?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U",
      content: replyText,
    });

    if (!error) {
      setReplyText("");
      await fetchReplies(postId);
    }
  };

  const handleNewPost = async () => {
    if (!newPost.title || !newPost.content) {
      toast.error("Title and content are required");
      return;
    }
    setPosting(true);

    const initials = profile?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

    const { data: postData, error } = await supabase.from("community_posts").insert({
      user_id: user?.id,
      author_name: profile?.full_name || user?.email?.split("@")[0],
      author_initials: initials,
      category: newPost.category,
      title: newPost.title,
      content: newPost.content,
      country: newPost.country,
      field: newPost.field,
    }).select().single();

    if (error) {
      toast.error("Failed to create post");
    } else {
      try {
        const res = await fetch("/api/community-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postTitle: newPost.title,
            postContent: newPost.content,
            category: newPost.category
          })
        });
        const { answer } = await res.json();
        
        await supabase.from("community_posts").update({
          is_shikha_answered: true,
          shikha_answer: answer
        }).eq("id", postData.id);
        
        toast.success("Post shared! Shikha has already responded ✨");
        earnBadge('community_post');
      } catch (e) {
        toast.success("Post shared!");
      }
      fetchPosts();
    }
    setPosting(false);
    setNewPostOpen(false);
    setNewPost({ category: "Admissions", title: "", content: "", country: newPost.country, field: newPost.field });
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const postsThisWeek = posts.filter(p => 
    new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const mostLiked = posts.reduce((max, p) => (p.likes || 0) > (max?.likes || 0) ? p : max, posts[0]);
  const shikhaAnswered = posts.filter(p => p.is_shikha_answered).length;

  const topContributors = [
    { name: "Ananya K.", posts: 23, initials: "AK" },
    { name: "Arjun M.", posts: 18, initials: "AM" },
    { name: "Priya S.", posts: 15, initials: "PS" },
    { name: "Rahul N.", posts: 12, initials: "RN" },
    { name: "Sneha P.", posts: 9, initials: "SP" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peer Community</h1>
          <p className="text-gray-500">Learn from students who've been through it</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">👥 2,847 members</span>
          <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
            <button 
              onClick={() => setNewPostOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Share Your Experience
            </button>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Category</Label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="e.g., Got into MIT — my full journey"
                    maxLength={150}
                  />
                </div>
                <div>
                  <Label>Content *</Label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your experience, tips, or questions..."
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">{newPost.content.length} chars</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Country (optional)</Label>
                    <select
                      value={newPost.country}
                      onChange={(e) => setNewPost({ ...newPost, country: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select...</option>
                      {Object.keys(countryFlags).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Field (optional)</Label>
                    <Input
                      value={newPost.field}
                      onChange={(e) => setNewPost({ ...newPost, field: e.target.value })}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
                <Button onClick={handleNewPost} disabled={posting} className="bg-purple-600">
                  {posting ? "Posting..." : "Share Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm">
          📝 Posts This Week: <span className="font-semibold">{postsThisWeek}</span>
        </div>
        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm">
          ❤️ Most Liked: <span className="font-semibold truncate max-w-[200px]">{mostLiked?.title?.slice(0, 30)}</span>
        </div>
        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm">
          🤖 Shikha Answered: <span className="font-semibold">{shikhaAnswered}</span>
        </div>
        <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm">
          🌍 Countries: <span className="font-semibold">8</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {["All", ...categories.map(c => c.name)].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === cat ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="pl-10"
            />
          </div>

          {/* Posts */}
          {filteredPosts.map(post => (
            <Card key={post.id} className={expandedPost === post.id ? "border-purple-500" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-semibold text-purple-600">{post.author_initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{post.author_name}</span>
                      <span className="text-gray-500 text-sm">• {getDaysAgo(post.created_at)}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        categories.find(c => c.name === post.category)?.color || "bg-gray-100"
                      }`}>
                        {post.category}
                      </span>
                      {post.country && <span>{countryFlags[post.country]}</span>}
                    </div>
                    <h3 
                      className="font-semibold mt-1 cursor-pointer hover:text-purple-600"
                      onClick={() => handleExpand(post.id)}
                    >
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-3">
                      {expandedPost === post.id ? post.content : post.content.slice(0, 200) + (post.content.length > 200 ? "..." : "")}
                      {expandedPost === post.id && post.content.length < 200 && ""}
                    </p>
                    {!expandedPost && post.content.length > 200 && (
                      <button 
                        onClick={() => handleExpand(post.id)}
                        className="text-purple-600 text-sm hover:underline"
                      >
                        Read more
                      </button>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" /> {post.likes || 0}
                      </button>
                      <button 
                        onClick={() => handleExpand(post.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-purple-600"
                      >
                        <MessageCircle className="w-4 h-4" /> Reply
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 hover:text-purple-600">
                        <Bookmark className="w-4 h-4" /> Save
                      </button>
                    </div>

                    {/* Shikha Answer */}
                    {post.is_shikha_answered && post.shikha_answer && expandedPost === post.id && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-semibold">✨ Shikha Answered</span>
                        </div>
                        <p className="text-purple-100 text-sm">{post.shikha_answer}</p>
                      </div>
                    )}

                    {/* Replies */}
                    {expandedPost === post.id && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-sm mb-3">Replies</h4>
                        {replies.length === 0 ? (
                          <p className="text-gray-500 text-sm">No replies yet</p>
                        ) : (
                          <div className="space-y-3">
                            {replies.map(reply => (
                              <div key={reply.id} className={`flex gap-2 ${reply.is_shikha ? "bg-purple-50 p-2 rounded" : ""}`}>
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                  <span className="text-xs font-semibold">{reply.author_initials}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-sm">{reply.author_name}</span>
                                  <p className="text-gray-600 text-sm">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="min-h-[60px]"
                          />
                          <Button onClick={() => handleReply(post.id)} className="bg-purple-600 shrink-0">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">🔥 Trending Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3).map(post => (
                  <div key={post.id} className="text-sm">
                    <p className="font-medium line-clamp-1">{post.title}</p>
                    <p className="text-gray-500">❤️ {post.likes || 0} likes</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">👤 Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topContributors.map((person, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold">{person.initials}</span>
                      </div>
                      <span className="text-sm">{person.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{person.posts} posts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">📌 Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Be respectful and supportive</li>
                <li>• Share real experiences, not rumors</li>
                <li>• No spam or promotional content</li>
                <li>• Shikha monitors daily</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
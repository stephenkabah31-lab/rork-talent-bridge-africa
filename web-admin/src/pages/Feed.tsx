import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Users,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import type { Post } from "@/lib/trpc-types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRecruiterOrCompany = user?.type === "recruiter" || user?.type === "company";
  const isAdmin = user?.isAdmin === true;

  // tRPC queries
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["posts", "feed"],
    queryFn: async () => {
      const result = await trpc.posts.getFeed.query({ limit: 20 });
      return result.posts;
    },
    staleTime: 30000,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => trpc.jobs.getAll.query({}),
    staleTime: 30000,
  });



  // Redirect admin to dashboard
  if (isAdmin) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  // ── Recruiter/Company Dashboard ────────────────────────────
  if (isRecruiterOrCompany) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <Button
              onClick={() => navigate("/post-job")}
              className="rounded-full bg-[#D97706] hover:bg-[#9A3412] gap-2"
            >
              <Plus className="w-4 h-4" /> Post a Job
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Briefcase, label: "Active Jobs", value: jobs.filter(j => j.status === "active").length, color: "text-[#D97706]", bg: "bg-amber-50" },
              { icon: Clock, label: "Pending", value: 0, color: "text-amber-600", bg: "bg-amber-50" },
              { icon: FileText, label: "Reviewing", value: 0, color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: CheckCircle, label: "Shortlisted", value: 0, color: "text-violet-600", bg: "bg-violet-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Jobs list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posted Jobs</h2>
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No jobs posted yet</p>
                <Button onClick={() => navigate("/post-job")} variant="link" className="text-[#D97706] mt-2">
                  Post your first job
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.location} · {job.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#D97706]">{job.applicants} applicants</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {typeof job.postedAt === "string"
                          ? new Date(job.postedAt).toLocaleDateString()
                          : job.postedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // ── Professional Feed (LinkedIn-style) ─────────────────────
  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      await trpc.posts.like.mutate({ postId, userId: user.id });
    } catch { /* ignore */ }
  };

  return (
    <Layout>
      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left sidebar */}
          <aside className="hidden lg:block w-[225px] shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-[68px]">
              <div className="h-14 bg-gradient-to-r from-[#D97706] to-[#9A3412]" />
              <div className="px-4 pb-4 -mt-7">
                <div className="w-14 h-14 rounded-full border-2 border-white bg-[#D97706] flex items-center justify-center text-white text-xl font-bold">
                  {(user?.fullName || user?.name || "U").charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900 mt-2">{user?.fullName || user?.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Professional</p>
              </div>
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Connections</span>
                  <span className="text-[#D97706] font-semibold">342</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main feed */}
          <div className="flex-1 max-w-[560px] mx-auto w-full">
            {/* Create post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#D97706] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {(user?.fullName || user?.name || "U").charAt(0)}
                </div>
                <button
                  onClick={() => navigate("/create-post")}
                  className="flex-1 text-left px-4 py-2.5 rounded-full border border-gray-300 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Start a post
                </button>
              </div>
              <div className="flex items-center justify-around mt-3">
                {[
                  { icon: ImageIcon, label: "Photo", color: "text-[#D97706]" },
                  { icon: FileText, label: "Article", color: "text-emerald-500" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-500 transition-colors"
                  >
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {[
                { icon: Briefcase, label: "Jobs", href: "/jobs" },
                { icon: Users, label: "Network", href: "/network" },
                { icon: Building2, label: "Companies", href: "/network" },
                { icon: TrendingUp, label: "Premium", href: "/subscription" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </Link>
              ))}
            </div>

            {/* Posts feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Post header */}
                  <div className="flex items-start justify-between p-4 pb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                        {post.author.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-gray-900">{post.author.name}</span>
                          {post.author.isVerified && (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#D97706] text-white text-[8px] font-bold">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{post.author.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{post.timestamp}</p>
                      </div>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post content */}
                  <div className="px-4 pb-2">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Post image */}
                  {post.image && (
                    <div className="px-4 pb-3">
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full rounded-lg object-cover max-h-[400px]"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    <span>{post.likes} likes</span>
                    <div className="flex gap-4">
                      <span>{post.comments} comments</span>
                      <span>{post.shares} shares</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-around px-2 py-1">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${post.likedBy.includes("current") ? "text-[#D97706]" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={post.likedBy.includes("current") ? "#D97706" : "none"}
                        stroke={post.likedBy.includes("current") ? "#D97706" : "currentColor"}
                      />
                      Like
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                      <MessageCircle className="w-5 h-5" /> Comment
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                      <Repeat2 className="w-5 h-5" /> Share
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                      <Send className="w-5 h-5" /> Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="hidden xl:block w-[300px] shrink-0">
            <div className="sticky top-[68px] space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Trending Jobs</h3>
                <div className="space-y-3">
                  {jobs.slice(0, 3).map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company} · {job.location}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">People You May Know</h3>
                <p className="text-xs text-gray-400">Connect with professionals in your field</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 rounded-full text-sm"
                  onClick={() => navigate("/network")}
                >
                  View All
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

import { Image as ImageIcon, Send } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!content.trim()) return;
      setIsLoading(true);
      try {
        await trpc.posts.create.mutate({
          content: content.trim(),
          authorId: user.id,
          authorName: user.fullName || user.name,
          authorTitle: user.type === "professional" ? "Professional" : user.type === "recruiter" ? "Recruiter" : "Company",
        });
        navigate("/feed", { replace: true });
      } catch {
        alert("Failed to create post. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [content, user, navigate],
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Create a Post</h1>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold shrink-0">
                {(user.fullName || user.name).charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{user.fullName || user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.type === "professional" ? "Professional" : user.type === "recruiter" ? "Recruiter" : "Company"}
                </p>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to talk about?"
              rows={6}
              className="w-full px-0 py-2 text-sm text-gray-900 placeholder-gray-400 border-none focus:outline-none resize-none"
              autoFocus
            />

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm text-gray-500 transition-colors">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  Photo
                </button>
              </div>
              <Button
                type="submit"
                disabled={!content.trim() || isLoading}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] gap-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}

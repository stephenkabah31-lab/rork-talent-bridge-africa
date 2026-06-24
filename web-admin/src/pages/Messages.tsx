import { Search, Send, Phone, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  name: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline?: boolean;
}

const CONVERSATIONS: Conversation[] = [
  { id: "1", name: "Amara Okafor", title: "Talent Acquisition Lead", lastMessage: "Thanks for your application! We'd love to schedule an interview.", timestamp: "2m ago", unread: 2, isOnline: true },
  { id: "2", name: "Kwame Mensah", title: "Product Strategy Consultant", lastMessage: "Great insights on the digital innovation panel!", timestamp: "1h ago", unread: 0 },
  { id: "3", name: "Zainab Hassan", title: "Design Lead", lastMessage: "The portfolio looks amazing! Let's discuss collaboration opportunities.", timestamp: "3h ago", unread: 1, isOnline: true },
  { id: "4", name: "TechCorp Africa", title: "Technology Company", lastMessage: "Your application has been received. We'll be in touch shortly.", timestamp: "1d ago", unread: 0 },
];

const MESSAGES: Record<string, { from: string; text: string; time: string }[]> = {
  "1": [
    { from: "them", text: "Hi! Thanks for applying to the Senior Developer position.", time: "10:30 AM" },
    { from: "them", text: "We were impressed by your background and would love to schedule an interview.", time: "10:31 AM" },
    { from: "me", text: "Thank you! I'm very interested in the role. When would be a good time?", time: "10:35 AM" },
    { from: "them", text: "How about this Thursday at 2 PM WAT?", time: "10:36 AM" },
  ],
};

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const filteredConvs = search
    ? CONVERSATIONS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : CONVERSATIONS;

  const currentChat = selectedChat ? CONVERSATIONS.find((c) => c.id === selectedChat) : null;
  const chatMessages = selectedChat ? MESSAGES[selectedChat] || [] : [];

  const sendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;
    if (!MESSAGES[selectedChat]) MESSAGES[selectedChat] = [];
    MESSAGES[selectedChat].push({
      from: "me",
      text: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setMessageText("");
  };

  return (
    <Layout>
      <div className="max-w-[1128px] mx-auto h-[calc(100vh-52px)] flex">
        {/* Conversation list */}
        <div className={`${selectedChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] border-r border-gray-200 bg-white shrink-0`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selectedChat === conv.id ? "bg-amber-50" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-[#D97706] flex items-center justify-center text-white font-bold">
                    {conv.name.charAt(0)}
                  </div>
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-gray-900 truncate">{conv.name}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#D97706] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden text-gray-500 mr-3"
              >
                ←
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#D97706] flex items-center justify-center text-white text-sm font-bold">
                    {currentChat?.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{currentChat?.name}</p>
                  <p className="text-xs text-gray-500">{currentChat?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Phone className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.from === "me"
                        ? "bg-[#D97706] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === "me" ? "text-amber-200" : "text-gray-400"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className="rounded-full bg-[#D97706] hover:bg-[#9A3412] w-10 h-10 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Select a conversation</p>
              <p className="text-sm text-gray-400 mt-1">Choose from your existing messages</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <rect x="4" y="10" width="56" height="40" rx="8" fill="currentColor" opacity="0.2" />
      <path d="M12 24h28M12 32h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

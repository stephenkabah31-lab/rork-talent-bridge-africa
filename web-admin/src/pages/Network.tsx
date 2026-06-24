import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Search, Users, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import type { User } from "@/lib/trpc-types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Network() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["connections", user?.id],
    queryFn: () => (user ? trpc.users.getConnections.query({ userId: user.id }) : Promise.resolve([])),
    enabled: !!user,
  });

  const displayed = connections;
  const filtered = search
    ? displayed.filter(
        (c) =>
          (c.fullName || c.name).toLowerCase().includes(search.toLowerCase()) ||
          (c.country || "").toLowerCase().includes(search.toLowerCase()),
      )
    : displayed;

  return (
    <Layout>
      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1 max-w-[750px]">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">My Network</h1>
              <Button
                onClick={() => navigate("/network/search")}
                variant="outline"
                className="rounded-full"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Find People
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search connections"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
              />
            </div>

            {/* Connection cards */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No connections found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((conn) => (
                  <div
                    key={conn.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#D97706] flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {(conn.fullName || conn.name).charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{conn.fullName || conn.name}</p>
                        <p className="text-xs text-gray-500">
                          {conn.type === "professional" ? "Professional" : conn.type}
                          {conn.country && ` · ${conn.country}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-sm"
                      onClick={() => navigate("/messages")}
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Message
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

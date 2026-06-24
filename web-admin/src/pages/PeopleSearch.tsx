import { Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import type { User } from "@/lib/trpc-types";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const MOCK_PEOPLE: User[] = [
  { id: "p1", email: "john@email.com", name: "John Osei", type: "professional", fullName: "John Osei", country: "Accra, Ghana", isPremium: false, isAdmin: false, skills: ["React", "Node.js"] },
  { id: "p2", email: "grace@email.com", name: "Grace Mwangi", type: "recruiter", fullName: "Grace Mwangi", companyName: "Innovate Kenya", country: "Nairobi, Kenya", isPremium: true, isAdmin: false },
  { id: "p3", email: "fatima@email.com", name: "Fatima Diallo", type: "professional", fullName: "Fatima Diallo", country: "Dakar, Senegal", isPremium: false, isAdmin: false, skills: ["UI/UX", "Figma"] },
  { id: "p4", email: "david@email.com", name: "David Adebayo", type: "company", fullName: "David Adebayo", companyName: "Tech Africa Solutions", country: "Lagos, Nigeria", isPremium: true, isAdmin: false },
];

export default function PeopleSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const { data: tRPCUsers = [] } = useQuery({
    queryKey: ["users", "search", search],
    queryFn: () => (search ? trpc.users.search.query({ query: search }) : Promise.resolve([])),
    enabled: search.length > 0,
  });

  const people: User[] = search && tRPCUsers.length > 0 ? tRPCUsers : search ? [] : MOCK_PEOPLE;

  const handleConnect = (personId: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Find People</h1>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, skill, or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
            autoFocus
          />
        </div>

        {people.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? "No results found" : "Start searching to find people"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? "Try different keywords" : "Search by name, skill, or company"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {people.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#D97706] flex items-center justify-center text-white font-bold shrink-0">
                    {(person.fullName || person.name).charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {person.fullName || person.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {person.type === "professional"
                        ? "Professional"
                        : person.type === "recruiter"
                          ? `Recruiter at ${person.companyName || ""}`
                          : person.companyName || "Company"}
                      {person.country && ` · ${person.country}`}
                    </p>
                    {person.skills && person.skills.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {person.skills.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleConnect(person.id)}
                  variant={connected.has(person.id) ? "outline" : "default"}
                  size="sm"
                  className={`rounded-full text-sm ${
                    connected.has(person.id)
                      ? ""
                      : "bg-[#D97706] hover:bg-[#9A3412]"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  {connected.has(person.id) ? "Pending" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

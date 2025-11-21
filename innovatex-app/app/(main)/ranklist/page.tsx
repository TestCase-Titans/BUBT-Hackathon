"use client";

import { useEffect, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import { Trophy, Medal, User, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function RanklistPage() {
  const { user } = useApp();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Add cache: 'no-store' to prevent browser caching of old 0 score
    fetch("/api/leaderboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard);
        setUserRank(data.userRank);
        setUserScore(data.userScore); // Store the score
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={24} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={24} className="text-gray-400" />;
    if (rank === 3) return <Medal size={24} className="text-orange-400" />;
    return <span className="font-bold text-gray-400">#{rank}</span>;
  };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-[#0A3323]"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
              Global Rankings
            </h2>
            <p className="text-gray-500">
              See who's making the biggest impact.
            </p>
          </div>
        </div>

        {/* Current User Stats Card */}
        {!loading && (
          <div className="bg-[#0A3323] text-[#F3F6F4] p-6 rounded-3xl mb-8 flex items-center justify-between relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <p className="text-[#D4FF47] text-xs font-bold uppercase tracking-wider mb-1">
                Your Rank
              </p>
              <div className="flex items-baseline gap-4">
                <h3 className="text-4xl font-serif font-bold">#{userRank}</h3>
                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  <span className="text-sm font-bold text-[#D4FF47]">
                    {userScore} Pts
                  </span>
                </div>
              </div>
              <p className="text-sm text-white/70 mt-2">
                Top {Math.ceil((userRank / leaderboard.length) * 100)}% of users
              </p>
            </div>

            {/* Fixed Avatar Logic: Show Image if available */}
            <div className="w-20 h-20 bg-[#D4FF47] rounded-full flex items-center justify-center text-[#0A3323] font-bold text-2xl shadow-[0_0_20px_rgba(212,255,71,0.4)] relative z-10 border-4 border-[#0A3323] overflow-hidden">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>

            {/* Decor */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4FF47] opacity-5 rounded-full blur-3xl translate-x-10 -translate-y-10" />
          </div>
        )}

        {/* Leaderboard List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              Loading rankings...
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((u) => (
                <div
                  key={u.id}
                  className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    u.email === user?.email ? "bg-[#F0FFF4]" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(u.rank)}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      {u.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.image}
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} className="text-gray-400" />
                      )}
                    </div>

                    <div>
                      <h4
                        className={`font-bold text-sm ${
                          u.email === user?.email
                            ? "text-[#0A3323]"
                            : "text-gray-700"
                        }`}
                      >
                        {u.name} {u.email === user?.email && "(You)"}
                      </h4>
                      {u.location && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <MapPin size={10} /> {u.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-bold text-[#0A3323]">
                      {u.impactScore}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">
                      Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

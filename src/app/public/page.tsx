"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_STATS, MOCK_TREND_DATA, MOCK_CATEGORY_DATA, MOCK_COMPLAINTS, MOCK_ANNOUNCEMENTS } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/Badge";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, MapPin, Megaphone, ExternalLink } from "lucide-react";
import { complaintService } from "@/lib/services/complaint.service";

export default function PublicDashboardPage() {
    const [realStats, setRealStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await complaintService.getPublicAnalytics();
                setRealStats(data);
            } catch (error) {
                console.error("Failed to fetch public stats:", error);
            }
        };
        fetchStats();
    }, []);

    const displayStats = realStats || MOCK_STATS;

    const stats = [
        { label: "Total Reports", value: displayStats.totalIssues || displayStats.total || 0, icon: <TrendingUp className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50", trend: "+12% this month" },
        { label: "Resolved This Month", value: displayStats.resolvedThisMonth || displayStats.resolved || 0, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, bg: "bg-green-50", trend: "+8% vs last month" },
        { label: "Active / Pending", value: displayStats.pending || 0, icon: <Clock className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50", trend: "In Processing" },
        { label: "SLA Breached", value: displayStats.slaBreached || 0, icon: <AlertTriangle className="w-5 h-5 text-red-500" />, bg: "bg-red-50", trend: "Being escalated" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Nav */}
            <header className="bg-civic-blue text-white px-4 py-4 shadow-lg">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg">CivicPath</span>
                            <span className="block text-blue-200 text-xs">Public Dashboard</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/citizen" className="text-blue-100 hover:text-white text-sm transition-colors">Report Issue</Link>
                        <Link href="/citizen/track" className="btn-orange text-sm px-4 py-2">Track Issue</Link>

                        {/* MLA Portrait - Right Topmost Corner */}
                        <div className="ml-2 flex items-center gap-3 pl-3 border-l border-white/20">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 leading-none">Your MLA</p>
                                <p className="text-sm font-bold text-white">Shri. Mahesh Tenginkai</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-civic-orange shadow-lg overflow-hidden bg-white shrink-0">
                                <img
                                    src="/static/mla.jpg"
                                    alt="MLA Portrait"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Rajesh+Patil&background=f97316&color=fff";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-8">
                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Public Governance Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Live civic issue statistics for our constituency. Updated in real-time.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <div key={s.label} className="civic-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
                            </div>
                            <p className="text-2xl md:text-3xl font-black text-gray-900">{formatNumber(s.value)}</p>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">{s.label}</p>
                            <p className="text-xs text-gray-400 mt-1">{s.trend}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trend Chart */}
                    <div className="civic-card p-5 lg:col-span-2">
                        <h3 className="section-title mb-5">Complaints Trend — 2024</h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={MOCK_TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                                />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                                <Line type="monotone" dataKey="submitted" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3 }} name="Submitted" />
                                <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} name="Resolved" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Pie */}
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-5">Category Breakdown</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={MOCK_CATEGORY_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                                    {MOCK_CATEGORY_DATA.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v) => [`${v}%`, ""]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-3">
                            {MOCK_CATEGORY_DATA.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MLA Profile Card */}
                <div className="civic-card-elevated overflow-hidden bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                        <div className="md:col-span-1 bg-gradient-hero p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-glow overflow-hidden bg-white mb-4">
                                <img
                                    src="/static/mla.jpg"
                                    alt="Shri. Mahesh Tenginkai"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Mahesh+Tenginkai&background=f97316&color=fff";
                                    }}
                                />
                            </div>
                            <h4 className="text-white font-black text-lg">Shri. Mahesh Tenginkai</h4>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">Hon'ble MLA</p>
                        </div>
                        <div className="md:col-span-3 p-8">
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex-1 min-w-[140px]">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Constituency</p>
                                    <p className="text-gray-900 font-bold">Hubli-Dharwad Central</p>
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Commitment</p>
                                    <p className="text-gray-900 font-bold">Digital Accountability</p>
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Contact</p>
                                    <p className="text-gray-900 font-bold">080-222X-XXXX</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm italic border-l-4 border-civic-orange pl-4">
                                "Our mission is to bridge the gap between citizens and administration through technology. Every report you file is a step towards a better, smarter constituency. I personally monitor the high-priority issues to ensure timely resolution."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recently Resolved */}
                    <div className="civic-card p-5">
                        <div className="section-header">
                            <h3 className="section-title">Recently Resolved</h3>
                            <span className="badge badge-green text-xs">Live</span>
                        </div>
                        <div className="space-y-3">
                            {MOCK_COMPLAINTS.filter(c => c.status === "resolved").concat(MOCK_COMPLAINTS.slice(0, 2)).slice(0, 4).map((c) => (
                                <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-civic-green flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400">{c.ward}</span>
                                            <span className="text-xs text-gray-300">•</span>
                                            <StatusBadge status={c.status} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="civic-card p-5">
                        <div className="section-header">
                            <h3 className="section-title">MLA Announcements</h3>
                            <Megaphone className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {MOCK_ANNOUNCEMENTS.filter(a => a.status === "active").map((a) => (
                                <div key={a.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "badge text-xs",
                                            a.category === "Alert" ? "badge-red" :
                                                a.category === "Work" ? "badge-blue" : "badge-green"
                                        )}>{a.category}</span>
                                        <span className="text-xs text-gray-400">{a.date}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                                    <button className="flex items-center gap-1 text-xs text-civic-blue mt-1 hover:underline font-medium">
                                        Read more <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transparency Section: Dept Performance */}
                <div className="civic-card p-6">
                    <div className="section-header mb-6">
                        <div>
                            <h3 className="section-title">Department Accountability</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Real-time resolution rates across departments</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-civic-blue">
                            Average SLA Compliance: 88.4%
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { name: "Sanitation & Waste", rate: 94, resolved: 121, total: 129 },
                            { name: "Water Supply", rate: 91, resolved: 88, total: 97 },
                            { name: "Roads & Public Works", rate: 85, resolved: 138, total: 162 },
                            { name: "Street Lighting", rate: 83, resolved: 59, total: 71 },
                            { name: "Electricity Board", rate: 71, resolved: 61, total: 86 },
                            { name: "Health & Safety", rate: 89, resolved: 44, total: 49 },
                        ].map((d) => (
                            <div key={d.name} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-800">{d.name}</span>
                                    <span className={cn(
                                        "text-xs font-black",
                                        d.rate >= 90 ? "text-civic-green" : d.rate >= 80 ? "text-civic-blue" : "text-civic-orange"
                                    )}>{d.rate}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            d.rate >= 90 ? "bg-civic-green" : d.rate >= 80 ? "bg-civic-blue" : "bg-civic-orange"
                                        )}
                                        style={{ width: `${d.rate}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                    <span>{d.resolved} Resolved</span>
                                    <span>Out of {d.total} reported</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="bg-gradient-civic rounded-3xl p-8 text-center text-white">
                    <h2 className="text-2xl font-black mb-2">See an issue in your area?</h2>
                    <p className="text-blue-100 mb-5">Report it in under 2 minutes. Our team will act on it.</p>
                    <Link href="/citizen/report" className="btn-orange px-8 py-3 text-base rounded-xl inline-flex items-center gap-2">
                        Report a Civic Issue
                    </Link>
                </div>
            </div>
        </div>
    );
}

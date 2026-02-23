"use client";
import Link from "next/link";
import { MOCK_STATS, MOCK_TREND_DATA, MOCK_CATEGORY_DATA, MOCK_DEPARTMENTS, MOCK_OFFICERS } from "@/lib/mockData";
import { formatNumber, cn } from "@/lib/utils";
import {
    TrendingUp, CheckCircle2, Clock, AlertTriangle, Users,
    MapPin, Star, Download, Share2, LogOut, BarChart2
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const DEPT_RANK = [
    { name: "Sanitation", score: 94, resolved: 121, sla: 90 },
    { name: "Water", score: 91, resolved: 88, sla: 93 },
    { name: "Roads", score: 85, resolved: 138, sla: 88 },
    { name: "Lighting", score: 83, resolved: 59, sla: 85 },
    { name: "Electricity", score: 71, resolved: 61, sla: 72 },
];

const SLA_TREND = [
    { month: "Sep", rate: 78 },
    { month: "Oct", rate: 82 },
    { month: "Nov", rate: 79 },
    { month: "Dec", rate: 85 },
    { month: "Jan", rate: 88 },
    { month: "Feb", rate: 91 },
];

export default function MLADashboardPage() {
    const topOfficers = [...MOCK_OFFICERS].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="bg-gradient-hero text-white px-5 py-4 shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-black text-base leading-none">CivicPath</p>
                            <p className="text-blue-200 text-xs">MLA Leadership View</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/15 text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                        <button className="flex items-center gap-2 bg-civic-orange text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share Stats
                        </button>
                        <Link href="/admin/login" className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Logout">
                            <LogOut className="w-4 h-4 text-blue-200" />
                        </Link>

                        {/* MLA Portrait - Right Topmost Corner */}
                        <div className="ml-2 flex items-center gap-3 pl-3 border-l border-white/10">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 leading-none">Your MLA</p>
                                <p className="text-xs font-bold text-white">Shri. Mahesh Tenginkai</p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-civic-orange shadow-glow-orange overflow-hidden bg-white shrink-0 group cursor-help transition-transform hover:scale-110 active:scale-95">
                                <img
                                    src="/static/mla.jpg"
                                    alt="MLA Mahesh Tenginkai"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Mahesh+Tenginkai&background=f97316&color=fff";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Executive Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Constituency Performance Overview — February 2024</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Issues", value: formatNumber(MOCK_STATS.totalIssues), sub: "All time", icon: <BarChart2 className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50", trend: "+12%" },
                        { label: "Resolved", value: formatNumber(MOCK_STATS.resolvedThisMonth), sub: "This month", icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, bg: "bg-green-50", trend: "+8%" },
                        { label: "Pending", value: formatNumber(MOCK_STATS.pending), sub: "Awaiting action", icon: <Clock className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50", trend: " " },
                        { label: "Satisfaction", value: `${MOCK_STATS.citizenSatisfaction}%`, sub: "Citizen feedback", icon: <Star className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-50", trend: "+3%" },
                    ].map((s) => (
                        <div key={s.label} className="civic-card p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
                                {s.trend.trim() && (
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{s.trend}</span>
                                )}
                            </div>
                            <p className="text-3xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">{s.label}</p>
                            <p className="text-xs text-gray-400">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Media-ready Summary Card */}
                <div className="bg-gradient-civic rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 text-yellow-300" />
                            <span className="text-sm font-semibold text-blue-100">MLA Achievement Summary — February 2024</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {[
                                { value: "312", label: "Issues Resolved" },
                                { value: "3.2 days", label: "Avg Fix Time" },
                                { value: "94%", label: "SLA Compliance" },
                                { value: "78%", label: "Satisfaction" },
                            ].map((s) => (
                                <div key={s.label} className="text-center">
                                    <p className="text-3xl font-black text-white">{s.value}</p>
                                    <p className="text-blue-200 text-xs mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 flex gap-3">
                            <button className="btn-orange px-5 py-2 rounded-xl text-sm">
                                <Share2 className="w-4 h-4" /> Share on Social Media
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" /> Download Image
                            </button>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trend */}
                    <div className="civic-card p-5 lg:col-span-2">
                        <h3 className="section-title mb-5">Monthly Performance Trend</h3>
                        <ResponsiveContainer width="100%" height={230}>
                            <LineChart data={MOCK_TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                                <Line type="monotone" dataKey="submitted" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3 }} name="Submitted" />
                                <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} name="Resolved" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* SLA Trend */}
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-5">SLA Compliance Trend</h3>
                        <ResponsiveContainer width="100%" height={170}>
                            <LineChart data={SLA_TREND} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} unit="%" />
                                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v) => [`${v}%`, "SLA Rate"]} />
                                <Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: "#16a34a" }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-400">Current Rate</span>
                            <span className="text-lg font-black text-civic-green">91%</span>
                        </div>
                    </div>
                </div>

                {/* Dept Ranking + Officers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dept Ranking */}
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-5">Department Performance Ranking</h3>
                        <div className="space-y-3">
                            {DEPT_RANK.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0",
                                        i === 0 ? "bg-yellow-100 text-yellow-700" :
                                            i === 1 ? "bg-gray-100 text-gray-600" :
                                                i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"
                                    )}>
                                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-800">{d.name}</span>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>{d.resolved} resolved</span>
                                                <span className={cn("font-bold", d.sla >= 85 ? "text-civic-green" : d.sla >= 75 ? "text-civic-orange" : "text-red-500")}>{d.sla}% SLA</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                            <div
                                                className={cn("h-full rounded-full", i === 0 ? "bg-civic-green" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-civic-orange" : "bg-gray-400")}
                                                style={{ width: `${d.score}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-gray-600 w-8 text-right">{d.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Officers */}
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-5">Top Performing Officers</h3>
                        <div className="space-y-4">
                            {topOfficers.map((o, i) => (
                                <div key={o.id} className="flex items-center gap-3">
                                    <span className="text-lg flex-shrink-0">{["🥇", "🥈", "🥉"][i]}</span>
                                    <div className="w-10 h-10 bg-gradient-civic rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-black">{o.name.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800">{o.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{o.department}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-black text-civic-blue">{o.performanceScore}%</p>
                                        <p className="text-xs text-gray-400">{o.resolvedTotal} done</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users className="w-3.5 h-3.5" />
                                    {MOCK_OFFICERS.filter((o) => o.isActive).length} officers active across {MOCK_DEPARTMENTS.length} departments
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heat Map Placeholder */}
                <div className="civic-card p-5">
                    <div className="section-header">
                        <h3 className="section-title">Geographic Issue Heat Map</h3>
                        <span className="badge badge-blue text-xs">Live Data</span>
                    </div>
                    <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center border border-gray-100 relative overflow-hidden">
                        {/* Simulated heat map dots */}
                        {[
                            { x: 30, y: 40, size: 60, opacity: 0.5 },
                            { x: 55, y: 25, size: 80, opacity: 0.4 },
                            { x: 70, y: 55, size: 50, opacity: 0.6 },
                            { x: 20, y: 65, size: 40, opacity: 0.45 },
                            { x: 45, y: 70, size: 70, opacity: 0.35 },
                            { x: 80, y: 30, size: 45, opacity: 0.5 },
                        ].map((dot, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full animate-pulse-soft"
                                style={{
                                    left: `${dot.x}%`,
                                    top: `${dot.y}%`,
                                    width: `${dot.size}px`,
                                    height: `${dot.size}px`,
                                    background: `radial-gradient(circle, rgba(249,115,22,${dot.opacity}), transparent)`,
                                    transform: "translate(-50%, -50%)",
                                    animationDelay: `${i * 0.3}s`,
                                }}
                            />
                        ))}
                        <div className="relative z-10 text-center">
                            <MapPin className="w-8 h-8 text-civic-blue mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-gray-500 font-medium">Constituency Heat Map</p>
                            <p className="text-xs text-gray-400">Orange clusters = high complaint density areas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

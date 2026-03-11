"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MOCK_STATS, MOCK_TREND_DATA, MOCK_CATEGORY_DATA, MOCK_OFFICERS } from "@/lib/mockData";
import { formatNumber, cn } from "@/lib/utils";
import {
    TrendingUp, CheckCircle2, Clock, AlertTriangle, Users,
    MapPin, Star, Download, Share2, LogOut, BarChart2
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const SLA_TREND = [
    { month: "Sep", rate: 78 },
    { month: "Oct", rate: 82 },
    { month: "Nov", rate: 79 },
    { month: "Dec", rate: 85 },
    { month: "Jan", rate: 88 },
    { month: "Feb", rate: 91 },
];

export default function MLADashboardPage() {
    const [departmentPerformance, setDepartmentPerformance] = useState([]);
    const [stats, setStats] = useState({
        totalIssues: 0,
        resolved: 0,
        pending: 0,
        totalTrend: '+0%',
        resolvedTrend: '+0%'
    });
    const [loading, setLoading] = useState(true);
    const topOfficers = [...MOCK_OFFICERS].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3);

    useEffect(() => {
        // Initial fetch
        fetchDepartmentPerformance();
        fetchStats();

        // Auto-refresh every 10 seconds
        const statsInterval = setInterval(() => {
            fetchStats();
        }, 10000);

        const deptInterval = setInterval(() => {
            fetchDepartmentPerformance();
        }, 30000);

        // Cleanup intervals on unmount
        return () => {
            clearInterval(statsInterval);
            clearInterval(deptInterval);
        };
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/complaints/stats/dashboard');
            const data = await response.json();
            if (data.success) {
                const statsData = data.data;
                const total = parseInt(statsData.total_complaints) || 0;
                const resolved = parseInt(statsData.resolved) || 0;
                const pending = parseInt(statsData.submitted) + parseInt(statsData.in_progress) || 0;
                
                setStats({
                    totalIssues: total,
                    resolved: resolved,
                    pending: pending,
                    totalTrend: '+12%', // Can be calculated from historical data
                    resolvedTrend: '+8%'
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchDepartmentPerformance = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/mla/department-performance');
            const data = await response.json();
            if (data.success) {
                setDepartmentPerformance(data.data);
            }
        } catch (error) {
            console.error('Error fetching department performance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        window.location.href = "/";
    };

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
                        <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Logout">
                            <LogOut className="w-4 h-4 text-blue-200" />
                        </button>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Issues", value: formatNumber(stats.totalIssues), sub: "All time", icon: <BarChart2 className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50", trend: stats.totalTrend },
                        { label: "Resolved", value: formatNumber(stats.resolved), sub: "This month", icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, bg: "bg-green-50", trend: stats.resolvedTrend },
                        { label: "Pending", value: formatNumber(stats.pending), sub: "Awaiting action", icon: <Clock className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50", trend: " " },
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
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : departmentPerformance.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-2">No department data available</p>
                                <p className="text-xs text-gray-400">Assign complaints to departments to see performance rankings</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {departmentPerformance.map((d, i) => (
                                    <div key={d.id} className="flex items-center gap-3">
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
                                                <span className="text-sm font-semibold text-gray-800">{d.department_name}</span>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{d.resolved_count} resolved</span>
                                                    <span className={cn("font-bold", 
                                                        d.sla_compliance >= 85 ? "text-civic-green" : 
                                                        d.sla_compliance >= 75 ? "text-civic-orange" : "text-red-500"
                                                    )}>
                                                        {d.sla_compliance || 0}% SLA
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                                <div
                                                    className={cn("h-full rounded-full", 
                                                        i === 0 ? "bg-civic-green" : 
                                                        i === 1 ? "bg-blue-500" : 
                                                        i === 2 ? "bg-civic-orange" : "bg-gray-400"
                                                    )}
                                                    style={{ width: `${d.performance_score}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-gray-600 w-8 text-right">{d.performance_score}</span>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    {MOCK_OFFICERS.filter((o) => o.isActive).length} officers active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

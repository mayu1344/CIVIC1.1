"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { KPICard } from "@/components/ui/Card";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { MOCK_COMPLAINTS, MOCK_STATS, MOCK_TREND_DATA, MOCK_CATEGORY_DATA, MOCK_ANNOUNCEMENTS } from "@/lib/mockData";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import Link from "next/link";
import {
    FileText, Clock, AlertTriangle, CheckCircle2, TrendingUp,
    Users, ArrowRight, Bell, Zap, Plus
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const DEPT_PERF = [
    { dept: "Roads", resolved: 42, pending: 8, slaRate: 88 },
    { dept: "Water", resolved: 35, pending: 5, slaRate: 93 },
    { dept: "Electricity", resolved: 28, pending: 11, slaRate: 72 },
    { dept: "Sanitation", resolved: 56, pending: 7, slaRate: 90 },
    { dept: "Lighting", resolved: 31, pending: 6, slaRate: 85 },
];

export default function AdminDashboardPage() {
    const slaBreached = MOCK_COMPLAINTS.filter((c) => {
        const { isBreached } = getSLAStatus(c.slaDeadline);
        return isBreached;
    });

    return (
        <AdminLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Welcome Row */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Good afternoon, Admin 👋</h2>
                        <p className="text-gray-500 text-sm mt-0.5">Here's what's happening in your constituency today.</p>
                    </div>
                    <Link href="/admin/complaints" className="btn-primary">
                        <FileText className="w-4 h-4" />
                        View All Complaints
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="New Today"
                        value="12"
                        subtitle="3 critical"
                        icon={<Bell className="w-5 h-5 text-blue-600" />}
                        iconBg="bg-blue-50"
                        trend={{ value: 15, label: "vs yesterday" }}
                    />
                    <KPICard
                        title="Pending Assignment"
                        value="47"
                        subtitle="Awaiting ops action"
                        icon={<Clock className="w-5 h-5 text-orange-600" />}
                        iconBg="bg-orange-50"
                    />
                    <KPICard
                        title="SLA Breached"
                        value={String(MOCK_STATS.slaBreached)}
                        subtitle="Escalated"
                        icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                        iconBg="bg-red-50"
                        trend={{ value: -5, label: "vs last week" }}
                    />
                    <KPICard
                        title="Resolved Today"
                        value="28"
                        subtitle="Avg 3.2 days"
                        icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                        iconBg="bg-green-50"
                        trend={{ value: 8, label: "vs yesterday" }}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Trend Line */}
                    <div className="civic-card p-5 lg:col-span-2">
                        <div className="section-header">
                            <h3 className="section-title">Complaints Trend (Last 8 Months)</h3>
                            <span className="text-xs text-gray-400">Auto-refreshes</span>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
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

                    {/* Pie */}
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-4">Category Distribution</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={MOCK_CATEGORY_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
                                    {MOCK_CATEGORY_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v) => [`${v}%`, ""]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-2">
                            {MOCK_CATEGORY_DATA.slice(0, 4).map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Recent Complaints */}
                    <div className="civic-card p-5">
                        <div className="section-header">
                            <h3 className="section-title">Latest Complaints</h3>
                            <Link href="/admin/complaints" className="text-xs text-civic-blue font-semibold hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {MOCK_COMPLAINTS.slice(0, 4).map((c) => {
                                const sla = getSLAStatus(c.slaDeadline);
                                return (
                                    <Link key={c.id} href={`/admin/complaints/${c.id}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-mono text-gray-400">{c.complaintNumber}</span>
                                                <StatusBadge status={c.status} />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <PriorityBadge priority={c.priority} />
                                                <span className={cn("text-xs font-semibold", sla.color)}>{sla.label}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-civic-blue flex-shrink-0 mt-1 transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Announcements */}
                    <div className="civic-card p-5">
                        <div className="section-header">
                            <h3 className="section-title">Active Announcements</h3>
                            <Link href="/admin/announcements" className="text-xs text-civic-blue font-semibold hover:underline flex items-center gap-1">
                                Manage <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {MOCK_ANNOUNCEMENTS.filter(a => a.status === "active").slice(0, 3).map((a) => (
                                <div key={a.id} className="flex gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                        a.category === "Alert" ? "bg-red-50 text-red-500" :
                                            a.category === "Work" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                                    )}>
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{a.title}</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{a.category} • {a.date}</p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{a.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/admin/announcements" className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:border-civic-blue hover:text-civic-blue transition-all">
                            <Plus className="w-3.5 h-3.5" /> Post New Announcement
                        </Link>
                    </div>
                </div>

                {/* Department Performance */}
                <div className="civic-card p-5">
                    <div className="section-header">
                        <h3 className="section-title">Department Performance</h3>
                        <Link href="/admin/analytics" className="text-xs text-civic-blue font-semibold hover:underline">Full Analytics</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {DEPT_PERF.map((d) => (
                            <div key={d.dept} className="p-4 bg-gray-50 rounded-2xl relative overflow-hidden group">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{d.dept}</p>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-gray-900">{d.resolved}</span>
                                    <span className="text-xs text-gray-400">solved</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400">{d.slaRate}% SLA</span>
                                    <div className="w-16 h-1 bg-white rounded-full overflow-hidden">
                                        <div className="h-full bg-civic-green rounded-full" style={{ width: `${d.slaRate}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

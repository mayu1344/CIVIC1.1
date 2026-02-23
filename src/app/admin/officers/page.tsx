"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { MOCK_OFFICERS } from "@/lib/mockData";
import { useState } from "react";
import { User, Plus, Star, CheckCircle2, Clock, Phone, Mail, Edit2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function OfficersPage() {
    const [officers, setOfficers] = useState(MOCK_OFFICERS);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState("all");

    const DEPTS = ["All", "Roads & Public Works", "Water Supply", "Electricity Board", "Sanitation Department", "Street Lighting"];

    const filtered = filter === "all"
        ? officers
        : officers.filter((o) => o.department.toLowerCase() === filter.toLowerCase());

    const handleToggle = (id: string) => {
        setOfficers((prev) => prev.map((o) => o.id === id ? { ...o, isActive: !o.isActive } : o));
        toast.success("Officer status updated");
    };

    return (
        <AdminLayout>
            <div className="space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Officer Management</h2>
                        <p className="text-gray-500 text-sm">{filtered.length} field officers</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
                        Add Officer
                    </Button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="civic-card p-5 border-l-4 border-civic-blue animate-slide-down">
                        <h3 className="font-bold text-gray-900 mb-4">Add New Officer</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="label-field">Full Name *</label>
                                <input placeholder="Officer Full Name" className="input-field" />
                            </div>
                            <div>
                                <label className="label-field">Mobile Number</label>
                                <input placeholder="+91 XXXXXXXXXX" className="input-field" />
                            </div>
                            <div>
                                <label className="label-field">Email</label>
                                <input type="email" placeholder="officer@civic.gov" className="input-field" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="label-field">Department</label>
                                <div className="relative">
                                    <select className="input-field appearance-none pr-8">
                                        {DEPTS.slice(1).map((d) => <option key={d}>{d}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button onClick={() => { toast.success("Officer added!"); setShowForm(false); }}>Save Officer</Button>
                            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {DEPTS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setFilter(d === "All" ? "all" : d)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0",
                                (d === "All" && filter === "all") || filter === d
                                    ? "bg-civic-blue text-white"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {/* Officers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((officer) => (
                        <div key={officer.id} className={cn("civic-card p-5 group hover:shadow-card-md transition-all", !officer.isActive && "opacity-60")}>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-civic rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-black text-lg">{officer.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-sm">{officer.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{officer.department}</p>
                                    <span className={cn("badge mt-1", officer.isActive ? "badge-green" : "badge-gray")}>
                                        {officer.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleToggle(officer.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 text-center gap-2 mb-4">
                                <div>
                                    <p className="text-lg font-black text-civic-orange">{officer.activeCases}</p>
                                    <p className="text-xs text-gray-400">Active</p>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-civic-green">{officer.resolvedTotal}</p>
                                    <p className="text-xs text-gray-400">Resolved</p>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-civic-blue">{officer.performanceScore}%</p>
                                    <p className="text-xs text-gray-400">Score</p>
                                </div>
                            </div>

                            {/* Performance Bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Star className="w-3 h-3 text-yellow-400" />
                                        Performance Score
                                    </div>
                                    <span className="text-xs font-semibold">{officer.performanceScore}/100</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                    <div
                                        className={cn("h-full rounded-full", officer.performanceScore >= 85 ? "bg-civic-green" : officer.performanceScore >= 70 ? "bg-civic-orange" : "bg-red-500")}
                                        style={{ width: `${officer.performanceScore}%` }}
                                    />
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Phone className="w-3 h-3" /> {officer.mobile}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail className="w-3 h-3" /> {officer.email}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

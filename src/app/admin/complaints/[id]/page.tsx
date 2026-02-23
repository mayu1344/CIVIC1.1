"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ComplaintStepper } from "@/components/ui/Stepper";
import { MOCK_COMPLAINTS, MOCK_OFFICERS, MOCK_DEPARTMENTS } from "@/lib/mockData";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import { useState } from "react";
import {
    MapPin, Clock, User, Building2, AlertTriangle, CheckCircle2,
    ArrowLeft, MessageSquare, Upload, Zap, ChevronDown, Star
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUS_HISTORY = [
    { status: "Submitted", by: "System", time: "Feb 20, 2024 09:15 AM", note: "Complaint auto-received" },
    { status: "Validated", by: "Ops Desk", time: "Feb 20, 2024 10:30 AM", note: "Issue verified by team. No duplicate found." },
    { status: "Assigned", by: "Supervisor", time: "Feb 20, 2024 11:00 AM", note: "Assigned to Roads Dept. SLA: 7 days" },
    { status: "In Progress", by: "Suresh Patil (Officer)", time: "Feb 21, 2024 09:00 AM", note: "Visited site, materials ordered" },
];

const COMM_LOG = [
    { channel: "SMS", message: "Your complaint CMP-2024-00341 has been registered.", time: "3 days ago", status: "sent" },
    { channel: "WhatsApp", message: "Your complaint has been assigned to Roads & Public Works. Expected fix by Feb 27.", time: "2 days ago", status: "sent" },
    { channel: "SMS", message: "Field officer Suresh Patil is working on your complaint.", time: "1 day ago", status: "sent" },
];

export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
    const complaint = MOCK_COMPLAINTS.find((c) => c.id === params.id) ?? MOCK_COMPLAINTS[0];
    const sla = getSLAStatus(complaint.slaDeadline);

    const [assignDept, setAssignDept] = useState(complaint.assignedDept);
    const [assignOfficer, setAssignOfficer] = useState(complaint.assignedOfficer);
    const [note, setNote] = useState("");
    const [assigning, setAssigning] = useState(false);

    const handleAssign = async () => {
        setAssigning(true);
        await new Promise((r) => setTimeout(r, 1000));
        setAssigning(false);
        toast.success("Complaint assigned successfully!");
    };

    return (
        <AdminLayout>
            <div className="space-y-5 animate-fade-in">
                {/* Back + Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/complaints" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-black text-gray-900">{complaint.complaintNumber}</h2>
                            <StatusBadge status={complaint.status} />
                            <PriorityBadge priority={complaint.priority} />
                            {complaint.isEscalated && (
                                <span className="badge bg-red-100 text-red-700">
                                    <AlertTriangle className="w-3 h-3" /> Escalated
                                </span>
                            )}
                        </div>
                    </div>
                    <Button variant="danger" size="sm" leftIcon={<Zap className="w-3.5 h-3.5" />}>
                        Escalate
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left — Main Info */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Complaint Info */}
                        <div className="civic-card p-5">
                            <h3 className="font-bold text-gray-900 mb-4">{complaint.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-5">{complaint.description}</p>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Citizen", value: complaint.citizenName, icon: <User className="w-3.5 h-3.5" /> },
                                    { label: "Mobile", value: complaint.citizenMobile, icon: <User className="w-3.5 h-3.5" /> },
                                    { label: "Ward", value: complaint.ward, icon: <MapPin className="w-3.5 h-3.5" /> },
                                    { label: "Submitted", value: formatDateTime(complaint.createdAt), icon: <Clock className="w-3.5 h-3.5" /> },
                                    { label: "SLA Deadline", value: formatDateTime(complaint.slaDeadline), icon: <Clock className="w-3.5 h-3.5" /> },
                                    { label: "SLA Status", value: sla.label, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: sla.color },
                                ].map(({ label, value, icon, color }) => (
                                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1 text-gray-400">{icon}<span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div>
                                        <p className={cn("text-sm font-semibold truncate", color ?? "text-gray-800")}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Location */}
                            <div className="mt-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{complaint.locationAddress}</p>
                                <div className="w-full h-36 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                                    <div className="text-center text-gray-400">
                                        <MapPin className="w-7 h-7 mx-auto mb-1" />
                                        <p className="text-xs">Map View: {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Suggestion */}
                        <div className="civic-card p-5 border-l-4 border-civic-blue-light">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="w-4 h-4 text-civic-blue" />
                                <h3 className="font-bold text-gray-900 text-sm">AI Classification Suggestion</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400 mb-1">Suggested Category</p>
                                    <p className="text-sm font-bold text-civic-blue capitalize">{complaint.aiCategorySuggestion}</p>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400 mb-1">Urgency Score</p>
                                    <p className="text-sm font-bold text-civic-orange">{(complaint.aiUrgencyScore * 100).toFixed(0)}%</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400 mb-1">Confidence</p>
                                    <p className="text-sm font-bold text-civic-green">High</p>
                                </div>
                            </div>
                        </div>

                        {/* Status History */}
                        <div className="civic-card p-5">
                            <h3 className="font-bold text-gray-900 mb-4">Audit Trail</h3>
                            <div className="space-y-3">
                                {STATUS_HISTORY.map((h, i) => (
                                    <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-civic-blue" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-800">{h.status}</span>
                                                <span className="text-xs text-gray-400">{h.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>
                                            <p className="text-xs text-gray-400">By: <strong>{h.by}</strong></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Communication Log */}
                        <div className="civic-card p-5">
                            <div className="section-header">
                                <h3 className="font-bold text-gray-900">Communication Log</h3>
                                <Button size="sm" variant="secondary">Send Message</Button>
                            </div>
                            <div className="space-y-3">
                                {COMM_LOG.map((c, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn("badge", c.channel === "SMS" ? "badge-blue" : "badge-green")}>{c.channel}</span>
                                            <span className="text-xs text-gray-400">{c.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-700">{c.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Assignment Panel + Stepper */}
                    <div className="space-y-5">
                        {/* Assignment Panel */}
                        <div className="civic-card p-5">
                            <h3 className="font-bold text-gray-900 mb-4">Assignment Panel</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="label-field">Department</label>
                                    <div className="relative">
                                        <select
                                            value={assignDept}
                                            onChange={(e) => setAssignDept(e.target.value)}
                                            className="input-field appearance-none pr-8"
                                        >
                                            <option value="">Select Department...</option>
                                            {["Roads & Public Works", "Water Supply", "Electricity Board", "Sanitation Department", "Street Lighting", "Health & Safety"].map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label-field">Field Officer</label>
                                    <div className="relative">
                                        <select
                                            value={assignOfficer}
                                            onChange={(e) => setAssignOfficer(e.target.value)}
                                            className="input-field appearance-none pr-8"
                                        >
                                            <option value="">Select Officer...</option>
                                            {MOCK_OFFICERS.map((o) => (
                                                <option key={o.id} value={o.name}>{o.name} ({o.activeCases} active)</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label-field">Internal Note</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={3}
                                        placeholder="Add notes for the officer..."
                                        className="input-field resize-none text-xs"
                                    />
                                </div>
                                <Button onClick={handleAssign} loading={assigning} className="w-full">
                                    <Building2 className="w-4 h-4" />
                                    Assign Complaint
                                </Button>
                            </div>
                        </div>

                        {/* Complaint Progress */}
                        <div className="civic-card p-5">
                            <h3 className="font-bold text-gray-900 mb-5">Complaint Progress</h3>
                            <ComplaintStepper currentStatus={complaint.status} />
                        </div>

                        {/* Quick Actions */}
                        <div className="civic-card p-5">
                            <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <Button variant="green" className="w-full" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                                    Mark Resolved
                                </Button>
                                <Button variant="ghost" className="w-full" leftIcon={<Upload className="w-4 h-4" />}>
                                    Upload Proof
                                </Button>
                                <Button variant="danger" className="w-full" leftIcon={<AlertTriangle className="w-4 h-4" />}>
                                    Mark Duplicate
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

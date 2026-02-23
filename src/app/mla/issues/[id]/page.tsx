"use client";
import { MLALayout } from "@/components/layout/MLALayout";
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from "@/lib/mockData";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { getSLAStatus, formatDateTime, cn } from "@/lib/utils";
import {
    ArrowLeft, MapPin, Clock, User, Building2,
    MessageSquare, History, Phone, AlertTriangle, ExternalLink,
    CheckCircle2, Printer
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function MLAIssueDetailPage({ params }: { params: { id: string } }) {
    const complaint = MOCK_COMPLAINTS.find((c) => c.id === params.id) ?? MOCK_COMPLAINTS[0];
    const sla = getSLAStatus(complaint.slaDeadline);
    const [note, setNote] = useState("");
    const [posting, setPosting] = useState(false);

    const handlePostNote = async () => {
        if (!note.trim()) return;
        setPosting(true);
        await new Promise(r => setTimeout(r, 1000));
        setPosting(false);
        setNote("");
        toast.success("Executive note added to the file.");
    };

    return (
        <MLALayout>
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
                {/* Breadcrumb / Back */}
                <div className="flex items-center justify-between">
                    <Link href="/mla/issues" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-civic-blue transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Issues
                    </Link>
                    <button className="btn-ghost flex items-center gap-2 border border-gray-200">
                        <Printer className="w-4 h-4" /> Print Report
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="civic-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-xs font-black tracking-widest text-gray-400 font-mono">{complaint.complaintNumber}</span>
                                    <h1 className="text-2xl font-black text-gray-900 mt-1">{complaint.title}</h1>
                                </div>
                                <StatusBadge status={complaint.status} />
                            </div>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <PriorityBadge priority={complaint.priority} />
                                <div className={cn("flex items-center gap-1.5 text-xs font-bold", sla.color)}>
                                    <Clock className="w-3.5 h-3.5" /> {sla.label}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                    <MapPin className="w-3.5 h-3.5" /> {complaint.ward}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">Description</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                                        "{complaint.description}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase mb-2">Attached Media</h3>
                                        <div className="flex gap-2">
                                            {/* Placeholder for media */}
                                            {[1, 2].map(i => (
                                                <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl relative overflow-hidden flex items-center justify-center">
                                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                                </div>
                                            ))}
                                            <span className="text-xs text-gray-400 self-center ml-1">+{complaint.mediaCount - 2} more</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase mb-2">Location Context</h3>
                                        <p className="text-xs text-gray-600 font-medium">{complaint.locationAddress}</p>
                                        <button className="text-[10px] text-civic-blue font-bold mt-1 hover:underline">View Live Map →</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights (MLA Exclusive View) */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-3xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 text-civic-blue" />
                                <h3 className="text-sm font-black text-civic-blue uppercase tracking-wider">AI Executive Insights</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-white/60 backdrop-blur p-3 rounded-xl text-xs text-gray-700">
                                    <span className="font-bold">Constituency Sentiment:</span> Residents in {complaint.ward} have reported 12 similar issues this quarter. This location is a recurring pain point.
                                </div>
                                <div className="bg-white/60 backdrop-blur p-3 rounded-xl text-xs text-gray-700">
                                    <span className="font-bold">Electoral Impact:</span> Fast resolution could improve local satisfaction score by approximately 4%.
                                </div>
                            </div>
                        </div>

                        {/* Audit Trail */}
                        <div className="civic-card p-6">
                            <h3 className="section-title mb-6">Process Timeline</h3>
                            <div className="space-y-6">
                                {[
                                    { title: "Complaint Resolved", date: complaint.resolvedAt, status: "done", desc: "Resolved by Officer Suresh Patil" },
                                    { title: "Work in Progress", date: complaint.updatedAt, status: "pending", desc: "Field technician dispatched to site" },
                                    { title: "Complaint Assigned", date: complaint.createdAt, status: "done", desc: "Assigned to Roads & Public Works Dept" },
                                    { title: "Issue Validated", date: complaint.createdAt, status: "done", desc: "AI-validation successful" },
                                    { title: "Submitted", date: complaint.createdAt, status: "done", desc: "Received via Citizen Portal" },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2",
                                                step.status === "done" ? "bg-green-50 border-civic-green text-civic-green" : "bg-white border-gray-200 text-gray-300"
                                            )}>
                                                {step.status === "done" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            </div>
                                            {i < 4 && <div className="w-0.5 h-full bg-gray-100 my-1" />}
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-bold text-gray-800">{step.title}</p>
                                            <p className="text-xs text-gray-400 mb-1">{step.date ? formatDateTime(step.date) : "Oct 12, 10:30 AM"}</p>
                                            <p className="text-xs text-gray-500">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions Column */}
                    <div className="space-y-6">
                        {/* Stakeholders Card */}
                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4">Stakeholders</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Citizen</p>
                                        <p className="text-sm font-bold text-gray-900">{complaint.citizenName}</p>
                                    </div>
                                    <button className="ml-auto p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-civic-blue" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Dept. In-Charge</p>
                                        <p className="text-sm font-bold text-gray-900">{complaint.assignedDept}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-civic-orange" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Assigned Officer</p>
                                        <p className="text-sm font-bold text-gray-900">{complaint.assignedOfficer}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MLA Executive Action */}
                        <div className="civic-card p-5 border-2 border-civic-blue/20">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-4 h-4 text-civic-blue" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Executive Note</h3>
                            </div>
                            <textarea
                                className="input-field min-h-[100px] mb-3 text-xs"
                                placeholder="Leave a note or directive for the department head..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <button
                                className="btn-primary w-full py-2.5 text-xs shadow-glow-blue"
                                onClick={handlePostNote}
                                disabled={posting}
                            >
                                Post Directive
                            </button>
                            <p className="text-[10px] text-center text-gray-400 mt-2">
                                Directives are visible to Dept. Heads & Officers
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MLALayout>
    );
}

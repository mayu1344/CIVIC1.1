"use client";
import { useState, useEffect } from "react";
import { OfficerLayout } from "@/components/layout/OfficerLayout";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { MOCK_COMPLAINTS } from "@/lib/mockData";
import { getSLAStatus, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle, MapPin, ChevronRight } from "lucide-react";
import { complaintService } from "@/lib/services/complaint.service";
import { authService } from "@/lib/services/auth.service";

export default function OfficerDashboardPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data: any = await complaintService.getComplaints();
                // Filter for current officer if applicable, else all
                const officerTasks = data.rows || data;
                setTasks(Array.isArray(officerTasks) ? officerTasks : []);
            } catch (error) {
                console.error("Failed to fetch officer tasks:", error);
                setTasks(MOCK_COMPLAINTS);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const myTasks = tasks.length > 0 ? tasks : MOCK_COMPLAINTS;
    const active = myTasks.filter((c: any) => !["resolved", "closed"].includes(c.status));
    const done = myTasks.filter((c: any) => ["resolved", "closed"].includes(c.status));
    const overdue = active.filter((c: any) => getSLAStatus(c.slaDeadline || c.sla_deadline).isBreached);

    return (
        <OfficerLayout>
            <div className="space-y-5 animate-fade-in">
                {/* Summary */}
                <div>
                    <h1 className="text-xl font-black text-gray-900">My Tasks</h1>
                    <p className="text-gray-500 text-sm">Officer: Suresh Patil • Roads & Public Works</p>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="civic-card p-3 text-center">
                        <p className="text-2xl font-black text-civic-blue">{active.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Active</p>
                    </div>
                    <div className="civic-card p-3 text-center">
                        <p className="text-2xl font-black text-civic-green">{done.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Done Today</p>
                    </div>
                    <div className={cn("p-3 text-center rounded-2xl border", overdue.length > 0 ? "bg-red-50 border-red-200" : "civic-card")}>
                        <p className={cn("text-2xl font-black", overdue.length > 0 ? "text-red-600" : "text-gray-400")}>{overdue.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Overdue</p>
                    </div>
                </div>

                {/* Overdue Alert */}
                {overdue.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-800">You have {overdue.length} overdue task(s)</p>
                            <p className="text-xs text-red-600">Take action immediately to avoid further escalation.</p>
                        </div>
                    </div>
                )}

                {/* Active Tasks */}
                {active.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle2 className="w-12 h-12 text-civic-green mx-auto mb-3" />
                        <h3 className="font-bold text-gray-900">All Caught Up!</h3>
                        <p className="text-gray-500 text-sm">No active tasks right now.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Active Tasks ({active.length})</h2>
                        {active.map((c) => {
                            const sla = getSLAStatus(c.slaDeadline);
                            return (
                                <Link
                                    key={c.id}
                                    href={`/officer/tasks/${c.id}`}
                                    className={cn(
                                        "civic-card p-4 block hover:shadow-card-md transition-shadow",
                                        sla.isBreached && "border-red-200 bg-red-50/30"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-gray-400">{c.complaintNumber}</span>
                                                <PriorityBadge priority={c.priority} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 leading-snug">{c.title}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-2.5 mb-3 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Citizen:</span>
                                            <span className="text-xs font-bold text-gray-800">{c.citizenName}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Mobile:</span>
                                            <span className="text-xs font-mono text-gray-700">{c.citizenMobile}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" /> {c.ward}
                                        </div>
                                        <div className={cn("flex items-center gap-1 text-xs font-semibold ml-auto", sla.color)}>
                                            <Clock className="w-3 h-3" /> {sla.label}
                                        </div>
                                    </div>
                                    <div>
                                        <StatusBadge status={c.status} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Quick Stats at Bottom */}
                {done.length > 0 && (
                    <div className="civic-card p-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-3">Completed Today</p>
                        {done.map((c) => (
                            <div key={c.id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                                <CheckCircle2 className="w-4 h-4 text-civic-green flex-shrink-0" />
                                <p className="text-sm text-gray-700 truncate flex-1">{c.title}</p>
                                <StatusBadge status={c.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </OfficerLayout>
    );
}

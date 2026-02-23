"use client";
import { OfficerLayout } from "@/components/layout/OfficerLayout";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ComplaintStepper } from "@/components/ui/Stepper";
import { MOCK_COMPLAINTS } from "@/lib/mockData";
import { getSLAStatus, formatDateTime, cn } from "@/lib/utils";
import { useState, useRef } from "react";
import {
    MapPin, Clock, Camera, Upload, CheckCircle2, X,
    Navigation, ArrowLeft, ChevronDown, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
    { value: "assigned", label: "Pending — Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "quality_check", label: "Work Completed — Submit for Review" },
];

import { useEffect } from "react";
import { complaintService } from "@/lib/services/complaint.service";

export default function OfficerTaskDetailPage({ params }: { params: { id: string } }) {
    const [complaint, setComplaint] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await complaintService.getComplaintById(params.id);
                setComplaint(data);
                setStatus(data.status);
            } catch (error) {
                console.error("Failed to fetch task detail:", error);
                setComplaint(MOCK_COMPLAINTS.find(c => c.id === params.id) || MOCK_COMPLAINTS[0]);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [params.id]);

    const sla = complaint ? getSLAStatus(complaint.slaDeadline || complaint.sla_deadline) : null;

    const [status, setStatus] = useState(complaint.status);
    const [photos, setPhotos] = useState<string[]>([]);
    const [note, setNote] = useState("");
    const [cost, setCost] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).slice(0, 3).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => setPhotos((prev) => [...prev, e.target?.result as string].slice(0, 4));
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async () => {
        if (photos.length === 0) { toast.error("Please upload at least one proof photo"); return; }
        if (!note.trim()) { toast.error("Please add a completion note"); return; }

        setSubmitting(true);
        try {
            await complaintService.updateStatus(complaint.id, "quality_check" as any, note);
            setSubmitting(false);
            setSubmitted(true);
            toast.success("Task submitted for quality review!");
        } catch (error: any) {
            console.error("Task submission failed:", error);
            toast.error(error.response?.data?.message || "Failed to update status");
            setSubmitting(false);
        }
    };

    if (loading || !complaint || !sla) {
        return <OfficerLayout><div className="p-8 text-center">Loading task details...</div></OfficerLayout>;
    }

    if (submitted) {
        return (
            <OfficerLayout>
                <div className="text-center py-16 animate-slide-up">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-civic-green" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900">Task Submitted!</h2>
                    <p className="text-gray-500 text-sm mt-1">Your completion report is under quality review.</p>
                    <div className="mt-3 bg-gray-50 rounded-2xl p-3 inline-block">
                        <span className="text-xs font-mono text-gray-400">{complaint.complaintNumber}</span>
                    </div>
                    <div className="mt-6">
                        <Link href="/officer/dashboard" className="btn-primary">← Back to Dashboard</Link>
                    </div>
                </div>
            </OfficerLayout>
        );
    }

    return (
        <OfficerLayout>
            <div className="space-y-4 animate-fade-in">
                {/* Back */}
                <div className="flex items-center gap-2">
                    <Link href="/officer/dashboard" className="p-2 rounded-xl hover:bg-gray-100">
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </Link>
                    <span className="text-sm font-semibold text-gray-600">Task Detail</span>
                </div>

                {/* Header Card */}
                <div className="civic-card p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                            <span className="text-xs font-mono text-gray-400">{complaint.complaintNumber}</span>
                            <h1 className="text-base font-black text-gray-900 mt-0.5 leading-snug">{complaint.title}</h1>
                        </div>
                        <PriorityBadge priority={complaint.priority} />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{complaint.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {complaint.locationAddress}
                        </div>
                        <div className={cn("flex items-center gap-1 font-semibold", sla.color)}>
                            <Clock className="w-3.5 h-3.5" />
                            {sla.label}
                        </div>
                    </div>
                </div>

                {/* SLA Warning */}
                {sla.isBreached && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 font-semibold">SLA has been breached. This issue has been escalated to your supervisor.</p>
                    </div>
                )}

                {/* Map + Navigate */}
                <div className="civic-card p-4">
                    <div className="w-full h-36 bg-gray-100 rounded-xl flex items-center justify-center mb-3 border border-gray-200">
                        <div className="text-center text-gray-400">
                            <MapPin className="w-7 h-7 mx-auto mb-1" />
                            <p className="text-xs">{complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}</p>
                        </div>
                    </div>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${complaint.latitude},${complaint.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full justify-center py-2.5"
                    >
                        <Navigation className="w-4 h-4" />
                        Navigate to Location
                    </a>
                </div>

                {/* Status Update */}
                <div className="civic-card p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Update Status</h3>
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="input-field appearance-none pr-10 font-semibold"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Complaint Progress */}
                <div className="civic-card p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Complaint Progress</h3>
                    <ComplaintStepper currentStatus={status as any} />
                </div>

                {/* Completion Form */}
                <div className="civic-card p-4 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Completion Report</h3>

                    {/* Photo Upload */}
                    <div>
                        <label className="label-field">Photo Proof * <span className="text-red-400">(Required)</span></label>
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-civic-blue transition-colors"
                            onClick={() => fileRef.current?.click()}
                        >
                            <Camera className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 font-medium">Tap to upload photos</p>
                            <p className="text-xs text-gray-400 mt-0.5">Up to 4 photos • Max 10MB each</p>
                            <input
                                ref={fileRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handlePhotoUpload(e.target.files)}
                                capture="environment"
                            />
                        </div>
                        {photos.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {photos.map((src, i) => (
                                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completion Note */}
                    <div>
                        <label className="label-field">Completion Note *</label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Describe the work done, materials used, result..."
                            className="input-field resize-none"
                        />
                    </div>

                    {/* Estimated Cost */}
                    <div>
                        <label className="label-field">Estimated Cost (Optional)</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                            <input
                                type="number"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="0"
                                className="input-field pl-8"
                            />
                        </div>
                    </div>

                    {/* GPS Note */}
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2.5 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        GPS location will be automatically captured on submission
                    </div>

                    <Button
                        onClick={handleSubmit}
                        loading={submitting}
                        className="w-full py-3 text-base"
                        leftIcon={<Upload className="w-4 h-4" />}
                    >
                        Submit for Quality Review
                    </Button>
                </div>
            </div>
        </OfficerLayout>
    );
}

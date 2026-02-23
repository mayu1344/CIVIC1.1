"use client";
import { useState, useEffect, useRef } from "react";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    MapPin, Upload, X, CheckCircle2, Share2, Copy, Phone,
    Camera, AlertTriangle, Info, ChevronDown, Locate
} from "lucide-react";
import { CATEGORIES, SUB_CATEGORIES } from "@/lib/constants";
import { suggestPriority, generateComplaintNumber, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import CivicMap from "@/components/ui/CivicMap";
import { geoService } from "@/lib/services/geo.service";
import { complaintService } from "@/lib/services/complaint.service";

const schema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    category: z.string().min(1, "Please select a category"),
    subCategory: z.string().min(1, "Please select a sub-category"),
    description: z.string().min(50, "Description must be at least 50 characters"),
    locationAddress: z.string().min(5, "Please provide a location"),
    priority: z.enum(["low", "medium", "high", "critical"]),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    ward: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low", color: "text-green-600", desc: "Non-urgent, can wait" },
    { value: "medium", label: "Medium", color: "text-yellow-600", desc: "Needs attention soon" },
    { value: "high", label: "High", color: "text-orange-600", desc: "Significant inconvenience" },
    { value: "critical", label: "Critical", color: "text-red-600", desc: "Immediate safety concern" },
];

export default function ReportPage() {
    const [step, setStep] = useState(1); // 1=Details, 2=Location, 3=Review
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [complaintId, setComplaintId] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [subCategories, setSubCategories] = useState<string[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { priority: "medium" },
    });

    const watchCategory = watch("category");
    const watchDescription = watch("description");
    const watchPriority = watch("priority");
    const watchLat = watch("latitude");
    const watchLon = watch("longitude");

    // Update sub-categories when category changes
    useEffect(() => {
        if (watchCategory) {
            setSubCategories(SUB_CATEGORIES[watchCategory] || []);
            setValue("subCategory", "");
        }
    }, [watchCategory, setValue]);

    // Auto-suggest priority
    useEffect(() => {
        if (watchDescription && watchCategory) {
            const suggested = suggestPriority(watchDescription, watchCategory);
            setValue("priority", suggested);
        }
    }, [watchDescription, watchCategory, setValue]);

    const handleFileChange = (newFiles: FileList | null) => {
        if (!newFiles) return;
        const arr = Array.from(newFiles).slice(0, 5 - files.length);
        const valid = arr.filter((f) => f.size <= 10 * 1024 * 1024);
        if (valid.length < arr.length) toast.error("Some files exceed 10MB limit");
        setFiles((prev) => [...prev, ...valid].slice(0, 5));
        valid.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews((prev) => [...prev, e.target?.result as string].slice(0, 5));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (idx: number) => {
        setFiles((f) => f.filter((_, i) => i !== idx));
        setPreviews((p) => p.filter((_, i) => i !== idx));
    };

    const sendOTP = () => {
        const mobile = watch("mobile");
        if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
            toast.error("Enter a valid mobile number first");
            return;
        }
        setOtpSent(true);
        toast.success(`OTP sent to ${mobile.slice(0, 3)}XXXXXXX${mobile.slice(-2)}`);
    };

    const verifyOTP = () => {
        if (otp === "123456") {
            setOtpVerified(true);
            toast.success("Mobile number verified!");
        } else {
            toast.error("Invalid OTP. (Demo: use 123456)");
        }
    };

    const handleLocationSelect = async (lat: number, lon: number) => {
        setValue("latitude", lat);
        setValue("longitude", lon);
        toast.loading("Fetching address...", { id: "geo" });
        const { address, ward } = await geoService.reverseGeocode(lat, lon);
        setValue("locationAddress", address);
        setValue("ward", ward);
        toast.success("Location updated!", { id: "geo" });
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported by your browser");
            return;
        }
        toast.loading("Detecting location...", { id: "geo-detect" });
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setMapCenter([latitude, longitude]);
                await handleLocationSelect(latitude, longitude);
                toast.success("Location detected!", { id: "geo-detect" });
            },
            () => {
                toast.error("Could not detect location. Please select on map.", { id: "geo-detect" });
            }
        );
    };

    const onSubmit = async (data: FormData) => {
        try {
            const submissionData = {
                title: data.category + " Issue: " + data.description.substring(0, 50) + "...",
                description: data.description,
                category: data.category,
                subCategory: data.subCategory,
                priority: watchPriority as any,
                location: {
                    address: data.locationAddress || "Specified on map",
                    latitude: watchLat || 12.9716,
                    longitude: watchLon || 77.5946,
                    ward: data.ward || "Ward 4"
                },
                citizenName: data.fullName,
                citizenMobile: data.mobile || "9999999999",
                attachments: files
            };

            const response: any = await complaintService.submitComplaint(submissionData);
            setComplaintId(response.ticketNumber || response.id || "CMP-2026-X883");
            setSubmitted(true);
            toast.success("Complaint submitted successfully!");
        } catch (error: any) {
            console.error("Submission failed:", error);
            toast.error(error.response?.data?.message || "Failed to submit complaint. Please try again.");
        }
    };

    // ── SUCCESS STATE ──────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <CitizenLayout>
                <div className="max-w-lg mx-auto px-4 py-16 text-center animate-slide-up">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-civic-green" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Complaint Submitted!</h1>
                    <p className="text-gray-500 mb-6">Your issue has been registered and our team has been notified.</p>

                    <div className="civic-card p-6 mb-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Your Complaint ID</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl font-black text-civic-blue">{complaintId}</span>
                            <button
                                onClick={() => { navigator.clipboard.writeText(complaintId); toast.success("Copied!"); }}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Save this ID to track your complaint anytime</p>
                    </div>

                    <div className="space-y-3">
                        <a
                            href={`https://wa.me/?text=My%20civic%20complaint%20ID%20is%20${complaintId}.%20Track%20at%20http://civicpath.gov`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-green w-full justify-center py-3"
                        >
                            <Share2 className="w-4 h-4" />
                            Share on WhatsApp
                        </a>
                        <a href={`/citizen/track?id=${complaintId}`} className="btn-secondary w-full justify-center py-3">
                            <MapPin className="w-4 h-4" />
                            Track My Complaint
                        </a>
                        <button onClick={() => { setSubmitted(false); setStep(1); setFiles([]); setPreviews([]) }} className="btn-ghost w-full justify-center py-3 text-gray-500">
                            Report Another Issue
                        </button>
                    </div>
                </div>
            </CitizenLayout>
        );
    }

    return (
        <CitizenLayout>
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-2xl font-black text-gray-900">Report a Civic Issue</h1>
                    <p className="text-gray-500 text-sm mt-1">Fill in the details below. Takes less than 2 minutes.</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {["Issue Details", "Location", "Review & Submit"].map((label, idx) => (
                        <div key={label} className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-1.5">
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                    step > idx + 1 ? "bg-civic-green text-white" :
                                        step === idx + 1 ? "bg-civic-blue text-white" : "bg-gray-200 text-gray-400"
                                )}>
                                    {step > idx + 1 ? "✓" : idx + 1}
                                </div>
                                <span className={cn("text-xs font-medium hidden sm:block", step === idx + 1 ? "text-civic-blue" : "text-gray-400")}>
                                    {label}
                                </span>
                            </div>
                            {idx < 2 && <div className={cn("h-0.5 flex-1", step > idx + 1 ? "bg-civic-green" : "bg-gray-200")} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* ── STEP 1: Details ── */}
                    {step === 1 && (
                        <div className="animate-slide-up space-y-5">
                            {/* Name */}
                            <div>
                                <label className="label-field">Full Name *</label>
                                <input {...register("fullName")} placeholder="e.g. Ramesh Kumar" className={cn("input-field", errors.fullName && "input-field-error")} />
                                {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
                            </div>

                            {/* Mobile + OTP */}
                            <div>
                                <label className="label-field">Mobile Number *</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+91</span>
                                        <input
                                            {...register("mobile")}
                                            placeholder="9876543210"
                                            className={cn("input-field pl-12", errors.mobile && "input-field-error")}
                                            maxLength={10}
                                        />
                                    </div>
                                    {!otpVerified && (
                                        <button type="button" onClick={sendOTP} className="btn-secondary flex-shrink-0 px-4">
                                            {otpSent ? "Resend" : "Send OTP"}
                                        </button>
                                    )}
                                </div>
                                {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}

                                {otpSent && !otpVerified && (
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP (Demo: 123456)"
                                            className="input-field flex-1"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                        />
                                        <button type="button" onClick={verifyOTP} className="btn-green flex-shrink-0 px-4">Verify</button>
                                    </div>
                                )}
                                {otpVerified && (
                                    <div className="flex items-center gap-1.5 mt-1.5 text-green-600 text-xs font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Mobile verified
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="label-field">Issue Category *</label>
                                <div className="relative">
                                    <select {...register("category")} className={cn("input-field appearance-none pr-10", errors.category && "input-field-error")}>
                                        <option value="">Select a category...</option>
                                        {CATEGORIES.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.category && <p className="error-text">{errors.category.message}</p>}
                            </div>

                            {/* Sub-category */}
                            {subCategories.length > 0 && (
                                <div>
                                    <label className="label-field">Sub-Category *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {subCategories.map((sub) => (
                                            <button
                                                key={sub}
                                                type="button"
                                                onClick={() => setValue("subCategory", sub)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                                                    watch("subCategory") === sub
                                                        ? "bg-civic-blue text-white border-civic-blue"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-civic-blue hover:text-civic-blue"
                                                )}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.subCategory && <p className="error-text">{errors.subCategory.message}</p>}
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label className="label-field">Description *</label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    placeholder="Describe the issue clearly — what is wrong, how long it has been there, impact on residents..."
                                    className={cn("input-field resize-none", errors.description && "input-field-error")}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    {errors.description
                                        ? <p className="error-text">{errors.description.message}</p>
                                        : <p className="text-xs text-gray-400">Minimum 50 characters required</p>
                                    }
                                    <span className={cn("text-xs", (watchDescription?.length || 0) < 50 ? "text-red-400" : "text-green-500")}>
                                        {watchDescription?.length || 0}/50+
                                    </span>
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="label-field flex items-center gap-1.5">
                                    Priority
                                    <span className="badge badge-blue text-xs">AI Suggested</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRIORITY_OPTIONS.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setValue("priority", p.value as any)}
                                            className={cn(
                                                "p-3 rounded-xl border text-left transition-all",
                                                watchPriority === p.value
                                                    ? "border-civic-blue bg-blue-50"
                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                            )}
                                        >
                                            <span className={cn("text-sm font-bold", p.color)}>{p.label}</span>
                                            <span className="block text-xs text-gray-400 mt-0.5">{p.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button type="button" onClick={() => setStep(2)} className="w-full py-3">Continue to Location →</Button>
                        </div>
                    )}

                    {/* ── STEP 2: Location & Media ── */}
                    {step === 2 && (
                        <div className="animate-slide-up space-y-5">
                            <div>
                                <label className="label-field">Location / Address *</label>
                                <div className="flex gap-2">
                                    <input
                                        {...register("locationAddress")}
                                        placeholder="Enter address or area name..."
                                        className={cn("input-field flex-1", errors.locationAddress && "input-field-error")}
                                    />
                                    <button
                                        type="button"
                                        onClick={detectLocation}
                                        className="btn-secondary flex-shrink-0 px-4 gap-1.5"
                                    >
                                        <Locate className="w-4 h-4" /> GPS
                                    </button>
                                </div>
                                {errors.locationAddress && <p className="error-text">{errors.locationAddress.message}</p>}
                                <p className="text-xs text-gray-400 mt-1">Click GPS to auto-detect your location</p>
                            </div>

                            {/* Interactive Map */}
                            <div className="w-full h-64 relative z-0">
                                <CivicMap
                                    center={mapCenter}
                                    onLocationSelect={handleLocationSelect}
                                    interactive={true}
                                />
                                {watchLat && watchLon && (
                                    <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-gray-200 text-[10px] font-mono shadow-sm">
                                        {watchLat.toFixed(4)}, {watchLon.toFixed(4)}
                                    </div>
                                )}
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="label-field">Photos / Videos (Optional)</label>
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                                        dragOver ? "border-civic-blue bg-blue-50" : "border-gray-200 hover:border-gray-300"
                                    )}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files); }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-600">Drag & drop or click to upload</p>
                                    <p className="text-xs text-gray-400 mt-1">Up to 5 files • JPG, PNG, MP4 • Max 10MB each</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp,video/mp4"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e.target.files)}
                                    />
                                </div>

                                {previews.length > 0 && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {previews.map((src, i) => (
                                            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Duplicate Warning */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Similar issue found</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        A similar issue (<strong>CMP-2024-00341</strong>) already exists in your area.
                                        You can{" "}
                                        <a href="/citizen/track?id=CMP-2024-00341" className="underline font-semibold">upvote it</a>{" "}
                                        or continue with a new report.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                                <Button type="button" onClick={() => setStep(3)} className="flex-1">Review Submission →</Button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Review ── */}
                    {step === 3 && (
                        <div className="animate-slide-up space-y-4">
                            <div className="civic-card p-5 space-y-3">
                                <h3 className="font-bold text-gray-900 mb-4">Review Your Complaint</h3>
                                {[
                                    { label: "Name", value: watch("fullName") },
                                    { label: "Mobile", value: `+91 ${watch("mobile")}` },
                                    { label: "Category", value: CATEGORIES.find(c => c.value === watchCategory)?.label },
                                    { label: "Sub-Category", value: watch("subCategory") },
                                    { label: "Priority", value: watchPriority?.toUpperCase() },
                                    { label: "Description", value: watchDescription },
                                    { label: "Location", value: watch("locationAddress") },
                                    { label: "Media", value: `${files.length} file(s) attached` },
                                ].map(({ label, value }) => (
                                    value && (
                                        <div key={label} className="flex gap-3">
                                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide w-24 flex-shrink-0 mt-0.5">{label}</span>
                                            <span className="text-sm text-gray-800 flex-1">{value}</span>
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 flex gap-2.5">
                                <Info className="w-5 h-5 text-civic-blue flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">
                                    You will receive a confirmation SMS/WhatsApp with your Complaint ID after submission. Track your complaint anytime on our portal.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="flex-1">← Back</Button>
                                <Button type="submit" loading={isSubmitting} className="flex-1 py-3">
                                    Submit Complaint ✓
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </CitizenLayout>
    );
}

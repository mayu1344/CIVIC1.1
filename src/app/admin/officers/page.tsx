"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { User, Plus, Star, CheckCircle2, Clock, Phone, Mail, Edit2, ChevronDown, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Officer {
    id: string;
    full_name: string;
    email: string;
    mobile: string;
    department_name: string;
    department_id: string;
    employee_id: string;
    designation: string;
    status: string;
    is_available: boolean;
    performance_score: number;
    active_tasks: number;
    resolved_tasks: number;
}

interface Department {
    id: string;
    name: string;
}

export default function OfficersPage() {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState("all");
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        mobile: "",
        department_id: ""
    });

    useEffect(() => {
        fetchOfficers();
        fetchDepartments();
    }, []);

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            setError(null);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/v1/admin/officers`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success && data.data) {
                setOfficers(data.data);
            }
        } catch (error: any) {
            console.error('Error fetching officers:', error);
            setError(error.message);
            toast.error('Failed to load officers');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/v1/admin/departments`);
            const data = await response.json();
            if (data.success && data.data) {
                setDepartments(data.data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.full_name || !formData.mobile || !formData.department_id) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        try {
            setSaving(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/v1/admin/officers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (data.success) {
                toast.success('Officer added successfully!');
                setShowForm(false);
                setFormData({
                    full_name: "",
                    email: "",
                    mobile: "",
                    department_id: ""
                });
                fetchOfficers(); // Refresh the list
            } else {
                toast.error(data.message || 'Failed to add officer');
            }
        } catch (error: any) {
            console.error('Error adding officer:', error);
            toast.error('Failed to add officer. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const filtered = filter === "all"
        ? officers
        : officers.filter((o) => o.department_name?.toLowerCase() === filter.toLowerCase());

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-civic-blue mx-auto mb-3" />
                        <p className="text-gray-500">Loading officers...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Officers</h3>
                        <p className="text-gray-600 mb-4">Could not connect to the backend server.</p>
                        <Button onClick={fetchOfficers} leftIcon={<Loader2 className="w-4 h-4" />}>
                            Retry
                        </Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Get unique departments for filter
    const uniqueDepts = ["All", ...Array.from(new Set(officers.map(o => o.department_name).filter(Boolean)))];

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
                    <form onSubmit={handleSubmit} className="civic-card p-5 border-l-4 border-civic-blue animate-slide-down">
                        <h3 className="font-bold text-gray-900 mb-4">Add New Officer</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="label-field">Full Name *</label>
                                <input 
                                    placeholder="Officer Full Name" 
                                    className="input-field"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label-field">Mobile Number *</label>
                                <input 
                                    placeholder="+91 XXXXXXXXXX" 
                                    className="input-field"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label-field">Email</label>
                                <input 
                                    type="email" 
                                    placeholder="officer@civic.gov" 
                                    className="input-field"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="label-field">Department *</label>
                                <div className="relative">
                                    <select 
                                        className="input-field appearance-none pr-8"
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                {departments.length === 0 && (
                                    <p className="text-xs text-orange-600 mt-1">⚠️ No departments found. Please add departments first.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button type="submit" disabled={saving || departments.length === 0}>
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Officer'
                                )}
                            </Button>
                            <Button variant="ghost" type="button" onClick={() => setShowForm(false)} disabled={saving}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {uniqueDepts.map((d) => (
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
                    {filtered.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No officers found</p>
                        </div>
                    ) : (
                        filtered.map((officer) => (
                            <div key={officer.id} className={cn("civic-card p-5 group hover:shadow-card-md transition-all", officer.status !== 'active' && "opacity-60")}>
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-civic rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-black text-lg">{officer.full_name?.charAt(0) || 'O'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-sm">{officer.full_name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{officer.department_name || 'No Department'}</p>
                                        <span className={cn("badge mt-1", officer.status === 'active' ? "badge-green" : "badge-gray")}>
                                            {officer.status === 'active' ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 text-center gap-2 mb-4">
                                    <div>
                                        <p className="text-lg font-black text-civic-orange">{officer.active_tasks || 0}</p>
                                        <p className="text-xs text-gray-400">Active</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-civic-green">{officer.resolved_tasks || 0}</p>
                                        <p className="text-xs text-gray-400">Resolved</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-civic-blue">{officer.performance_score || 0}%</p>
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
                                        <span className="text-xs font-semibold">{officer.performance_score || 0}/100</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                        <div
                                            className={cn("h-full rounded-full", 
                                                (officer.performance_score || 0) >= 85 ? "bg-civic-green" : 
                                                (officer.performance_score || 0) >= 70 ? "bg-civic-orange" : "bg-red-500"
                                            )}
                                            style={{ width: `${officer.performance_score || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone className="w-3 h-3" /> {officer.mobile || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Mail className="w-3 h-3" /> {officer.email || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

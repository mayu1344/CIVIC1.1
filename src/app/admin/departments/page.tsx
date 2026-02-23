"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { MOCK_DEPARTMENTS } from "@/lib/mockData";
import { useState } from "react";
import { Building2, Clock, CheckCircle2, TrendingUp, Plus, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DepartmentsPage() {
    const [depts, setDepts] = useState(MOCK_DEPARTMENTS);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", code: "", slaHours: 72 });

    const toggleActive = (id: string) => {
        setDepts((prev) => prev.map((d) => d.id === id ? { ...d, isActive: !d.isActive } : d));
        toast.success("Department status updated");
    };

    const handleSave = () => {
        if (!formData.name.trim()) { toast.error("Department name required"); return; }
        if (editId) {
            setDepts((prev) => prev.map((d) => d.id === editId ? { ...d, ...formData } : d));
            toast.success("Department updated!");
        } else {
            setDepts((prev) => [...prev, {
                id: `dept-${Date.now()}`,
                ...formData,
                isActive: true,
                totalCases: 0,
                resolvedCases: 0,
            }]);
            toast.success("Department added!");
        }
        setShowForm(false);
        setEditId(null);
        setFormData({ name: "", code: "", slaHours: 72 });
    };

    return (
        <AdminLayout>
            <div className="space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Department Management</h2>
                        <p className="text-gray-500 text-sm">{depts.filter((d) => d.isActive).length} active departments</p>
                    </div>
                    <Button onClick={() => { setShowForm(true); setEditId(null); }} leftIcon={<Plus className="w-4 h-4" />}>
                        Add Department
                    </Button>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="civic-card p-5 border-l-4 border-civic-blue animate-slide-down">
                        <h3 className="font-bold text-gray-900 mb-4">{editId ? "Edit Department" : "Add New Department"}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-1">
                                <label className="label-field">Department Name *</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Roads & Public Works"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label-field">Department Code</label>
                                <input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. RPW"
                                    className="input-field"
                                    maxLength={5}
                                />
                            </div>
                            <div>
                                <label className="label-field">SLA (Hours)</label>
                                <input
                                    type="number"
                                    value={formData.slaHours}
                                    onChange={(e) => setFormData({ ...formData, slaHours: parseInt(e.target.value) || 72 })}
                                    className="input-field"
                                    min={1}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button onClick={handleSave}>Save Department</Button>
                            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </div>
                )}

                {/* Departments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {depts.map((dept) => {
                        const resolveRate = dept.totalCases > 0 ? Math.round((dept.resolvedCases / dept.totalCases) * 100) : 0;
                        return (
                            <div
                                key={dept.id}
                                className={cn(
                                    "civic-card p-5 group hover:shadow-card-md transition-all duration-300",
                                    !dept.isActive && "opacity-60"
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-navy-50 rounded-xl flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-civic-blue" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">{dept.name}</h3>
                                            <span className="text-xs text-gray-400 font-mono">{dept.code}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleActive(dept.id)}
                                        className="text-gray-400 hover:text-civic-blue transition-colors"
                                        title={dept.isActive ? "Deactivate" : "Activate"}
                                    >
                                        {dept.isActive
                                            ? <ToggleRight className="w-6 h-6 text-civic-green" />
                                            : <ToggleLeft className="w-6 h-6 text-gray-300" />
                                        }
                                    </button>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="text-center">
                                        <p className="text-lg font-black text-gray-900">{dept.totalCases}</p>
                                        <p className="text-xs text-gray-400">Total</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-black text-civic-green">{dept.resolvedCases}</p>
                                        <p className="text-xs text-gray-400">Resolved</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-black text-civic-blue">{dept.totalCases - dept.resolvedCases}</p>
                                        <p className="text-xs text-gray-400">Pending</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Resolution Rate</span>
                                        <span className="font-semibold text-gray-700">{resolveRate}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                        <div
                                            className={cn("h-full rounded-full transition-all", resolveRate >= 85 ? "bg-civic-green" : resolveRate >= 70 ? "bg-civic-orange" : "bg-red-500")}
                                            style={{ width: `${resolveRate}%` }}
                                        />
                                    </div>
                                </div>

                                {/* SLA */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        SLA: <strong>{dept.slaHours < 24 ? `${dept.slaHours}h` : `${Math.round(dept.slaHours / 24)} days`}</strong>
                                    </div>
                                    <button
                                        onClick={() => { setEditId(dept.id); setFormData({ name: dept.name, code: dept.code, slaHours: dept.slaHours }); setShowForm(true); }}
                                        className="flex items-center gap-1 text-xs text-civic-blue font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}

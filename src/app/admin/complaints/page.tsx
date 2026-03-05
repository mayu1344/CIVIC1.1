"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, getSLAStatus, cn, truncate } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { COMPLAINT_STATUSES, CATEGORIES, PRIORITIES } from "@/lib/constants";
import {
    Search, Filter, Download, Eye, ChevronDown,
    AlertTriangle, CheckSquare, Copy, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const STATUSES_FILTER = ["all", ...COMPLAINT_STATUSES] as const;
const PRIORITIES_FILTER = ["all", ...PRIORITIES] as const;

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    // Fetch complaints from API
    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/complaints');
            
            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }
            
            const data = await response.json();
            
            if (data.success && data.data) {
                // Handle both array and paginated response
                const complaintsData = Array.isArray(data.data) ? data.data : data.data.complaints || [];
                setComplaints(complaintsData);
            } else {
                setComplaints([]);
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
            toast.error('Failed to load complaints');
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = complaints.filter((c) => {
        const matchSearch = search === "" || 
            c.complaint_number?.toUpperCase().includes(search.toUpperCase()) || 
            c.citizen_name?.toLowerCase().includes(search.toLowerCase()) || 
            c.title?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || c.status === statusFilter;
        const matchPriority = priorityFilter === "all" || c.priority === priorityFilter;
        return matchSearch && matchStatus && matchPriority;
    });

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);

    const toggleSelect = (id: string) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        setSelected(selected.length === paginated.length ? [] : paginated.map((c) => c.id.toString()));
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-civic-blue mx-auto mb-3" />
                        <p className="text-gray-500">Loading complaints...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Complaint Management</h2>
                        <p className="text-gray-500 text-sm">{filtered.length} complaints found</p>
                    </div>
                    <Button variant="ghost" leftIcon={<Download className="w-4 h-4" />}>Export CSV</Button>
                </div>

                {/* Filters */}
                <div className="civic-card p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by ID, name, or description..."
                                className="input-field pl-9"
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input-field appearance-none pr-9 min-w-[140px]"
                            >
                                {STATUSES_FILTER.map((s) => (
                                    <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {/* Priority Filter */}
                        <div className="relative">
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="input-field appearance-none pr-9 min-w-[130px]"
                            >
                                {PRIORITIES_FILTER.map((p) => (
                                    <option key={p} value={p}>{p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selected.length > 0 && (
                        <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-600">{selected.length} selected</span>
                            <Button variant="secondary" size="sm">Assign Selected</Button>
                            <Button variant="ghost" size="sm" leftIcon={<Copy className="w-3.5 h-3.5" />}>Mark Duplicate</Button>
                            <Button variant="danger" size="sm">Bulk Reject</Button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="civic-card overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="data-table min-w-[1100px]">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selected.length === paginated.length && paginated.length > 0}
                                            onChange={toggleAll}
                                            className="rounded border-gray-300"
                                        />
                                    </th>
                                    <th>Complaint ID</th>
                                    <th>Citizen Name</th>
                                    <th>Mobile</th>
                                    <th>Issue</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>SLA</th>
                                    <th>Assigned To</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-center py-12 text-gray-400">
                                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No complaints match your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((c) => {
                                        const sla = getSLAStatus(c.sla_deadline);
                                        return (
                                            <tr key={c.id} className={cn(selected.includes(c.id.toString()) && "bg-blue-50/30")}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(c.id.toString())}
                                                        onChange={() => toggleSelect(c.id.toString())}
                                                        className="rounded border-gray-300"
                                                    />
                                                </td>
                                                <td>
                                                    <div>
                                                        <span className="font-mono text-xs font-semibold text-civic-blue">{c.complaint_number}</span>
                                                        {c.is_escalated && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                                                <span className="text-red-500 text-xs font-semibold">Escalated</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <p className="font-semibold text-gray-800 text-sm">{c.citizen_name || 'N/A'}</p>
                                                </td>
                                                <td>
                                                    <p className="font-mono text-xs text-gray-600">{c.citizen_mobile || 'N/A'}</p>
                                                </td>
                                                <td>
                                                    <p className="text-gray-700 text-xs truncate max-w-[200px]">{truncate(c.title, 50)}</p>
                                                    <p className="text-gray-400 text-xs">{c.ward}</p>
                                                </td>
                                                <td>
                                                    <span className="text-xs text-gray-600 capitalize">{c.category?.replace(/_/g, " ")}</span>
                                                    <br />
                                                    <span className="text-xs text-gray-400">{c.sub_category}</span>
                                                </td>
                                                <td><PriorityBadge priority={c.priority} /></td>
                                                <td><StatusBadge status={c.status} /></td>
                                                <td>
                                                    <span className={cn("text-xs font-semibold", sla.color)}>{sla.label}</span>
                                                </td>
                                                <td>
                                                    <p className="text-xs font-medium text-gray-700">{c.officer_name || "—"}</p>
                                                    <p className="text-xs text-gray-400">{c.department_name || "Unassigned"}</p>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={`/admin/complaints/${c.id}`}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-civic-blue text-white text-xs font-semibold rounded-lg hover:bg-navy-700 transition-colors"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={cn("w-7 h-7 rounded-lg text-xs font-semibold", p === page ? "bg-civic-blue text-white" : "hover:bg-gray-100 text-gray-600")}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

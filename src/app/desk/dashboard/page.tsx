"use client";

import { useState, useEffect } from "react";
import { DeskLayout } from "@/components/layout/DeskLayout";
import { MOCK_COMPLAINTS, MOCK_STATS } from "@/lib/mockData";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import {
    Clock, AlertTriangle, CheckCircle2, TrendingUp, Users,
    FileText, Timer, Flag, ArrowRight, Activity
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import Link from "next/link";

export default function DeskDashboardPage() {
    const [stats, setStats] = useState({
        pending: 0,
        assigned: 0,
        escalated: 0,
        resolved: 0,
        slaBreached: 0,
        duplicates: 0,
    });

    useEffect(() => {
        // Calculate stats from mock data
        const pending = MOCK_COMPLAINTS.filter(c => c.status === "submitted" || c.status === "validated").length;
        const assigned = MOCK_COMPLAINTS.filter(c => c.status === "assigned").length;
        const escalated = MOCK_COMPLAINTS.filter(c => c.isEscalated).length;
        const resolved = MOCK_COMPLAINTS.filter(c => c.status === "resolved").length;
        const slaBreached = MOCK_COMPLAINTS.filter(c => getSLAStatus(c.slaDeadline).isBreached).length;
        const duplicates = MOCK_COMPLAINTS.filter(c => c.status === "duplicate").length;

        setStats({ pending, assigned, escalated, resolved, slaBreached, duplicates });
    }, []);

    const kpiCards = [
        { 
            label: "Pending Assignment", 
            value: stats.pending, 
            icon: <Clock className="w-5 h-5" />, 
            color: "bg-orange-50 text-orange-600",
            trend: "+3 today"
        },
        { 
            label: "Assigned Today", 
            value: stats.assigned, 
            icon: <Users className="w-5 h-5" />, 
            color: "bg-blue-50 text-blue-600",
            trend: "Active"
        },
        { 
            label: "SLA Breached", 
            value: stats.slaBreached, 
            icon: <AlertTriangle className="w-5 h-5" />, 
            color: "bg-red-50 text-red-600",
            trend: "Needs attention"
        },
        { 
            label: "Resolved Today", 
            v
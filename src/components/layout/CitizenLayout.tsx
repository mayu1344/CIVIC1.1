"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CITIZEN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Menu, X, MapPin, Phone, Bell } from "lucide-react";
import { useState } from "react";

export function CitizenLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface-secondary">
            {/* Top Nav */}
            <header className="bg-civic-blue shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/citizen" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-white font-bold text-lg leading-none">CivicPath</span>
                                <span className="block text-blue-200 text-xs">Digital Governance</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {CITIZEN_NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                        pathname === item.href
                                            ? "bg-white/20 text-white"
                                            : "text-blue-100 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            {/* MLA Portrait - Top Rightmost Corner */}
                            <div className="flex items-center gap-2.5 pr-3 border-r border-white/10">
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 leading-none mb-0.5">Your MLA</p>
                                    <p className="text-xs font-bold text-white whitespace-nowrap">Shri. Mahesh Tenginkai</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-civic-orange shadow-lg overflow-hidden bg-white shrink-0">
                                    <img
                                        src="/static/mla.jpg"
                                        alt="MLA Portrait"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://ui-avatars.com/api/?name=Mahesh+Tenginkai&background=f97316&color=fff";
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden bg-navy-800 border-t border-white/10 px-4 py-3 space-y-1 animate-slide-down">
                        {CITIZEN_NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    pathname === item.href ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="animate-fade-in">{children}</main>

            {/* Footer */}
            <footer className="bg-civic-blue text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-5 h-5 text-civic-orange" />
                                <span className="font-bold text-lg">CivicPath</span>
                            </div>
                            <p className="text-blue-200 text-sm">
                                Empowering citizens to report and track civic issues for a better community.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-blue-200 text-sm">
                                <li><Link href="/citizen/report" className="hover:text-white transition-colors">Report Issue</Link></li>
                                <li><Link href="/citizen/track" className="hover:text-white transition-colors">Track Complaint</Link></li>
                                <li><Link href="/public" className="hover:text-white transition-colors">Public Dashboard</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Helpline</h4>
                            <div className="flex items-center gap-2 text-blue-200 text-sm">
                                <Phone className="w-4 h-4" />
                                <span>1800-XXX-XXXX (Toll Free)</span>
                            </div>
                            <p className="text-blue-300 text-xs mt-3">
                                Powered by Cascade Technologies Solutions
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-5 text-center text-blue-300 text-xs">
                        © 2024 CivicPath. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

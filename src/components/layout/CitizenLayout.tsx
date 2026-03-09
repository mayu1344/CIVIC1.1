"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export function CitizenLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { t } = useLanguage();

    const CITIZEN_NAV = [
        { href: "/citizen", label: t('nav.home') },
        { href: "/citizen/report", label: t('nav.reportIssue') },
        { href: "/citizen/track", label: t('nav.trackIssue') },
        { href: "/public", label: t('nav.publicDashboard') },
    ];

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
                            {/* Language Switcher */}
                            <div className="hidden md:block">
                                <LanguageSwitcher />
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
                        {/* Language Switcher in Mobile Menu */}
                        <div className="pt-2 border-t border-white/10">
                            <LanguageSwitcher />
                        </div>
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
                                <span className="font-bold text-lg">{t('common.appName')}</span>
                            </div>
                            <p className="text-blue-200 text-sm">
                                {t('footer.description')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">{t('footer.quickLinks')}</h4>
                            <ul className="space-y-2 text-blue-200 text-sm">
                                <li><Link href="/citizen/report" className="hover:text-white transition-colors">{t('footer.reportIssue')}</Link></li>
                                <li><Link href="/citizen/track" className="hover:text-white transition-colors">{t('footer.trackComplaint')}</Link></li>
                                <li><Link href="/public" className="hover:text-white transition-colors">{t('footer.publicDashboard')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">{t('footer.helpline')}</h4>
                            <div className="flex items-center gap-2 text-blue-200 text-sm">
                                <Phone className="w-4 h-4" />
                                <span>{t('footer.tollFree')}</span>
                            </div>
                            <p className="text-blue-300 text-xs mt-3">
                                {t('footer.poweredBy')}
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-5 text-center text-blue-300 text-xs">
                        {t('footer.copyright')}
                    </div>
                </div>
            </footer>
        </div>
    );
}

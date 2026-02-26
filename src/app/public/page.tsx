"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PublicDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to citizen home page
        router.replace("/citizen");
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-blue mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to home page...</p>
            </div>
        </div>
    );
}

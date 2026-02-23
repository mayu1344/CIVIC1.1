"use client";

export default function ReportPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Report a Civic Issue</h1>
                    <p className="text-gray-600 mb-6">
                        This feature requires JavaScript to be enabled and will be available once the page loads in your browser.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                        <h2 className="font-semibold text-blue-900 mb-2">How to Report:</h2>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                            <li>Fill in your contact details</li>
                            <li>Select the issue category</li>
                            <li>Describe the problem in detail</li>
                            <li>Mark the location on the map</li>
                            <li>Upload photos (optional)</li>
                            <li>Submit and get your complaint ID</li>
                        </ol>
                    </div>
                    <p className="text-xs text-gray-400 mt-6">
                        Note: This is a static preview. Full functionality will be available in the deployed version.
                    </p>
                </div>
            </div>
        </div>
    );
}

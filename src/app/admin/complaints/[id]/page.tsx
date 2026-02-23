import { MOCK_COMPLAINTS } from "@/lib/mockData";

export async function generateStaticParams() {
    return MOCK_COMPLAINTS.map((c) => ({
        id: c.id,
    }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const complaint = MOCK_COMPLAINTS.find(c => c.id === id);
    
    if (!complaint) {
        return <div className="p-8">Complaint not found</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Complaint Details</h1>
            <div className="space-y-4">
                <p><strong>ID:</strong> {complaint.complaintNumber}</p>
                <p><strong>Title:</strong> {complaint.title}</p>
                <p><strong>Status:</strong> {complaint.status}</p>
                <p><strong>Category:</strong> {complaint.category}</p>
                <p><strong>Priority:</strong> {complaint.priority}</p>
                <p><strong>Description:</strong> {complaint.description}</p>
                <p><strong>Location:</strong> {complaint.locationAddress}</p>
                <p><strong>Assigned To:</strong> {complaint.assignedOfficer}</p>
            </div>
        </div>
    );
}

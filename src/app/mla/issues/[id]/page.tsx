import { MOCK_COMPLAINTS } from "@/lib/mockData";

export async function generateStaticParams() {
    return MOCK_COMPLAINTS.map((c) => ({
        id: c.id,
    }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const issue = MOCK_COMPLAINTS.find(c => c.id === id);
    
    if (!issue) {
        return <div className="p-8">Issue not found</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Issue Details</h1>
            <div className="space-y-4">
                <p><strong>ID:</strong> {issue.complaintNumber}</p>
                <p><strong>Title:</strong> {issue.title}</p>
                <p><strong>Status:</strong> {issue.status}</p>
                <p><strong>Category:</strong> {issue.category}</p>
                <p><strong>Priority:</strong> {issue.priority}</p>
                <p><strong>Description:</strong> {issue.description}</p>
                <p><strong>Location:</strong> {issue.locationAddress}</p>
                <p><strong>Ward:</strong> {issue.ward}</p>
            </div>
        </div>
    );
}

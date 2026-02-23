import { MOCK_COMPLAINTS } from "@/lib/mockData";

export async function generateStaticParams() {
    return MOCK_COMPLAINTS.map((c) => ({
        id: c.id,
    }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const task = MOCK_COMPLAINTS.find(c => c.id === id);
    
    if (!task) {
        return <div className="p-8">Task not found</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Task Details</h1>
            <div className="space-y-4">
                <p><strong>ID:</strong> {task.complaintNumber}</p>
                <p><strong>Title:</strong> {task.title}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Category:</strong> {task.category}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                <p><strong>Description:</strong> {task.description}</p>
                <p><strong>Location:</strong> {task.locationAddress}</p>
                <p><strong>Assigned Officer:</strong> {task.assignedOfficer}</p>
                <p><strong>SLA Deadline:</strong> {new Date(task.slaDeadline).toLocaleString()}</p>
            </div>
        </div>
    );
}

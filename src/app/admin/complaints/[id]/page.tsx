import { MOCK_COMPLAINTS } from "@/lib/mockData";
import ComplaintDetailPage from "./ComplaintDetailClient";

export async function generateStaticParams() {
    return MOCK_COMPLAINTS.map((c) => ({
        id: c.id,
    }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ComplaintDetailPage params={{ id }} />;
}

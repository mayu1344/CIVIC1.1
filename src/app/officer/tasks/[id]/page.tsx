import { MOCK_COMPLAINTS } from "@/lib/mockData";
import OfficerTaskDetailPage from "./OfficerTaskDetailClient";

export async function generateStaticParams() {
    return MOCK_COMPLAINTS.map((c) => ({
        id: c.id,
    }));
}

export default function Page({ params }: { params: { id: string } }) {
    return <OfficerTaskDetailPage params={params} />;
}

import { MOCK_COMPLAINTS } from "@/lib/mockData";
import MLAIssueDetailPage from "./MLAIssueDetailClient";

export async function generateStaticParams() {
    return MOCK_COMPLAINTS.map((c) => ({
        id: c.id,
    }));
}

export default function Page({ params }: { params: { id: string } }) {
    return <MLAIssueDetailPage params={params} />;
}

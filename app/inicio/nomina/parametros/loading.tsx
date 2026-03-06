import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <DashboardLayout userRole="default">
            <div className="space-y-6">
                <div className="flex items-center gap-4 animate-pulse">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>

                <div className="pt-4">
                    <Skeleton className="h-96 w-full max-w-3xl rounded-xl" />
                </div>
            </div>
        </DashboardLayout>
    );
}

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InventoryLog, columns } from "./columns";
import { DataTable } from "./data-table";
import { useProductAPI } from "@/api/product";
import Loading from "@/components/ui/loading";

interface InventoryLogsResponse {
    limit: number;
    page: number;
    logs: InventoryLog[];
    total: number;
}

export default function ProductInventroyPage() {
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const { getInventoryLogs } = useProductAPI();

    const params = useParams();

    useEffect(() => {
        setIsMounted(true);

        const fetchLogs = async () => {
            try {
                const product_id = params.id?.toString();
                if (!product_id) {
                    return;
                }
                const response: InventoryLogsResponse = await getInventoryLogs(product_id);
                setLogs(response.logs);
            } catch (error) {
                console.error("Failed to fetch inventory logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [params.id, getInventoryLogs]);

    if (!isMounted) return null;

    if (loading) return
    <Loading />

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Inventory Logs</h1>
            <DataTable columns={columns} data={logs ?? []} />
        </div>
    );
}

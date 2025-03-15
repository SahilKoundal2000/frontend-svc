"use client";

import { useState, useEffect } from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { Order, useOrderAPI } from "@/api/order";
import Loading from "@/components/ui/loading";
import { toast } from "sonner";

interface OrdersResponse {
  limit: number;
  page: number;
  orders: Order[];
  total: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { getAllOrders, updateOrderStatus } = useOrderAPI();

  useEffect(() => {
    setIsMounted(true);

    const fetchOrders = async () => {
      try {
        const response: OrdersResponse = await getAllOrders();
        setOrders(response.orders);
      } catch (error) {
        console.error("Failed to fetch Orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshTrigger]);

  if (!isMounted) return null;

  if (loading) return <Loading />;

  const columns = getColumns(async (id, status) => {
    const resp = await updateOrderStatus(id, status);
    if (!resp) return;
    if (resp.error) {
      toast("Failed to update order status.", {
        description: resp.error.message,
      });
      return;
    }
    setRefreshTrigger((prev) => prev + 1);
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <DataTable columns={columns} data={orders ?? []} />
    </div>
  );
}

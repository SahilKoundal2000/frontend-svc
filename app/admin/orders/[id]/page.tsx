"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useOrderAPI, Order, OrderStatusUpdate } from "@/api/order";
import { format } from "date-fns";
import { Download, Calendar, Package, CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusOptions = [
  { value: "approved", label: "Approved" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById, updateOrderStatus } = useOrderAPI();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrder = async (): Promise<void> => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
        setStatus(data.status || "");
      } catch (err) {
        setError("Failed to load order details");
        console.error(err);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, getOrderById]);

  const handleStatusUpdate = async (): Promise<void> => {
    if (!id || !order) return;

    try {
      setUpdating(true);
      const statusData: OrderStatusUpdate = { status, notes };
      await updateOrderStatus(id, statusData);
      setOrder((prev) => (prev ? { ...prev, status } : null));

      toast.success("Order status updated successfully");
    } catch (err) {
      setError("Failed to update order status");
      console.error(err);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (timestamp?: string | number): string => {
    if (!timestamp) return "N/A";

    try {
      return format(
        new Date(
          typeof timestamp === "string" ? parseInt(timestamp) : timestamp
        ),
        "PPpp"
      );
    } catch {
      return "Invalid date";
    }
  };

  const calculateTotal = (
    subtotal?: number | string,
    shipping?: number | string
  ): string => {
    const sub =
      typeof subtotal === "string" ? parseFloat(subtotal) : subtotal || 0;
    const ship =
      typeof shipping === "string" ? parseFloat(shipping) : shipping || 0;
    return (sub + ship).toFixed(2);
  };

  if (loading) return <div className="p-8">Loading order details...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!order) return <div className="p-8">Order not found</div>;

  return (
    <div className="container p-6 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Order #{order.order_id}</CardTitle>
                  <CardDescription>
                    Created {formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <Badge
                  className={
                    statusColors[order.status || ""] ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {order.status || "Unknown"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="items">
                <TabsList className="mb-4">
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                </TabsList>

                <TabsContent value="items">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.product_id.toString()}>
                          <TableCell className="font-medium">
                            {item.product_name}
                            <div className="text-xs text-gray-500">
                              ID: {item.product_id}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.price?.toFixed(2) || "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            ${((item.price || 0) * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-medium"
                        >
                          Subtotal
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {typeof order.subtotal === "number"
                            ? order.subtotal.toFixed(2)
                            : "0.00"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-medium"
                        >
                          Shipping
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {typeof order.shipping_cost === "number"
                            ? order.shipping_cost.toFixed(2)
                            : "0.00"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${calculateTotal(order.subtotal, order.shipping_cost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="details">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Order Dates
                        </h3>
                        <div className="text-sm">
                          <div className="mb-1">
                            <span className="font-medium">Created:</span>{" "}
                            {formatDate(order.created_at)}
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span>{" "}
                            {formatDate(order.updated_at)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payment
                        </h3>
                        <div className="text-sm">
                          <div className="mb-1">
                            <span className="font-medium">Status:</span>{" "}
                            <Badge
                              variant={
                                order.payment_status === "complete"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {order.payment_status || "Unknown"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="mb-1">
                            <span className="font-medium">Transaction Id:</span>{" "}
                            {order.transaction_id || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Customer
                      </h3>
                      <div className="text-sm">
                        <div className="mb-1">
                          <span className="font-medium">ID:</span>{" "}
                          {order.customer_id}
                        </div>
                      </div>
                    </div>

                    {order.prescription_url && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-2">Prescription</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(order.prescription_url)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            View Prescription
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Update Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Order Status</SelectLabel>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="Add notes about this status update"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || status === order.status}
                className="w-full"
              >
                {updating ? "Updating..." : "Update Status"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

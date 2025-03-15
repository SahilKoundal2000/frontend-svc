"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "sonner";
import { Order, OrderItem, OrderStatusUpdate } from "@/api/order";

export const getColumns = (
  onUpdateOrderStatus: (
    orderId: string | number,
    statusUpdate: OrderStatusUpdate
  ) => void
): ColumnDef<Order>[] => [
  {
    accessorKey: "order_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const orderId: string = row.getValue("order_id");
      const displayId = `${orderId.substring(0, 8)}...`;

      return (
        <Link href={`/admin/orders/${orderId}`} className="hover:underline">
          {displayId}
        </Link>
      );
    },
  },
  {
    accessorKey: "customer_id",
    header: "Customer",
    cell: ({ row }) => {
      const customerId: string | null = row.getValue("customer_id");
      if (!customerId) return <span className="text-gray-400">N/A</span>;

      const displayId = `${customerId.substring(0, 8)}...`;

      return (
        <Link
          href={`/admin/customers/${customerId}`}
          className="hover:underline"
        >
          {displayId}
        </Link>
      );
    },
  },
  {
    accessorKey: "items",
    header: "Products",
    enableSorting: false,
    cell: ({ row }) => {
      const items = row.getValue("items") as OrderItem[];
      return (
        <div className="max-w-[250px]">
          {items.map((item, index) => (
            <div key={index} className="text-xs">
              {item.quantity} x {item.product_name}
              {index < items.length - 1 && ", "}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const order = row.original;
      const subtotal = order.subtotal ?? calculateSubtotal(order.items);
      const shipping = order.shipping_cost ?? 0;
      const total = subtotal + shipping;

      const formattedSubtotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(subtotal);

      const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(total);

      return (
        <div>
          <div>{formattedSubtotal}</div>
          {shipping > 0 && (
            <div className="text-xs text-gray-500">Total: {formattedTotal}</div>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const orderA = rowA.original;
      const orderB = rowB.original;

      const subtotalA = orderA.subtotal ?? calculateSubtotal(orderA.items);
      const subtotalB = orderB.subtotal ?? calculateSubtotal(orderB.items);

      return subtotalA - subtotalB;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string | undefined;

      if (!status) return <span className="text-gray-400">N/A</span>;

      // Define status styles based on the status value
      const getStatusStyle = (status: string) => {
        switch (status) {
          case "paid":
            return "bg-green-100 text-green-800 hover:bg-green-200";
          case "payment_pending":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
          case "shipped":
          case "approved":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200";
          case "completed":
            return "bg-purple-100 text-purple-800 hover:bg-purple-200";
          case "cancelled":
          case "payment_failed":
            return "bg-red-100 text-red-800 hover:bg-red-200";
          default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200";
        }
      };

      return (
        <Badge className={`${getStatusStyle(status)} cursor-default`}>
          {status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "prescription_url",
    header: "Prescription",
    enableSorting: false,
    cell: ({ row }) => {
      const prescriptionUrl = row.getValue("prescription_url") as
        | string
        | undefined;

      if (!prescriptionUrl) {
        return <span className="text-gray-400">N/A</span>;
      }

      return (
        <a
          href={prescriptionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FileText className="h-4 w-4 mr-1" />
          View
        </a>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at");

      if (!createdAt) {
        return <span className="text-gray-400">N/A</span>;
      }

      // Handle both string dates and timestamps
      let date: Date;
      if (typeof createdAt === "string") {
        date = new Date(createdAt);
      } else if (typeof createdAt === "number") {
        date = new Date(createdAt);
      } else {
        return <span className="text-gray-400">N/A</span>;
      }

      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;

      return (
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(String(order.order_id))
                }
              >
                Copy order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem>Update Status</DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/admin/orders/${order.order_id}`}>
                  View Order Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent className="sm:max-w-[425px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const newStatus = formData.get("status") as string;
                const notes = formData.get("notes") as string;

                if (!newStatus) {
                  toast("Invalid Status", {
                    description: "Please select a status",
                  });
                  return;
                }

                const statusUpdate: OrderStatusUpdate = {
                  status: newStatus,
                  notes: notes || undefined,
                };

                onUpdateOrderStatus(order.order_id, statusUpdate);
              }}
            >
              <DialogHeader>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogDescription>
                  Update the status for order{" "}
                  {String(order.order_id).substring(0, 8)}...
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={order.status}>
                    <SelectTrigger className="w-[280px]" id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Order Status</SelectLabel>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="align-top pt-2">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Optional notes about this status change"
                    className="w-[280px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    },
  },
];

// Helper function to calculate subtotal from items
function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    const price = item.price ?? 0;
    return total + price * item.quantity;
  }, 0);
}

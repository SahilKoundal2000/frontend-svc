"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Product, StockUpdate } from "@/api/product";
import { toast } from "sonner";

export const getColumns = (
  onDeleteProduct: (productId: string) => void,
  onUpdateStock: (productId: string, stockUpdate: StockUpdate) => void
): ColumnDef<Product>[] => [
  {
    accessorKey: "image_url",
    enableColumnFilter: false,
    enableSorting: false,
    header: "Image",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="relative h-12 w-12">
          {product.image_url ? (
            <Link href={`/admin/products/${product.id}`}>
              <Image
                src={product.image_url}
                alt={`Image of ${row.getValue("name")}`}
                fill
                className="object-cover rounded-md"
                sizes="48px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.svg";
                }}
              />
            </Link>
          ) : (
            <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
              No Img
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return <Link href={`/admin/products/${product.id}`}>{product.name}</Link>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    enableSorting: false,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "requires_prescription",
    header: "Requires Prescription",
    cell: ({ row }) => (
      <span>{row.getValue("requires_prescription") ? "Yes" : "No"}</span>
    ),
  },
  {
    id: "actions",
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;

      return (
        <AlertDialog>
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
                    navigator.clipboard.writeText(product.id!.toString())
                  }
                >
                  Copy product ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem>Update Stock</DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem>
                  <Link href={"/admin/products/" + product.id + "/logs"}>
                    View Inventory
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={"/admin/products/" + product.id + "/update"}>
                    Update Product
                  </Link>
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem>Delete Product</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent className="sm:max-w-[425px]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const quantity_change = parseInt(
                    formData.get("quantity_change") as string
                  );
                  const reason = formData.get("reason") as string;
                  if (quantity_change === 0 || isNaN(quantity_change)) {
                    {
                      toast("Invalid Quantity Value", {
                        description: "Quantity cannot be 0 or empty",
                      });
                      return;
                    }
                  }
                  onUpdateStock(product.id!.toString(), {
                    quantity_change,
                    reason,
                  });
                }}
              >
                <DialogHeader>
                  <DialogTitle>Update Stock</DialogTitle>
                  <DialogDescription>
                    Update the stock for the product.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity">Stock Change</Label>

                    <Input
                      id="quantity"
                      className="w-[280px]"
                      type="number"
                      name="quantity_change"
                      min={0}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason">Change Reason</Label>

                    <Select name="reason">
                      <SelectTrigger className="w-[280px]" id="reason">
                        <SelectValue placeholder="Select change reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Change Reason</SelectLabel>
                          <SelectItem value="stock_added">Restock</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                product from the server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeleteProduct(product.id!.toString())}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];

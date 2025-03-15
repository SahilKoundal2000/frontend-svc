"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useOrderAPI, Order } from "@/api/order";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  ChevronRight,
  Package,
  ChevronDown,
  Filter,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

const statusColorMap: Record<string, string> = {
  payment_pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  paid: "bg-green-100 text-green-800 hover:bg-green-100",
  processing: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  shipped: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  delivered: "bg-teal-100 text-teal-800 hover:bg-teal-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
};

const formatStatus = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SortingState {
  sortBy: string;
  sortOrder: string;
}

interface FilterState {
  column: string;
  operator: string;
  value: string;
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getCustomerOrders, generatePaymentURL } = useOrderAPI();
  const router = useRouter();

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [sorting, setSorting] = useState<SortingState>({
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const [filter, setFilter] = useState<FilterState | null>(null);

  const filterForm = useForm({
    defaultValues: {
      filterColumn: "",
      filterOperator: "eq",
      filterValue: "",
    },
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sorting.sortBy,
        sort_order: sorting.sortOrder,
      };

      if (filter && filter.column && filter.operator && filter.value) {
        params.filter_column = filter.column;
        params.filter_operator = filter.operator;
        params.filter_value = filter.value;
      }

      const response = await getCustomerOrders(params);

      setOrders(response.orders || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / pagination.limit),
      });

      setError(null);
    } catch (err) {
      setError("Failed to load your orders. Please try again later.");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    sorting.sortBy,
    sorting.sortOrder,
    filter,
    getCustomerOrders,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderClick = (orderId: string | number) => {
    router.push(`/orders/${orderId}`);
  };

  const handlePayNow = async (
    e: React.MouseEvent,
    orderId: string | number
  ) => {
    e.stopPropagation();
    try {
      const paymentData = await generatePaymentURL(orderId);
      router.push(paymentData.payment_url);
    } catch (err) {
      console.error("Error generating payment URL:", err);
      alert("Failed to process payment. Please try again.");
    }
  };

  const calculateTotal = (order: Order) => {
    const subtotal = order.subtotal || 0;
    const shipping = order.shipping_cost || 0;
    return (subtotal + shipping).toFixed(2);
  };

  const formatDate = (timestamp: string | number) => {
    if (!timestamp) return "N/A";
    return format(new Date(Number(timestamp)), "MMM d, yyyy");
  };

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination({ ...pagination, page: newPage });
  };

  const handleSortChange = (sortBy: string) => {
    setSorting((prev) => {
      if (prev.sortBy === sortBy) {
        return {
          sortBy,
          sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
        };
      }
      return {
        sortBy,
        sortOrder: "desc",
      };
    });
  };

  const applyFilter = (data: {
    filterColumn: string;
    filterOperator: string;
    filterValue: string;
  }) => {
    setFilter({
      column: data.filterColumn,
      operator: data.filterOperator,
      value: data.filterValue,
    });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilter = () => {
    setFilter(null);
    filterForm.reset({
      filterColumn: "",
      filterOperator: "eq",
      filterValue: "",
    });
  };

  const getOperatorDisplay = (operator: string): string => {
    switch (operator) {
      case "eq":
        return "equals";
      case "gt":
        return "greater than";
      case "lt":
        return "less than";
      case "ilike":
        return "contains";
      default:
        return operator;
    }
  };

  const getColumnDisplay = (column: string): string => {
    switch (column) {
      case "status":
        return "Status";
      case "created_at":
        return "Date";
      case "subtotal":
        return "Total Amount";
      case "order_id":
        return "Order ID";
      default:
        return column;
    }
  };

  const getPaginationRange = () => {
    const { page, totalPages } = pagination;
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const range = [1];

    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    if (page <= 3) {
      end = Math.min(totalPages - 1, 4);
    } else if (page >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }

    if (start > 2) {
      range.push(-1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (end < totalPages - 1) {
      range.push(-1);
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  if (loading && pagination.page === 1) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
          <Card>
            <CardContent className="pt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-4">
                  <Skeleton className="h-24 w-full rounded-md mb-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.refresh()}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>

          <div className="flex items-center gap-2">
            {/* Per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show:</span>
              <Select
                value={pagination.limit.toString()}
                onValueChange={(value) => {
                  setPagination({
                    ...pagination,
                    limit: Number(value),
                    page: 1,
                  });
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("created_at")}
                  >
                    Date{" "}
                    {sorting.sortBy === "created_at" &&
                      (sorting.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("status")}>
                    Status{" "}
                    {sorting.sortBy === "status" &&
                      (sorting.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("subtotal")}
                  >
                    Total{" "}
                    {sorting.sortBy === "subtotal" &&
                      (sorting.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-1 h-4 w-4" /> Filter
                  {filter && (
                    <Badge
                      className="ml-1 bg-blue-100 text-blue-800"
                      variant="secondary"
                    >
                      1
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Orders</SheetTitle>
                  <SheetDescription>
                    Apply filters to narrow down your order list
                  </SheetDescription>
                </SheetHeader>

                <div className="py-4">
                  <Form {...filterForm}>
                    <form
                      onSubmit={filterForm.handleSubmit(applyFilter)}
                      className="space-y-4"
                    >
                      <FormField
                        control={filterForm.control}
                        name="filterColumn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Filter by</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="created_at">Date</SelectItem>
                                <SelectItem value="subtotal">
                                  Total Amount
                                </SelectItem>
                                <SelectItem value="order_id">
                                  Order ID
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={filterForm.control}
                        name="filterOperator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="eq">Equals</SelectItem>
                                <SelectItem value="gt">Greater than</SelectItem>
                                <SelectItem value="lt">Less than</SelectItem>
                                <SelectItem value="ilike">Contains</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={filterForm.control}
                        name="filterValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter value" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <SheetFooter className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearFilter}
                        >
                          Clear Filter
                        </Button>
                        <SheetClose asChild>
                          <Button type="submit">Apply Filter</Button>
                        </SheetClose>
                      </SheetFooter>
                    </form>
                  </Form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Applied filter indicator */}
        {filter && (
          <div className="mb-4 flex items-center">
            <span className="text-sm text-gray-500 mr-2">Active filter:</span>
            <Badge className="bg-blue-50 text-blue-800 mr-2 flex items-center gap-1">
              {getColumnDisplay(filter.column)}{" "}
              {getOperatorDisplay(filter.operator)} &quot;{filter.value}&quot;
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-100"
                onClick={clearFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium">No orders yet</h3>
              <p className="text-gray-500 mt-2">
                When you place orders, they will appear here
              </p>
              <Button className="mt-6" onClick={() => router.push("/products")}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {/* Loading overlay when fetching new page data */}
              {loading && pagination.page > 1 && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}

              {orders.map((order) => (
                <Card
                  key={order.order_id}
                  className="hover:border-gray-400 transition-all"
                >
                  <CardHeader
                    className="pb-2 cursor-pointer"
                    onClick={() => handleOrderClick(order.order_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.order_id.toString().slice(-8)}
                        </CardTitle>
                        <CardDescription>
                          Placed on {formatDate(order.created_at || "")}
                        </CardDescription>
                      </div>
                      <Badge
                        className={
                          statusColorMap[order.status || ""] || "bg-gray-100"
                        }
                      >
                        {formatStatus(order.status || "")}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="text-sm text-gray-500 mb-3">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"} · $
                      {calculateTotal(order)}
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="items">
                        <AccordionTrigger className="text-sm py-2">
                          View Order Items
                        </AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableBody>
                              {order.items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">
                                    {item.product_name}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.quantity} × ${item.price?.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    $
                                    {(
                                      item.quantity * (item.price || 0)
                                    ).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {order.shipping_cost ? (
                                <TableRow>
                                  <TableCell className="font-medium">
                                    Shipping
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell className="text-right">
                                    ${order.shipping_cost.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ) : null}
                              <TableRow>
                                <TableCell className="font-medium">
                                  Total
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right font-bold">
                                  ${calculateTotal(order)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="flex justify-between items-center mt-4">
                      <div>
                        {order.prescription_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(order.prescription_url, "_blank");
                            }}
                          >
                            View Prescription{" "}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {order.status === "payment_pending" && (
                          <Button
                            size="sm"
                            onClick={(e) => handlePayNow(e, order.order_id)}
                          >
                            Pay Now
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order.order_id);
                          }}
                        >
                          View Details <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination component */}
            {pagination.totalPages > 0 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => changePage(pagination.page - 1)}
                        className={
                          pagination.page <= 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {getPaginationRange().map((pageNum, i) =>
                      pageNum === -1 ? (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => changePage(pageNum)}
                            isActive={pageNum === pagination.page}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => changePage(pagination.page + 1)}
                        className={
                          pagination.page >= pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <div className="text-center text-sm text-gray-500 mt-2">
                  Showing {orders.length} of {pagination.total} orders
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

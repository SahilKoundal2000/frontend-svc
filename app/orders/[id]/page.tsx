"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Order, useOrderAPI } from "@/api/order";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CircleAlert,
  Clock,
  CreditCard,
  FileText,
  PackageOpen,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/main-layout";
import Loading from "@/components/ui/loading";
import { AxiosError } from "axios";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getOrderById, generatePaymentURL } = useOrderAPI();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openPrescription, setOpenPrescription] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOrderById(id!.toString());
      setOrder(response);
      setError(null);
    } catch {
      setError("Failed to load order details. Please try again.");
      toast("Failed to load order details", {
        description: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  }, [getOrderById, id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [id, fetchOrderDetails]);

  const handleGeneratePaymentUrl = async () => {
    setPaymentLoading(true);
    try {
      const response = await generatePaymentURL(id!.toString());
      if (response.payment_url) {
        router.push(response.payment_url);
        toast("Payment URL Generated", {
          description: "Redirecting to payment page",
        });
        fetchOrderDetails();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast("Failed to Generate Payment URL.", {
          description:
            error.response?.data.message || "An unknown error occurred.",
        });
      } else {
        toast("Failed to Generate Payment URL.", {
          description: "An unknown error occurred.",
        });
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  type OrderStatus =
    | "payment_pending"
    | "payment_failed"
    | "approved"
    | "paid"
    | "shipped"
    | "completed"
    | "cancelled";

  const getStatusColor = (
    status: OrderStatus | string | null | undefined
  ): string => {
    const statusMap: Record<string, string> = {
      payment_pending: "bg-yellow-500",
      payment_failed: "bg-red-500",
      approved: "bg-blue-500",
      paid: "bg-green-500",
      shipped: "bg-purple-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };

    if (!status) return "bg-gray-500";

    return statusMap[status.toLowerCase()] || "bg-gray-500";
  };

  const formatDate = (dateString: number | string | undefined) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const formatCurrency = (amount: number | bigint | null | undefined) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const canGeneratePaymentUrl =
    order?.status?.toLowerCase() === "payment_pending";

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <MainLayout>
        <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            onClick={() => router.push("/orders")}
            className="mt-4"
          >
            Back to Orders
          </Button>
        </Alert>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <Alert className="max-w-2xl mx-auto mt-8">
          <AlertTitle>Order Not Found</AlertTitle>
          <AlertDescription>
            The requested order could not be found.
          </AlertDescription>
          <Button
            variant="outline"
            onClick={() => router.push("/orders")}
            className="mt-4"
          >
            Back to Orders
          </Button>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Button variant="outline" onClick={() => router.push("/orders")}>
            Back to Orders
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={`${getStatusColor(
                  order.status
                )} text-white px-3 py-1.5 text-sm font-medium`}
              >
                {order.status?.toUpperCase() || "N/A"}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">
                Last Updated: {formatDate(order.updated_at)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={`${getStatusColor(
                  order.payment_status
                )} text-white px-3 py-1.5 text-sm font-medium`}
              >
                {order.payment_status?.toUpperCase() || "UNPAID"}
              </Badge>
              <div className="mt-4">
                {canGeneratePaymentUrl &&
                order.payment_status !== "complete" ? (
                  <Button
                    onClick={handleGeneratePaymentUrl}
                    disabled={paymentLoading}
                    className="w-full"
                  >
                    {paymentLoading ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Processing...
                      </>
                    ) : (
                      "Generate Payment Link"
                    )}
                  </Button>
                ) : order.payment_status === "complete" ? (
                  <p className="text-sm text-green-600 font-medium">
                    This order has already been paid.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Payment processing not available for current order status.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Order ID:</span>
                  <span className="font-medium">{order.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Order Date:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Amount:</span>
                  <span className="font-bold">
                    {formatCurrency(
                      order.subtotal + (order.shipping_cost ?? 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Items:</span>
                  <span>{order.items?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PackageOpen className="mr-2 h-5 w-5" />
              Order Items
            </CardTitle>
            <CardDescription>Items included in your order</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.product_name || `Product #${item.product_id}`}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price! * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {order.items && order.items.length > 0 && (
                <TableBody className="border-t">
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Subtotal:
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.subtotal)}
                    </TableCell>
                  </TableRow>
                  {order.shipping_cost && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Shipping:
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.shipping_cost)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Total:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(
                        order.subtotal + (order.shipping_cost ?? 0)
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_address ? (
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {order.shipping_address.name}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {order.shipping_address.address_line1}
                  </p>
                  {order.shipping_address.address_line2 && (
                    <p>{order.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.postal_code}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.shipping_address.phone}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No shipping details available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.prescription_url ? (
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    {order.prescription_url.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={`${order.prescription_url}#toolbar=0&navpanes=0`}
                        title="Prescription PDF"
                        className="w-full h-40 border-none"
                        onError={(e) => {
                          const container = e.currentTarget.parentElement;
                          if (container) {
                            const fallbackElement =
                              document.createElement("div");
                            fallbackElement.className =
                              "flex items-center justify-center h-40 bg-gray-100";
                            fallbackElement.innerHTML =
                              '<div class="flex flex-col items-center justify-center"><FileText class="h-10 w-10 text-gray-400" /><p class="mt-2 text-gray-500">PDF Preview Unavailable</p></div>';
                            container.replaceChild(
                              fallbackElement,
                              e.currentTarget
                            );
                          }
                        }}
                      />
                    ) : (
                      <Image
                        src={order.prescription_url}
                        alt="Prescription"
                        width={400}
                        height={300}
                        objectFit="cover"
                        className="w-full h-auto max-h-40 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/400/300";
                          e.currentTarget.alt =
                            "Prescription (Cannot be displayed)";
                        }}
                      />
                    )}
                  </div>
                  <Dialog
                    open={openPrescription}
                    onOpenChange={setOpenPrescription}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View Full Prescription
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full max-h-screen overflow-auto">
                      <DialogHeader>
                        <DialogTitle>Prescription</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        {order.prescription_url
                          .toLowerCase()
                          .endsWith(".pdf") ? (
                          <iframe
                            src={`${order.prescription_url}#toolbar=1&navpanes=1`}
                            title="Prescription PDF"
                            className="w-full h-screen max-h-[70vh] border-none"
                          />
                        ) : (
                          <div className="flex justify-center">
                            <Image
                              src={order.prescription_url}
                              alt="Prescription"
                              width={800}
                              height={600}
                              className="max-h-[70vh] w-auto object-contain"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/api/placeholder/800/600";
                                e.currentTarget.alt =
                                  "Prescription (Cannot be displayed)";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <p className="text-gray-500">No prescription uploaded</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Having issues with your order?
                </AccordionTrigger>
                <AccordionContent>
                  If you&apos;re experiencing any issues with your order, please
                  contact our customer support team at support@pharmakart.com.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Want to return or cancel your order?
                </AccordionTrigger>
                <AccordionContent>
                  Returns and cancellations are subject to our policies. Please
                  note that orders that have already been shipped cannot be
                  cancelled. For returns, please initiate the process within 7
                  days of receiving the order.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-between">
            {["pending", "processing"].includes(
              order.status!.toLowerCase()
            ) && <Button variant="destructive">Cancel Order</Button>}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}

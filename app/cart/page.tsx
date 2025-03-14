"use client";

import { useCart } from "@/context/cartContext";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  FileUp,
  CheckCircle2,
  X,
  LogIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, ChangeEvent } from "react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MainLayout from "@/components/layout/main-layout";
import { toast } from "sonner";

export default function CartPage() {
  const { state: cart, updateQuantity, removeItem, clearCart } = useCart();
  const { token } = useAuth();
  const [isOrdering, setIsOrdering] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionFileName, setPrescriptionFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!token;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "discount10") {
      const discountAmount = cart.total * 0.1;
      setDiscount(discountAmount);
      setPromoApplied(true);
      toast("Promo code applied", {
        description: "10% discount has been applied to your order.",
      });
    } else {
      toast("Invalid promo code", {
        description: "The promo code you entered is invalid or expired.",
        richColors: true,
      });
    }
  };

  const handlePrescriptionUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast("Invalid file type", {
          description: "Please upload a PDF, JPEG, or PNG file.",
          richColors: true,
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast("File too large", {
          description: "Prescription file must be less than 5MB in size.",
          richColors: true,
        });
        return;
      }

      setPrescriptionFile(file);
      setPrescriptionFileName(file.name);
      toast("Prescription uploaded", {
        description: "Your prescription has been attached to your order.",
      });
    }
  };

  const handleRemovePrescription = () => {
    setPrescriptionFile(null);
    setPrescriptionFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    if (!isAuthenticated) {
      toast("Authentication required", {
        description: "Please log in to upload prescriptions.",
        richColors: true,
      });
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleOrderNow = () => {
    if (!isAuthenticated) {
      toast("Authentication required", {
        description: "Please log in to complete your order.",
        richColors: true,
      });
      return;
    }

    setIsOrdering(true);

    const prescriptionRequired = cart.items.some(
      (item) => item.requires_prescription
    );

    if (prescriptionRequired && !prescriptionFile) {
      toast("Prescription Required", {
        description:
          "Some items in your cart require a valid prescription. Please upload it before checkout.",
        richColors: true,
      });
      setIsOrdering(false);
      return;
    }

    // TODO: Implement order processing logic
    setTimeout(() => {
      clearCart();
      setPrescriptionFile(null);
      setPrescriptionFileName("");
      setIsOrdering(false);
      toast("Order placed successfully!", {
        description:
          "Your order has been placed and will be processed shortly.",
      });
    }, 1500);
  };

  const itemCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const subtotal = cart.total;
  const shippingCost = subtotal > 100 ? 0 : 10;
  const total = subtotal - discount + shippingCost;

  const hasPrescriptionItems = cart.items.some(
    (item) => item.requires_prescription
  );

  if (cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
          <Card className="w-full border-dashed">
            <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center">
              <ShoppingBag size={64} className="text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <Link href="/products">
                <Button>
                  <ArrowLeft size={16} className="mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <h1 className="text-2xl font-bold mb-8">
          Shopping Cart ({itemCount} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>

              <CardContent>
                {cart.items.map((item) => (
                  <div key={item.id} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="h-24 w-24 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 sm:ml-4 mt-4 sm:mt-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            <p className="text-muted-foreground">
                              ID: {item.id}
                            </p>
                            {item.requires_prescription && (
                              <div className="mt-1 inline-flex items-center text-amber-600 text-sm font-medium">
                                <AlertCircle size={14} className="mr-1" />
                                Prescription Required
                              </div>
                            )}
                          </div>
                          <div className="mt-2 sm:mt-0 sm:text-right">
                            <div className="font-medium">
                              {formatPrice(item.price)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity > 1
                                ? `${formatPrice(item.price)} each`
                                : ""}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border rounded">
                            <Button
                              variant={"ghost"}
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 text-center border-0 focus-visible:ring-0"
                            />
                            <Button
                              variant={"ghost"}
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 size={16} className="mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator className="mt-6" />
                  </div>
                ))}
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/products">
                    <ArrowLeft size={16} className="mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => clearCart()}
                >
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Review your order details before checkout
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </span>
                </div>

                {shippingCost === 0 && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>
                      You&apos;ve qualified for free shipping!
                    </AlertDescription>
                  </Alert>
                )}

                {hasPrescriptionItems && (
                  <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertDescription className="flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      Some items require a valid prescription
                    </AlertDescription>
                  </Alert>
                )}

                {!isAuthenticated && (
                  <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                    <AlertDescription className="flex items-center">
                      <LogIn size={16} className="mr-2" />
                      Please log in to complete your order
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="pt-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={promoApplied || !promoCode}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="text-green-600 text-sm mt-1">
                      Promo code applied successfully!
                    </p>
                  )}
                </div>

                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handlePrescriptionUpload}
                />

                {hasPrescriptionItems && (
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Prescription</p>

                    {!prescriptionFile ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        size="lg"
                        onClick={triggerFileUpload}
                      >
                        <FileUp size={16} className="mr-2" />
                        Upload Prescription
                      </Button>
                    ) : (
                      <div className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <CheckCircle2
                              size={16}
                              className="text-green-600 mr-2"
                            />
                            <div className="text-sm font-medium truncate max-w-52">
                              {prescriptionFileName}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePrescription}
                            className="h-8 w-8 p-0"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepted formats: PDF, JPEG, PNG (max 5MB)
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                {!isAuthenticated ? (
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/auth/login">
                      <LogIn size={18} className="mr-2" />
                      Log in to Checkout
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleOrderNow}
                    disabled={
                      isOrdering || (hasPrescriptionItems && !prescriptionFile)
                    }
                  >
                    {isOrdering ? "Processing..." : "Order Now"}
                  </Button>
                )}
              </CardFooter>
            </Card>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                By placing your order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

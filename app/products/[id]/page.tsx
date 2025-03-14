"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  Share2,
  Shield,
  Truck,
  RefreshCcw,
  Star,
  Info,
  FileText,
} from "lucide-react";
import { getProductById, Product } from "@/api/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MainLayout from "@/components/layout/main-layout";
import Image from "next/image";

const SingleProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProductById(id!.toString());
        setProduct(data);
      } catch (err) {
        setError("Failed to load product information. Please try again.");
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    console.log(`Adding ${quantity} of ${product!.name} to cart`);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    if (product && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div>
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-8 w-1/4 mb-8" />
            <Skeleton className="h-32 w-full mb-8" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/products")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!product) return null;

  const hasDosageInfo =
    product.description &&
    (product.description.toLowerCase().includes("mg") ||
      product.description.toLowerCase().includes("ml") ||
      product.description.toLowerCase().includes("dose"));

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 2);

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "short",
      day: "numeric",
    };
    return deliveryDate.toLocaleDateString("en-US", options);
  };

  const generateAdvantages = () => {
    const advantages = [];
    if (product.stock > 10) {
      advantages.push("Fast shipping - ships today");
    } else {
      advantages.push("Limited stock available");
    }
    if (product.price < 20) {
      advantages.push("Great value medication");
    } else if (product.price >= 20 && product.price < 50) {
      advantages.push("Premium quality formula");
    } else {
      advantages.push("Professional grade medication");
    }

    advantages.push("Genuine authorized product");
    return advantages;
  };

  const advantages = generateAdvantages();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/products")}
            className="sm:w-auto w-full justify-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>

          <div className="flex items-center text-sm text-gray-500">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>Products</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900 truncate max-w-xs">
              {product.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div
            className={`rounded-xl p-6 bg-secondary flex items-center justify-center`}
          >
            <div className="relative w-full max-w-lg mx-auto">
              {product.stock < 5 && product.stock > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              )}

              {product.requires_prescription && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge
                    variant={"outline"}
                    className="bg-purple-100 text-purple-700 border-purple-200"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Prescription Required
                  </Badge>
                </div>
              )}

              <div className="rounded-lg overflow-hidden bg-secondary aspect-square flex items-center justify-center p-8 shadow-md">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Shield className="h-24 w-24 mb-4 opacity-30" />
                    <span className="text-sm">Product image coming soon</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6">
                <Card className="bg-background">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <Truck className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Fast Delivery</span>
                  </CardContent>
                </Card>

                <Card className="bg-background">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <Shield className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Quality Assured</span>
                  </CardContent>
                </Card>

                <Card className="bg-background">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <RefreshCcw className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Easy Returns</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-auto">
              <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-current text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  (Trusted Medication)
                </span>
              </div>

              {product.requires_prescription && (
                <div className="mb-4">
                  <Alert className="bg-purple-50 text-purple-800 border-purple-200">
                    <FileText className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      This medication requires a valid prescription from a
                      licensed healthcare provider.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold">
                  ${product.price.toFixed(2)}
                </span>
                {product.price > 20 && (
                  <Badge
                    variant="outline"
                    className="ml-3 bg-green-50 text-green-600 border-green-200"
                  >
                    Free Shipping
                  </Badge>
                )}
              </div>

              <div className="mb-8">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Availability</h3>
                <div className="flex items-center gap-2">
                  {product.stock > 0 ? (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      <span>
                        {product.stock > 10
                          ? "In Stock - Ready to Ship"
                          : `Limited Stock (${product.stock} available)`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Info className="h-5 w-5 text-red-500" />
                      <span className="text-red-500">
                        Currently Out of Stock
                      </span>
                    </>
                  )}
                </div>

                {product.stock > 0 && (
                  <div className="text-sm text-gray-500 mt-2">
                    Order within 4 hours for same-day dispatch
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h3 className="font-medium mb-2">Product Highlights</h3>
                <ul className="space-y-2">
                  {advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <Separator className="mb-6" />

              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="rounded-r-none h-12"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-16 flex items-center justify-center border-x">
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={!product.stock || quantity >= product.stock}
                    className="rounded-l-none h-12"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-grow flex gap-2">
                  <Button
                    className="flex-grow h-12 text-base transition-all"
                    variant={addedToCart ? "outline" : "default"}
                    disabled={!product.stock}
                    onClick={handleAddToCart}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="mr-2 h-5 w-5" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                      </>
                    )}
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share Product</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                {product.stock > 0 ? (
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    <span>
                      Estimated delivery:{" "}
                      <strong>{getEstimatedDelivery()}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <Info className="h-4 w-4 mr-2" />
                    <span>
                      We&apos;ll notify you when this item is back in stock
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="faq">FAQs</TabsTrigger>
            </TabsList>

            <TabsContent
              value="details"
              className="rounded-lg border bg-card p-6"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">About This Product</h3>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-700">{product.description}</p>

                    <div className="mt-4">
                      <p className="text-gray-700">
                        {product.name} is designed to provide reliable
                        therapeutic outcomes. Always follow your healthcare
                        provider&apos;s instructions regarding dosage and usage.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Specifications</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Product Code</span>
                        <span className="font-medium">{product.id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">
                          Prescription Required
                        </span>
                        <span
                          className={`font-medium ${
                            product.requires_prescription
                              ? "text-purple-700"
                              : "text-green-600"
                          }`}
                        >
                          {product.requires_prescription ? "Yes" : "No"}
                        </span>
                      </div>
                      {hasDosageInfo && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Strength/Dosage</span>
                          <span className="font-medium">
                            {product.description.match(
                              /\d+(\.\d+)?(\s)?(mg|ml|mcg|g)/i
                            )?.[0] || "See description"}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Unit Price</span>
                        <span className="font-medium">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Availability</span>
                        <span
                          className={`font-medium ${
                            product.stock > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock > 0
                            ? `In Stock (${product.stock})`
                            : "Out of Stock"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Storage</span>
                        <span className="font-medium">
                          Store in a cool, dry place
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Important Notes</h4>
                  <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertDescription>
                      For medical advice, please consult your healthcare
                      provider. This product information is not intended to
                      diagnose, treat, cure, or prevent any disease.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="shipping"
              className="rounded-lg border bg-card p-6"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Shipping & Returns</h3>

                <div className="grid gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Shipping Information</h4>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>Free standard shipping on orders over $50</span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>
                          Standard shipping (3-5 business days): $4.99
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>Express shipping (1-2 business days): $9.99</span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>
                          Same-day delivery available for select areas (order
                          before 1 PM)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Return Policy</h4>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>Easy returns within 30 days of delivery</span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>
                          Unopened products in original packaging are eligible
                          for full refunds
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <Info className="h-5 w-5 text-amber-500 shrink-0" />
                        <span>
                          Prescription medications are non-returnable per
                          regulatory requirements
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="rounded-lg border bg-card p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Frequently Asked Questions
                </h3>

                <div className="space-y-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="question-1">
                      <AccordionTrigger>
                        How should I store this medication?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        Store in a cool, dry place away from direct sunlight and
                        moisture. Keep out of reach of children. Unless
                        specified otherwise, store at room temperature (59-86°F
                        or 15-30°C).
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="question-2">
                      <AccordionTrigger>
                        Do I need a prescription for this product?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        {product.requires_prescription
                          ? "Yes, this product requires a valid prescription from a licensed healthcare provider. You'll need to upload your prescription during checkout."
                          : "No, this product is available over-the-counter and does not require a prescription."}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {product.requires_prescription && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="question-prescription">
                        <AccordionTrigger>
                          How do I submit my prescription?
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          You can upload a digital copy of your prescription
                          during checkout. We accept images or PDF files.
                          Alternatively, your healthcare provider can send the
                          prescription directly to our pharmacy. All
                          prescriptions are verified by our licensed pharmacists
                          before processing your order.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  <Accordion type="single" collapsible>
                    <AccordionItem value="question-3">
                      <AccordionTrigger>
                        Is this medication covered by insurance?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        Coverage varies by insurance provider and plan. We
                        recommend checking with your insurance company directly
                        to determine coverage and potential reimbursement
                        options.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="question-4">
                      <AccordionTrigger>
                        Are there any drug interactions I should be aware of?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        All medications have potential for drug interactions.
                        Always inform your healthcare provider about all
                        medications, supplements, and herbal products you use.
                        Our pharmacist can provide specific guidance regarding
                        this product.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default SingleProductPage;

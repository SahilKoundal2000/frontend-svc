"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCcw,
  Image as ImageIcon,
  Package,
  FileText,
} from "lucide-react";
import { getProductById, Product, useProductAPI } from "@/api/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
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
import { toast } from "sonner";

const AdminProductPage = () => {
  const { deleteProduct } = useProductAPI();
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDeleteProduct = async (productId: string) => {
    setIsDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully.");
      router.push("/admin/products");
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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

  const handleEditProduct = () => {
    router.push(`/admin/products/${id}/update`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-48 w-full" />
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/products")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <div className="flex gap-2">
          <Button variant="default" onClick={handleEditProduct}>
            <Edit className="mr-2 h-4 w-4" /> Edit Product
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Product Details
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : "Out of Stock"}
              </Badge>
              {product.requires_prescription && (
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-700 border-purple-200"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Prescription Required
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Image */}
            <div className="flex flex-col">
              <div className="bg-secondary rounded-md p-4 flex items-center justify-center h-48">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={150}
                    height={150}
                    objectFit="contain"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-16 w-16 mb-2 opacity-30" />
                    <span className="text-sm">No image available</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold">{product.name}</h2>

              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm text-gray-500">Price</span>
                  <p className="font-bold text-xl">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <span className="text-sm text-gray-500">Stock</span>
                  <p className="font-bold text-xl">{product.stock}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <span className="text-sm text-gray-500">Prescription</span>
                  <p className="font-bold text-lg">
                    {product.requires_prescription
                      ? "Required"
                      : "Not Required"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Product ID</h3>
                <p className="font-mono text-xs">{product.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="font-medium text-red-600">Danger Zone</h3>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Product
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the product from the server.
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductPage;

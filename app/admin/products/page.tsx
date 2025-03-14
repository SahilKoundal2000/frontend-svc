"use client";

import { useState, useEffect } from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { Product, getAllProducts, useProductAPI } from "@/api/product";
import Loading from "@/components/ui/loading";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ProductsResponse {
  limit: number;
  page: number;
  products: Product[];
  total: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const { deleteProduct, updateProductStock } = useProductAPI();

  useEffect(() => {
    setIsMounted(true);

    const fetchProducts = async () => {
      try {
        const response: ProductsResponse = await getAllProducts();
        setProducts(response.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (!isMounted) return null;

  if (loading) return <Loading />;

  const columns = getColumns(async (id) => {
    const resp = await deleteProduct(id);
    if (!resp) return;
    if (resp.error) {
      toast("Failed to delete product.", { description: resp.error.message });
      return;
    }
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== id)
    );
  },
    async (id, StockUpdate) => {
      try {
        await updateProductStock(id, StockUpdate);
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === id ? { ...product, stock: product.stock + StockUpdate.quantity_change } : product
          )
        );
      } catch (error: unknown) {
        console.error("Failed to update stock:", error);
        if (error instanceof AxiosError) {
          const errorMessage = error.response?.data;

          if (errorMessage.type === "VALIDATION_ERROR") {
            const validationErrors = Object.entries(errorMessage.details)
              .map(([field, message]) => `${field}: ${message}`)
              .join(", ");
            toast("Validation Failed for following fields:", { description: validationErrors });
          }
          else {
            toast("Failed to update stock.", { description: error.response?.data.message || "An unknown error occurred." });
          }
        } else {
          toast("Failed to update stock.", { description: "An unknown error occurred." });
        }
      }
    });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <DataTable columns={columns} data={products ?? []} />
    </div>
  );
}

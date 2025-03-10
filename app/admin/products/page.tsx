"use client";

import { useState, useEffect } from "react";
import { Product, getColumns } from "./columns";
import { DataTable } from "./data-table";
import { getAllProducts, useProductAPI } from "@/api/product";
import Loading from "@/components/ui/loading";

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

  const { deleteProduct } = useProductAPI();

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

  const columns = getColumns((id) => {
    deleteProduct(id);
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== id)
    );
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <DataTable columns={columns} data={products ?? []} />
    </div>
  );
}

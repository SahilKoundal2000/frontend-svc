"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Search, Filter, Pill, FileText } from "lucide-react";
import { getAllProducts, Product } from "@/api/product";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MainLayout from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [sortBy, setSortBy] = useState("name");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllProducts({
          search: debouncedSearchTerm,
        });
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const sortedProducts = [...products].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    setFilteredProducts(sortedProducts);
  }, [products, sortBy]);

  const handleAddToCart = (product: Product) => {
    console.log("Adding to cart:", product);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pharmacy Products</h1>
          <p className="text-gray-500">
            Browse our selection of high-quality medications and health products
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <Skeleton className="h-48 w-full" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col">
                <CardHeader
                  className="p-4 cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <div className="h-48 bg-background rounded-md flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={200}
                        height={200}
                        objectFit="contain"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Pill className="h-16 w-16 text-gray-300" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    <Link href={`/products/${product.id}`}>{product.name}</Link>
                  </CardTitle>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                    <div>
                      {product.requires_prescription && (
                        <Badge
                          variant={"outline"}
                          className="bg-purple-100 text-purple-700 border-purple-200 mr-1"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Prescription
                        </Badge>
                      )}
                      {product.stock > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200"
                        >
                          In Stock
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-600 border-red-200"
                        >
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    className="w-full"
                    disabled={product.stock <= 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductsPage;

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductAPI, getProductById } from "@/api/product";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Loading from "@/components/ui/loading";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z
    .number({ message: "Price must be a number." })
    .positive({ message: "Price must be a positive number." }),
  requires_prescription: z.boolean().default(false),
  image: z.union([
    z
      .instanceof(File)
      .refine((file) => file.size > 0, {
        message: "Image is required.",
      })
      .refine((file) => file.type.startsWith("image/"), {
        message: "Only image files are allowed.",
      }),
    z.undefined(),
  ]),
});

export default function UpdateProductPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateProduct } = useProductAPI();
  const params = useParams();
  const productId = params.id?.toString();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      requires_prescription: false,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const response = await getProductById(productId);
        console.log("API Response:", response);

        const productData = response;

        if (!productData) {
          throw new Error("Product data not found in the response");
        }

        console.log("Using product data:", productData);

        form.reset({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          requires_prescription: productData.requires_prescription || false,
        });
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, form]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await updateProduct(productId!, data);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Product updated successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error("Error updating product", {
        description: errorMessage,
      });
    }
  }

  if (!productId) return null;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-xl mx-auto md:mt-20">
          <CardHeader>
            <CardTitle>Update Product</CardTitle>
            <CardDescription>Update Medicine Details</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Price"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requires_prescription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Requires Prescription to order</FormLabel>
                    <FormDescription>
                      If checked, customers will need to upload a prescription
                      to order this product.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange } }) => (
                <FormItem className="my-4">
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Only upload a new image if you want to replace the existing
                    one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Update</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

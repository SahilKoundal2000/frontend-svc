"use client";

import { ShoppingCart, Plus, Minus, Trash2, FileText } from "lucide-react";
import { useCart } from "@/context/cartContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const CartDropdown = () => {
  const { state: cart, removeItem, updateQuantity } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CAD",
    }).format(price);
  };

  const itemCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"ghost"}>
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 px-1.5 py-px min-w-5 h-5 flex items-center justify-center rounded-full bg-teal-600 text-white text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <h3 className="font-medium">Your Cart</h3>
            <p className="text-sm text-muted-foreground">
              {cart.items.length === 0
                ? "Your cart is empty"
                : `${itemCount} items, ${formatPrice(cart.total)}`}
            </p>
          </div>

          {cart.items.length > 0 ? (
            <>
              <ScrollArea className="max-h-80">
                <div className="p-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex py-3">
                      <div className="h-16 w-16 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          {item.requires_prescription && (
                            <FileText className="h-5 w-5 ml-1 text-purple-700" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded">
                            <Button
                              variant={"ghost"}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="px-2 min-w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant={"ghost"}
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                          <Button
                            variant={"destructive"}
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t space-y-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
                <Link href="/cart" className="w-full">
                  <Button className="w-full">View Cart</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link href="/products">
                <Button variant="outline">Browse Products</Button>
              </Link>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CartDropdown;

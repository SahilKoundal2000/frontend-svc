"use client";

import Link from "next/link";
import Logo from "./logo";
import { Button } from "./button";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import CartDropdown from "@/components/ui/cart-dropdown";
import { useCart } from "@/context/cartContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  username: string | null;
  role: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ username, role }: NavbarProps) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state: cart } = useCart();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const itemCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header className="fixed top-0 left-0 w-full bg-background text-foreground shadow-md z-10">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link href="/">
          <Logo variant="rectangle" size={60} />
        </Link>

        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/products" className="hover:text-teal-800">
            Products
          </Link>

          {role === "admin" ? (
            <Link href="/admin" className="hover:text-teal-800">
              Dashboard
            </Link>
          ) : (
            <CartDropdown />
          )}

          {username ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{username}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                {role === "customer" && (
                  <>
                    <DropdownMenuItem>Orders</DropdownMenuItem>
                    <DropdownMenuItem>Reminders</DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button>Login / Signup</Button>
            </Link>
          )}
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background shadow-md flex flex-col w-full">
            <div className="flex flex-col p-4 space-y-4">
              <Link
                href="/products"
                className="py-2 hover:text-teal-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>

              {role === "admin" ? (
                <Link
                  href="/admin/dashboard"
                  className="py-2 hover:text-teal-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center py-2">
                  <Link
                    href="/cart"
                    className="flex items-center hover:text-teal-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    <span>Cart</span>
                    {itemCount > 0 && (
                      <Badge className="ml-2 bg-teal-600">{itemCount}</Badge>
                    )}
                  </Link>
                </div>
              )}

              {username ? (
                <div className="space-y-2">
                  <div className="font-medium">{username}</div>
                  <Link
                    href="/profile"
                    className="block py-2 hover:text-teal-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  {role === "customer" && (
                    <>
                      <Link
                        href="/orders"
                        className="block py-2 hover:text-teal-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        href="/reminders"
                        className="block py-2 hover:text-teal-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Reminders
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left py-2 hover:text-teal-800"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Login / Signup</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

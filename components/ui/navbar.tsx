"use client";

import Link from "next/link";
import Logo from "./logo";
import { Button } from "./button";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-10">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link href="/" className="text-xl font-bold text-teal-400">
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
            <Link href="/cart" className="hover:text-teal-800">
              Cart
            </Link>
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
            <Link href="/auth">
              <Button>Login / Signup</Button>
            </Link>
          )}
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md flex flex-col w-full">
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
                <Link
                  href="/cart"
                  className="py-2 hover:text-teal-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cart
                </Link>
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
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
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

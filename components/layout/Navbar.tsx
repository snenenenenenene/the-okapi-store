'use client';

import { Container } from "@/components";
import { Cart } from "@/components/cart";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  console.log("Total items:", totalItems);
  console.log("Cart:", cart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-sandstone-300 dark:bg-vintage-black">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-xl font-medium text-sandstone-900 dark:text-slate-50"
            >
              Okapi
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/about"
                className={`text-sm ${
                  pathname === '/about'
                    ? 'text-sandstone-900 dark:text-slate-50'
                    : 'text-sandstone-600 hover:text-sandstone-900 dark:text-slate-300 dark:hover:text-slate-50'
                }`}
              >
                About
              </Link>
              <ThemeSwitcher />
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-sandstone-600 hover:text-sandstone-900 dark:text-slate-300 dark:hover:text-slate-50"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-600 flex items-center justify-center ring-2 ring-sandstone-300 dark:ring-vintage-black">
                    <span className="text-[10px] font-semibold text-white leading-none">
                      {totalItems}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </Container>
      </header>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

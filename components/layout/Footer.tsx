'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-sandstone-300/90 dark:bg-vintage-black py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-sandstone-900 dark:text-slate-50">{siteConfig.name}</h3>
            <p className="text-sandstone-600 dark:text-slate-300 text-sm">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg text-sandstone-900 dark:text-slate-50">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sandstone-600 hover:text-sandstone-900 dark:text-slate-300 dark:hover:text-slate-50 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sandstone-600 hover:text-sandstone-900 dark:text-slate-300 dark:hover:text-slate-50 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sandstone-600 hover:text-sandstone-900 dark:text-slate-300 dark:hover:text-slate-50 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg text-sandstone-900 dark:text-slate-50">Contact</h4>
            <ul className="space-y-2 text-sandstone-600 dark:text-slate-300">
              <li>Follow us on <Link href={siteConfig.social.twitter} className="hover:text-sandstone-900 dark:hover:text-slate-50">Twitter</Link></li>
              <li>Follow us on <Link href={siteConfig.social.instagram} className="hover:text-sandstone-900 dark:hover:text-slate-50">Instagram</Link></li>
              <li>Follow us on <Link href={siteConfig.social.facebook} className="hover:text-sandstone-900 dark:hover:text-slate-50">Facebook</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-sand-800 text-center text-sandstone-600 dark:text-slate-300 text-sm">
          <p>&copy; {currentYear} {siteConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";

export { Footer };

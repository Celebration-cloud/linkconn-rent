"use client";

import Link from "next/link";
import { Twitter, Facebook, Linkedin, Mail, Phone } from "lucide-react";

export const AppFooter = () => {
  return (
    <footer className="w-full border-t bg-default-50 py-8 text-default-600 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-4">
        {/* Quick Links */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-semibold mb-3 text-default-800">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="hover:text-primary transition-colors block"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="hover:text-primary transition-colors block"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-primary transition-colors block"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors block"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-semibold mb-3 text-default-800">Contact</h3>
          <p className="flex justify-center md:justify-start items-center gap-2 mb-2">
            <Mail className="w-4 h-4" />
            <a
              href="mailto:support@linkconnrent.com"
              className="hover:text-primary transition-colors"
            >
              support@linkconnrent.com
            </a>
          </p>
          <p className="flex justify-center md:justify-start items-center gap-2">
            <Phone className="w-4 h-4" />
            <a
              href="tel:+2348000000000"
              className="hover:text-primary transition-colors"
            >
              +234 800 000 0000
            </a>
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-semibold mb-3 text-default-800">Follow Us</h3>
          <div className="flex justify-center md:justify-start gap-4 text-lg mt-1">
            <Link
              href="#"
              aria-label="Twitter"
              className="p-2 rounded hover:bg-default-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              aria-label="Facebook"
              className="p-2 rounded hover:bg-default-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </Link>
            <Link
              href="#"
              aria-label="LinkedIn"
              className="p-2 rounded hover:bg-default-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t mt-6 pt-4 text-center text-xs text-default-500">
        © {new Date().getFullYear()} LinkConn Rent — All rights reserved.
      </div>
    </footer>
  );
};

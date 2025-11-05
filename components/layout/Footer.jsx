"use client";

import Link from "next/link";
import { Twitter, Facebook, Linkedin, Mail, Phone } from "lucide-react";

export const AppFooter = () => {
  return (
    <footer className="w-full border-t bg-default-50 py-10 text-default-600 text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 text-center md:text-left">
        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3 text-default-800">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold mb-3 text-default-800">Contact</h3>
          <p className="flex justify-center md:justify-start items-center gap-2">
            <Mail className="w-4 h-4" /> support@linkconnrent.com
          </p>
          <p className="flex justify-center md:justify-start items-center gap-2">
            <Phone className="w-4 h-4" /> +234 800 000 0000
          </p>
        </div>

        {/* Social Icons */}
        <div>
          <h3 className="font-semibold mb-3 text-default-800">Follow Us</h3>
          <div className="flex justify-center md:justify-start gap-4 text-lg">
            <Link href="#" aria-label="Twitter">
              <Twitter className="w-5 h-5 hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="Facebook">
              <Facebook className="w-5 h-5 hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5 hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t mt-8 pt-6 text-center">
        © {new Date().getFullYear()} LinkConn Rent — All rights reserved.
      </div>
    </footer>
  );
};

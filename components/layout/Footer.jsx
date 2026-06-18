"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

export const AppFooter = () => {
  return (
    <footer className="bg-primary-container text-on-primary-container w-full py-xl px-margin-mobile md:px-margin-desktop border-t border-surface-tint/20">
      <div className="max-w-max-width mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Brand Column */}
        <div className="col-span-1">
          <div className="flex items-center gap-sm mb-md">
            <Building2 className="w-8 h-8 text-on-primary" />
            <span className="font-headline-md text-headline-md text-on-primary font-bold">LinkConn Rent</span>
          </div>
          <p className="font-body-md text-body-md text-on-primary-container/80 mb-md">
            Securing your next home with transparency, efficiency, and trust.
          </p>
        </div>

        {/* Platform Links */}
        <div className="col-span-1">
          <h4 className="font-headline-sm text-headline-sm text-on-primary mb-sm">Platform</h4>
          <ul className="space-y-sm">
            <li>
              <Link
                className="font-body-md text-body-md text-on-primary-container/80 hover:text-secondary-container transition-colors"
                href="/properties"
              >
                Verified Listings
              </Link>
            </li>
            <li>
              <Link
                className="font-body-md text-body-md text-on-primary-container/80 hover:text-secondary-container transition-colors"
                href="/#how-it-works"
              >
                How it Works
              </Link>
            </li>
            <li>
              <Link
                className="font-body-md text-body-md text-on-primary-container/80 hover:text-secondary-container transition-colors"
                href="/about"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div className="col-span-1">
          <h4 className="font-headline-sm text-headline-sm text-on-primary mb-sm">Support</h4>
          <ul className="space-y-sm">
            <li>
              <Link
                className="font-body-md text-body-md text-on-primary-container/80 hover:text-secondary-container transition-colors"
                href="/help"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link
                className="font-body-md text-body-md text-on-primary-container/80 hover:text-secondary-container transition-colors"
                href="/contact"
              >
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className="col-span-1">
          <h4 className="font-headline-sm text-headline-sm text-on-primary mb-sm">Legal</h4>
          <ul className="space-y-sm">
            <li>
              <Link
                className="font-body-md text-body-md text-on-primary-container/80 hover:text-secondary-container transition-colors"
                href="/privacy"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                className="font-body-md text-body-md text-on-primary-container/80 hover:text-secondary-container transition-colors"
                href="/terms"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-max-width mx-auto mt-xl pt-md border-t border-surface-tint/30 text-center">
        <p className="font-body-md text-body-md text-on-primary-container/60">
          © {new Date().getFullYear()} LinkConn Rent. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

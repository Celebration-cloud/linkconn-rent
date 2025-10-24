"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  Search,
  Home,
  Building2,
  User,
  LogIn,
  Heart,
  Menu,
} from "lucide-react";

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["⌘"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search properties..."
      startContent={
        <Search className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const navItems = [
    { href: "/", label: "Home", icon: <Home size={16} /> },
    { href: "/properties", label: "Browse", icon: <Building2 size={16} /> },
    { href: "/agents", label: "Agents", icon: <User size={16} /> },
    { href: "/dashboard", label: "Dashboard", icon: <User size={16} /> },
  ];

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="shadow-sm backdrop-blur-md"
    >
      {/* Left side: Brand + Nav links */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-2 max-w-fit">
          <NextLink className="flex items-center gap-1" href="/">
            <Building2 className="text-primary" />
            <p className="font-bold text-inherit text-lg">LinkConn Rent</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium flex items-center gap-1"
                )}
                color="foreground"
                href={item.href}
              >
                {item.icon}
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* Right side: Search, Theme, Auth */}
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem className="flex items-center gap-3">
          <ThemeSwitch />
          <Button
            as={NextLink}
            href="/auth/login"
            size="sm"
            variant="flat"
            startContent={<LogIn size={16} />}
          >
            Login
          </Button>
          <Button
            as={NextLink}
            href="/auth/signup"
            size="sm"
            color="primary"
            variant="solid"
          >
            Get Started
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle icon={<Menu />} />
      </NavbarContent>

      {/* Collapsed Menu Items */}
      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link
                href={item.href}
                color={index === 0 ? "primary" : "foreground"}
                size="lg"
                className="flex items-center gap-2"
              >
                {item.icon}
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Link
              href="/auth/login"
              color="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              <LogIn size={16} /> Login / Sign Up
            </Link>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};

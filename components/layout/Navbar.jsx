"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Image } from "@heroui/image";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import NextLink from "next/link";
import { useState } from "react";
import clsx from "clsx";
import {
  Search,
  Home,
  Building2,
  User,
  LogIn,
  LogOut,
  Menu,
} from "lucide-react";
import { Avatar } from "@heroui/avatar";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  console.log("Navbar session user:", user);
  const pathname = usePathname();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: <Home size={16} /> },
    { href: "/properties", label: "Browse", icon: <Building2 size={16} /> },
    { href: "/landlords", label: "Landlords", icon: <User size={16} /> },
    ...(user
      ? [
          {
            href: `/dashboard?role=${user.role}`,
            label: "Dashboard",
            icon: <User size={16} />,
          },
        ]
      : []),
  ];

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
      placeholder="Search properties..."
      startContent={
        <Search className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <HeroUINavbar
      className="shadow-sm backdrop-blur-md transition-all"
      maxWidth="xl"
      position="sticky"
    >
      {/* Left section */}
      <NavbarContent justify="start">
        <NavbarBrand className="gap-2 cursor-pointer">
          <NextLink
            className="flex items-center gap-1 hover:scale-105 transition-transform"
            href="/"
          >
            <Image alt="Logo" height={30} src={siteConfig.logo} width={30} />
            <p className="font-bold text-lg">LinkConn Rent</p>
          </NextLink>
        </NavbarBrand>

        <ul className="hidden lg:flex gap-4 ml-4">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "flex items-center gap-1 text-sm transition-colors",
                  pathname === item.href
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary",
                )}
                href={item.href}
              >
                {item.icon}
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* Right section */}
      <NavbarContent
        className="hidden sm:flex items-center gap-4"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex w-60">{searchInput}</NavbarItem>
        <ThemeSwitch />
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                alt="User Avatar"
                className="cursor-pointer border border-default-200"
                name={user?.name || "User"}
                size="sm"
                src={user?.image}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem key="name" className="text-center font-semibold">
                {user.name || "User"}
              </DropdownItem>
              <DropdownItem
                key="dashboard"
                onClick={() => router.push(`/dashboard?role=${user.role}`)}
              >
                Dashboard
              </DropdownItem>
              <DropdownItem key="favorites" href="/favorites">
                Favorites
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <Button
              as={NextLink}
              href="/auth/login"
              size="sm"
              startContent={<LogIn size={16} />}
              variant="flat"
            >
              Login
            </Button>
            <Button as={NextLink} color="primary" href="/auth/signup" size="sm">
              Get Started
            </Button>
          </>
        )}
      </NavbarContent>

      {/* Mobile controls */}
      <NavbarContent className="sm:hidden basis-1 pl-2" justify="end">
        <ThemeSwitch />
        <Button
          isIconOnly
          variant="light"
          onPress={() => setShowSearch(!showSearch)}
        >
          <Search size={18} />
        </Button>
        <NavbarMenuToggle icon={<Menu />} />
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu>
        {showSearch && <div className="p-3">{searchInput}</div>}
        {navItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link
              className={clsx(
                "flex items-center gap-2 text-base",
                pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-foreground hover:text-primary",
              )}
              href={item.href}
            >
              {item.icon}
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        {user ? (
          <NavbarMenuItem>
            <Link
              className="flex items-center gap-2 cursor-pointer"
              color="danger"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Logout
            </Link>
          </NavbarMenuItem>
        ) : (
          <NavbarMenuItem>
            <Link
              className="flex items-center gap-2"
              color="primary"
              href="/auth/login"
            >
              <LogIn size={16} /> Login / Sign Up
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
}

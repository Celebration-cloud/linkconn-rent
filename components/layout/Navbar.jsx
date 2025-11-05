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
import { ThemeSwitch } from "@/components/theme-switch";
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
  Heart,
  LogOut,
  Menu,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Avatar } from "@heroui/avatar";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: <Home size={16} /> },
    { href: "/properties", label: "Browse", icon: <Building2 size={16} /> },
    { href: "/agents", label: "Agents", icon: <User size={16} /> },
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
      placeholder="Search properties..."
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["⌘"]}>
          K
        </Kbd>
      }
      startContent={
        <Search className="text-base text-default-400 pointer-events-none" />
      }
      type="search"
    />
  );

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="shadow-sm backdrop-blur-md transition-all"
    >
      {/* Left section */}
      <NavbarContent justify="start">
        <NavbarBrand className="gap-2 cursor-pointer">
          <NextLink
            href="/"
            className="flex items-center gap-1 hover:scale-105 transition-transform"
          >
            <Image src={siteConfig.logo} alt="Logo" width={30} height={30} />
            <p className="font-bold text-lg">LinkConn Rent</p>
          </NextLink>
        </NavbarBrand>

        <ul className="hidden lg:flex gap-4 ml-4">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                href={item.href}
                className={clsx(
                  "flex items-center gap-1 text-sm transition-colors",
                  pathname === item.href
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                )}
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
        justify="end"
        className="hidden sm:flex items-center gap-4"
      >
        <NavbarItem className="hidden lg:flex w-60">{searchInput}</NavbarItem>
        <ThemeSwitch />
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                src={user?.image}
                alt="User Avatar"
                size="sm"
                className="cursor-pointer border border-default-200"
                name={user?.name || "User"}
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
              variant="flat"
              startContent={<LogIn size={16} />}
            >
              Login
            </Button>
            <Button as={NextLink} href="/auth/signup" size="sm" color="primary">
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
              href={item.href}
              className={clsx(
                "flex items-center gap-2 text-base",
                pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-foreground hover:text-primary"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        {user ? (
          <NavbarMenuItem>
            <Link
              onClick={handleLogout}
              color="danger"
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </Link>
          </NavbarMenuItem>
        ) : (
          <NavbarMenuItem>
            <Link
              href="/auth/login"
              color="primary"
              className="flex items-center gap-2"
            >
              <LogIn size={16} /> Login / Sign Up
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
}

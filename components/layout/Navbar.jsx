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
import NextLink from "next/link";
import { useState } from "react";
import clsx from "clsx";
import {
  Search,
  Building2,
  User,
  LogIn,
  LogOut,
  Menu,
  Home,
} from "lucide-react";
import { Avatar } from "@heroui/avatar";

import { useSession, signOut } from "@/lib/auth/client";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  const navItems = [
    { href: "/properties", label: "Find Rent", icon: <Building2 size={16} /> },
    { href: "/dashboard", label: "List Property", icon: <User size={16} /> },
    { href: "/#how-it-works", label: "How it Works", icon: <Home size={16} /> },
  ];

  const searchInput = (
    <Input
      aria-label="Search"
      aria-labelledby="Search"
      classNames={{
        inputWrapper: "bg-surface-container-low border border-outline-variant",
        input: "text-sm text-on-surface",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["⌘"]}>
          K
        </Kbd>
      }
      placeholder="Search properties..."
      startContent={
        <Search className="text-base text-outline pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <HeroUINavbar
      className="bg-surface shadow-sm docked full-width top-0 z-50 sticky border-b border-default-100"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent justify="start">
        <NavbarBrand className="gap-2 cursor-pointer">
          <NextLink
            className="flex items-center gap-2 hover:scale-105 transition-transform"
            href="/"
          >
            <Building2 className="w-8 h-8 text-secondary" />
            <p className="font-headline-md text-headline-md text-secondary font-bold">LinkConn Rent</p>
          </NextLink>
        </NavbarBrand>

        <ul className="hidden lg:flex gap-lg ml-6">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "font-body-md text-body-md transition-all pb-1",
                  pathname === item.href
                    ? "text-secondary font-bold border-b-2 border-secondary"
                    : "text-on-surface-variant hover:text-secondary",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex items-center gap-md"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex w-60">{searchInput}</NavbarItem>
        <ThemeSwitch />
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                alt="User Avatar"
                className="cursor-pointer border border-secondary"
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
                onClick={() => router.push("/dashboard")}
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
              className="font-label-md text-label-md text-secondary border border-secondary px-md py-sm rounded-lg hover:bg-surface-container-low transition-all bg-transparent"
              href="/auth/login"
              size="md"
              variant="bordered"
            >
              Login
            </Button>
            <Button
              as={NextLink}
              className="font-label-md text-label-md bg-secondary text-on-secondary px-md py-sm rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-sm"
              href="/auth/signup"
              size="md"
            >
              Signup
            </Button>
          </>
        )}
      </NavbarContent>

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

      <NavbarMenu className="bg-surface">
        {showSearch && <div className="p-3">{searchInput}</div>}
        {navItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link
              className={clsx(
                "flex items-center gap-2 text-base font-body-md py-2",
                pathname === item.href
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant hover:text-secondary",
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
              className="flex items-center gap-2 cursor-pointer py-2 font-body-md"
              color="danger"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Logout
            </Link>
          </NavbarMenuItem>
        ) : (
          <NavbarMenuItem className="flex flex-col gap-2 mt-4">
            <Button
              as={NextLink}
              className="w-full text-secondary border border-secondary bg-transparent"
              href="/auth/login"
              variant="bordered"
            >
              Login
            </Button>
            <Button
              as={NextLink}
              className="w-full bg-secondary text-on-secondary"
              href="/auth/signup"
            >
              Signup
            </Button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
}

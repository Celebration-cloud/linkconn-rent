"use client";
import { Input, Kbd } from "@heroui/react";
import { Search } from "lucide-react";

export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
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
      placeholder={placeholder}
      startContent={
        <Search className="text-base text-default-400 pointer-events-none" />
      }
      type="search"
      value={value}
      onChange={onChange}
    />
  );
};

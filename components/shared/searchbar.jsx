"use client";
import { Input, Kbd } from "@heroui/react";
import { Search } from "lucide-react";

export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <Input
      aria-label="Search"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      startContent={
        <Search className="text-base text-default-400 pointer-events-none" />
      }
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["⌘"]}>
          K
        </Kbd>
      }
      type="search"
    />
  );
};

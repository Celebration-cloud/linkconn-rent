"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { store } from "@/lib/redux/store";

export function Providers({ children, themeProps }) {
  const router = useRouter();

  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <HeroUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </HeroUIProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}

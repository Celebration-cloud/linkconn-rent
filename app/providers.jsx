"use client";

import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { ToastProvider } from "@heroui/react";

import { store } from "@/lib/redux/store";
import { PropertiesUIProvider } from "@/hooks/usePropertiesUI";

export function Providers({ children, themeProps }) {
  const router = useRouter();

  return (
    <ReduxProvider store={store}>
      <HeroUIProvider navigate={router.push}>
        <ToastProvider />
        <NextThemesProvider {...themeProps}>
          <PropertiesUIProvider>{children}</PropertiesUIProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </ReduxProvider>
  );
}

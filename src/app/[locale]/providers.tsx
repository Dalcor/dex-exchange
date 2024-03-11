"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { ThemeProvider as StyledComponentsThemeProvider } from "styled-components";
import { type State, WagmiProvider } from "wagmi";

import { config } from "@/config/wagmi/config";
import { Locale } from "@/navigation";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ToastProvider from "@/providers/ToastProvider";

type Props = {
  children: ReactNode;
  initialState: State | undefined;
  messages: AbstractIntlMessages | undefined;
  locale: Locale;
};

const queryClient = new QueryClient();
const timeZone = "Europe/Vienna";

const themeObject = {
  white: "#FFFFFF",
  black: "#000000",
  chain_1: "#627EEA",
  chain_3: "#A08116",
  chain_4: "#FB118E",
  chain_5: "#209853",
  chain_10: "#FF0420",
  chain_137: "#A457FF",
  chain_42: "#28A0F0",
  chain_56: "#F0B90B",
  chain_420: "#FF0420",
  chain_42161: "#28A0F0",
  chain_421613: "#28A0F0",
  chain_421614: "#28A0F0",
  chain_80001: "#A457FF",
  chain_43114: "#FF0420",
  chain_137_background: "#1C0337",
  chain_10_background: "#240800",
  chain_43114_background: "#240800",
  chain_42161_background: "#040E34",
  chain_84531: "#0052FF",
  chain_56_background: "#F0B90B",
  promotional: "#FD82FF",
  brandedGradient: "linear-gradient(139.57deg, #FF79C9 4.35%, #FFB8E2 96.44%);",
  promotionalGradient: "#FC72FF",
  background: "#000000",
  neutral1: "#FFFFFF",
  neutral2: "#9B9B9B",
  neutral3: "#5E5E5E",
  neutralContrast: "#FFFFFF",
  surface1: "#131313",
  surface2: "#1B1B1B",
  surface3: "#FFFFFF12",
  surface4: "#FFFFFF20",
  surface5: "#00000004",
  accent1: "#FC72FF",
  accent2: "#311C31",
  accent3: "#4C82FB",
  token0: "#FC72FF",
  token1: "#4C82FB",
  success: "#40B66B",
  critical: "#FF5F52",
  critical2: "#2E0805",
  scrim: "rgba(0, 0, 0, 0.60)",
  warning2: "#EEB317",
  deprecated_yellow1: "#A08116",
  deprecated_yellow2: "#866311",
  deprecated_yellow3: "#5D4204",
  deprecated_blue4: "#153d6f70",
  deprecated_backgroundScrolledSurface: "#FFFFFFb8",
  deprecated_accentWarning: "#EEB317",
  deprecated_accentWarningSoft: "#EEB3173d",
  deprecated_accentFailureSoft: "#FF5F521f",
  deprecated_accentTextLightPrimary: "#F5F6FC",
  deprecated_deepShadow:
    "12px 16px 24px rgba(0, 0, 0, 0.24), 12px 8px 12px rgba(0, 0, 0, 0.24), 4px 4px 8px rgba(0, 0, 0, 0.32);",
  deprecated_shallowShadow: "0px 0px 10px 0px rgba(34, 34, 34, 0.04);",
  deprecated_networkDefaultShadow: "0px 40px 120px #FC72FF29",
  deprecated_stateOverlayHover: "#98A1C014",
  deprecated_stateOverlayPressed: "#B8C0DC3d",
  deprecated_hoverState: "#98A1C03d",
  deprecated_hoverDefault: "#98A1C014",
  darkMode: true,
  grids: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "24px",
    xl: "32px",
  },
  fonts: {
    code: "courier, courier new, serif",
  },
  shadow1: "#000",
  deprecated_mediaWidth: {},
  navHeight: 72,
  navVerticalPad: 20,
  mobileBottomBarHeight: 48,
  maxWidth: "1200px",
  breakpoint: {
    xs: 396,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
    xxxl: 1920,
  },
  transition: {
    duration: {
      slow: "500ms",
      medium: "250ms",
      fast: "125ms",
    },
    timing: {
      ease: "ease",
      in: "ease-in",
      out: "ease-out",
      inOut: "ease-in-out",
    },
  },
  blur: {
    light: "blur(12px)",
  },
  opacity: {
    hover: 0.6,
    click: 0.4,
    disabled: 0.5,
    enabled: 1,
  },
  text: {
    heading: {
      fontFamily: "inherit",
      fontWeight: 485,
    },
  },
};

export function Providers({ children, initialState, messages, locale }: Props) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale={locale} timeZone={timeZone} messages={messages}>
          <ThemeProvider attribute="class">
            <StyledComponentsThemeProvider theme={themeObject}>
              <ToastProvider>{children}</ToastProvider>
            </StyledComponentsThemeProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

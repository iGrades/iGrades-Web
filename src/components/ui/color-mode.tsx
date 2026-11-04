/* eslint-disable react-refresh/only-export-components */
"use client"

import type { IconButtonProps, SpanProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Skeleton, Span } from "@chakra-ui/react"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"
import { nativeShellService } from "@/services/nativeShellService"

export type ColorMode = "light" | "dark"

export interface ThemeContextValue {
  theme: string
  resolvedTheme: ColorMode
  systemTheme: ColorMode
  forcedTheme?: string
  themes: string[]
  setTheme: (theme: string) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "igrades_theme_mode"
const MEDIA_QUERY = "(prefers-color-scheme: dark)"

function getSystemTheme(): ColorMode {
  if (typeof window === "undefined" || !window.matchMedia) return "light"
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light"
}

function getStoredTheme(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (err) {
    void err;
    return null
  }
}

export interface ColorModeProviderProps {
  children?: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  storageKey?: string
  forcedTheme?: string
  attribute?: string
  disableTransitionOnChange?: boolean
}

/**
 * React 19-native ColorModeProvider.
 * Avoids rendering inline <script> tags inside React components which triggers
 * React 19 client-side warnings, while fully preserving theme persistence,
 * system preference sync, and native shell integration.
 */
export function ColorModeProvider({
  children,
  defaultTheme = "light",
  enableSystem = true,
  storageKey = STORAGE_KEY,
  forcedTheme,
}: ColorModeProviderProps) {
  const [theme, setThemeState] = React.useState<string>(() => {
    if (forcedTheme) return forcedTheme
    const stored = getStoredTheme()
    return stored || defaultTheme
  })

  const [systemTheme, setSystemTheme] = React.useState<ColorMode>(getSystemTheme)

  // Synchronize with OS system preferences
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia(MEDIA_QUERY)
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Listen for storage changes across browser tabs / windows
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        setThemeState(e.newValue)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [storageKey])

  const resolvedTheme: ColorMode = React.useMemo(() => {
    if (forcedTheme) return forcedTheme === "dark" ? "dark" : "light"
    if (theme === "system" && enableSystem) return systemTheme
    return theme === "dark" ? "dark" : "light"
  }, [forcedTheme, theme, enableSystem, systemTheme])

  // Synchronize DOM attributes, colorScheme, and native status bar
  React.useEffect(() => {
    if (typeof document === "undefined") return
    const isDark = resolvedTheme === "dark"
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      root.setAttribute("data-theme", "dark")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.setAttribute("data-theme", "light")
      root.style.colorScheme = "light"
    }
    nativeShellService.applyTheme(isDark).catch(() => {})
  }, [resolvedTheme])

  const setTheme = React.useCallback(
    (newTheme: string) => {
      setThemeState(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch (err) {
        console.warn("Unable to persist theme:", err)
      }
    },
    [storageKey]
  )

  const value: ThemeContextValue = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      forcedTheme,
      themes: ["light", "dark", "system"],
      setTheme,
    }),
    [theme, resolvedTheme, systemTheme, forcedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
    return {
      theme: isDark ? "dark" : "light",
      resolvedTheme: isDark ? "dark" : "light",
      systemTheme: "light",
      themes: ["light", "dark", "system"],
      setTheme: () => {},
    }
  }
  return ctx
}

export const ThemeProvider = ColorModeProvider

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme } = useTheme()
  const colorMode = resolvedTheme

  const toggleColorMode = () => {
    const next = colorMode === "dark" ? "light" : "dark"
    setTheme(next)
  }

  const setColorMode = (newMode: ColorMode) => {
    setTheme(newMode)
  }

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

type ColorModeButtonProps = Omit<IconButtonProps, "aria-label">

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    )
  },
)

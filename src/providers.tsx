import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

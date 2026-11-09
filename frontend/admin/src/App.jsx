import React from "react";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Thông báo Toaster chuẩn Dark theme */}
        <Toaster theme="dark" position="top-right" richColors />

        {/* Cấu hình Route chính */}
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


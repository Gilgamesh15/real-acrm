import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

import {
  AdminSidebar,
  SearchProvider,
} from "~/components/features/admin-sidebar/admin-sidebar";
import { cn } from "~/lib/utils";

export default function AdminLayout() {
  return (
    <SearchProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset
          className={cn(
            // Set content container, so we can use container queries
            "@container/content",

            // If layout is fixed, set the height
            // to 100svh to prevent overflow
            "has-data-[layout=fixed]:h-svh",

            // If layout is fixed and sidebar is inset,
            // set the height to 100svh - spacing (total margins) to prevent overflow
            "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]"
          )}
        >
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}

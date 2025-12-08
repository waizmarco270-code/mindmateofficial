
"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const SIDEBAR_WIDTH_MOBILE = "18rem"

type SidebarContext = {
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      isMobile,
      openMobile,
      setOpenMobile,
    }),
    [isMobile, openMobile]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={
          {
            "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex min-h-screen w-full",
          className
        )}
        ref={ref}
        {...props}
      />
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

// NOTE: All other components like Sidebar, SidebarInset, etc., have been removed
// as they are no longer needed for the universal slide-out menu implementation.
// The new implementation relies solely on the `Sheet` component from shadcn/ui.

export {
  SidebarProvider,
  useSidebar,
}
// Keep an empty Sidebar export to prevent breaking other files that might still import it.
export const Sidebar = () => null;

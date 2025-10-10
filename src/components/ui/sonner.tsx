// src/components/ui/sonner.tsx

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: 'var(--popover)',
          // Set the main title color (this should already be dark)
          color: 'var(--foreground)', 
          border: '1px solid var(--border)',
        },
        classNames: {
          // Keep padding fix
          toast: 'p-3',
        },
        // Removed: descriptionStyle is now handled by the global CSS override.
      }}
      {...props}
    />
  );
};

export { Toaster };
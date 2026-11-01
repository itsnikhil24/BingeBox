import { Toaster as Sonner } from "sonner";

// App is dark-only (no theme provider), so the theme is fixed here.
function Toaster(props) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
}

export { Toaster };

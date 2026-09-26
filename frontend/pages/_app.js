import { ActiveProfileProvider } from "../context/ActiveProfileContext";

// Next.js wraps every page with this component. We use it to share the
// active profile (self or a dependent) with all pages.
export default function MyApp({ Component, pageProps }) {
  return (
    <ActiveProfileProvider>
      <Component {...pageProps} />
    </ActiveProfileProvider>
  );
}

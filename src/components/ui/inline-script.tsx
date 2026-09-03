/**
 * Renders a synchronous inline <script> without React's dev-only
 * "Encountered a script tag while rendering React component" warning.
 *
 * The browser executes the script while parsing the server-rendered HTML,
 * before React or hydration are involved — but React still warns whenever
 * *it* renders a <script> tag, even during the initial hydration pass.
 * Server-only `type="text/javascript"` (so the browser runs it) vs
 * client-only `type="text/plain"` (so React treats it as inert data,
 * never re-running it) sidesteps that, at the cost of a type mismatch
 * that `suppressHydrationWarning` explicitly allows.
 *
 * See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 * ("Extracting a reusable component").
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

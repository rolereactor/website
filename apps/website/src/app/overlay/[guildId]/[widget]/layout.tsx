import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overlay",
  robots: { index: false, follow: false },
};

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add("overlay-page");document.body.classList.add("overlay-page");`,
        }}
      />
      <div className="overlay-page" style={{ background: "transparent", minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
}

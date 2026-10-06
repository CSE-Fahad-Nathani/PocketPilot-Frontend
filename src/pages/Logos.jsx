import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const LOGOS = [
  {
    id: 1,
    name: "Classic Remake",
    file: "/logos/logo-opt-01.jpg",
    note: "Closest to your current mark — wing + ₹ + arrow",
  },
  {
    id: 2,
    name: "Minimal Mark",
    file: "/logos/logo-opt-02.jpg",
    note: "Simplified for tiny phone sizes",
  },
  {
    id: 3,
    name: "Circle Badge",
    file: "/logos/logo-opt-03.jpg",
    note: "Icon centered in a dark circular badge",
  },
  {
    id: 4,
    name: "Glossy 3D",
    file: "/logos/logo-opt-04.jpg",
    note: "Premium shiny app-store style",
  },
  {
    id: 5,
    name: "Solid Lime",
    file: "/logos/logo-opt-05.jpg",
    note: "Flat lime silhouette on purple",
  },
  {
    id: 6,
    name: "Wing Focus",
    file: "/logos/logo-opt-06.jpg",
    note: "Larger pilot wing as the hero",
  },
  {
    id: 7,
    name: "Growth Arrow",
    file: "/logos/logo-opt-07.jpg",
    note: "Up-arrow first, finance mark inside",
  },
  {
    id: 8,
    name: "Layered Disc",
    file: "/logos/logo-opt-08.jpg",
    note: "Clean layered circle composition",
  },
  {
    id: 9,
    name: "Outline",
    file: "/logos/logo-opt-09.jpg",
    note: "Stroke / outline style mark",
  },
  {
    id: 10,
    name: "Retina Remake",
    file: "/logos/logo-opt-10.jpg",
    note: "High-contrast remake of your original",
  },
];

const SIZES = [
  { label: "App icon", px: 180 },
  { label: "Home", px: 72 },
  { label: "Favicon", px: 32 },
];

const Logos = () => {
  const [selectedId, setSelectedId] = useState(1);
  const selected = useMemo(
    () => LOGOS.find((item) => item.id === selectedId) || LOGOS[0],
    [selectedId]
  );

  return (
    <div className="min-h-screen bg-[#10002b] px-4 py-6 text-white">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#9d4edd]">
              Based on your favicon
            </p>
            <h1 className="mt-1 text-2xl font-bold">Logo options</h1>
            <p className="mt-1 text-sm text-[#c77dff]">
              Same Pocket Pilot mark (₹ + wing + arrow, purple & lime) — 10
              sharper variants for mobile.
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 rounded-full border border-[#7b2cbf] px-3 py-1.5 text-xs text-[#e0aaff] transition hover:bg-[#3c096c]"
          >
            Back
          </Link>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3">
          <img
            src="/logos/_source-favicon.png"
            alt="Current favicon"
            className="h-14 w-14 rounded-xl object-contain bg-white/95 p-1"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-white">Current favicon</p>
            <p className="text-[10px] text-[#9d4edd]">
              Low quality on mobile because it’s a photo inside SVG
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-[#e0aaff1f] bg-[#240046] p-4">
          <p className="mb-3 text-[11px] uppercase tracking-wide text-[#9d4edd]">
            Preview · {selected.id}. {selected.name}
          </p>
          <div className="flex items-end justify-around gap-3">
            {SIZES.map((size) => (
              <div key={size.label} className="flex flex-col items-center gap-2">
                <img
                  src={selected.file}
                  alt={`${selected.name} ${size.label}`}
                  width={size.px}
                  height={size.px}
                  className="rounded-[22%] object-cover shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                  style={{ width: size.px, height: size.px }}
                />
                <span className="text-[10px] text-[#9d4edd]">
                  {size.label} · {size.px}px
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-[#c77dff]">{selected.note}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {LOGOS.map((logo) => {
            const active = logo.id === selectedId;

            return (
              <button
                key={logo.id}
                type="button"
                onClick={() => setSelectedId(logo.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  active
                    ? "border-[#b6ff3c]/40 bg-[#5a189a]/35"
                    : "border-[#e0aaff1f] bg-[#240046] hover:border-[#7b2cbf]/60"
                }`}
              >
                <div className="mb-3 flex items-center justify-center rounded-2xl bg-[#10002b]/70 py-3">
                  <img
                    src={logo.file}
                    alt={logo.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-[22%] object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-white">
                  {logo.id}. {logo.name}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-[#9d4edd]">
                  {logo.note}
                </p>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-[#9d4edd]">
          Tell me the number (1–10) and I’ll set it as the app icon.
        </p>
      </div>
    </div>
  );
};

export default Logos;

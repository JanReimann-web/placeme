import { getDestinationLabel, getStyleLabel } from "./scene-packs";
import type {
  DestinationKey,
  SceneDescriptor,
  TravelStyleKey,
} from "./types";

const destinationPalette: Record<
  DestinationKey,
  { start: string; end: string; accent: string; line: string }
> = {
  "new-york": {
    start: "#1c3040",
    end: "#6f8293",
    accent: "#d7b281",
    line: "#eff5f9",
  },
  paris: {
    start: "#95816a",
    end: "#d7c0a8",
    accent: "#6d8794",
    line: "#fff7ef",
  },
  tokyo: {
    start: "#1c243d",
    end: "#475782",
    accent: "#e8a97e",
    line: "#eef4ff",
  },
  dubai: {
    start: "#715b47",
    end: "#d0b08a",
    accent: "#7ba0bd",
    line: "#fff8ef",
  },
};

const styleTone: Record<TravelStyleKey, string> = {
  "casual-travel": "Relaxed identity consistency study",
  "premium-elegant": "Premium editorial identity consistency study",
  romantic: "Soft intimate identity consistency study",
  "family-travel": "Warm shared-travel identity consistency study",
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function createMockImageUrl({
  destination,
  style,
  scene,
  participants,
  index,
}: {
  destination: DestinationKey;
  style: TravelStyleKey;
  scene: SceneDescriptor;
  participants: string[];
  index: number;
}) {
  const palette = destinationPalette[destination];
  const destinationLabel = getDestinationLabel(destination);
  const styleLabel = getStyleLabel(style);
  const participantLabel = participants.join(" + ");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600" fill="none">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.start}" />
        <stop offset="100%" stop-color="${palette.end}" />
      </linearGradient>
      <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.3)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>
    <rect width="1200" height="1600" rx="72" fill="url(#bg)" />
    <circle cx="248" cy="286" r="184" fill="${palette.accent}" opacity="0.22" />
    <circle cx="986" cy="1240" r="210" fill="${palette.line}" opacity="0.10" />
    <rect x="72" y="72" width="1056" height="1456" rx="48" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)" />
    <rect x="120" y="120" width="960" height="420" rx="36" fill="url(#wash)" opacity="0.58" />
    <text x="120" y="170" fill="${palette.line}" opacity="0.82" font-size="34" font-family="Arial, sans-serif" letter-spacing="6">PLACEME MOCK OUTPUT</text>
    <text x="120" y="260" fill="${palette.line}" font-size="124" font-family="Georgia, serif" font-weight="700">${escapeXml(scene.title)}</text>
    <text x="120" y="330" fill="${palette.line}" opacity="0.88" font-size="42" font-family="Arial, sans-serif">${escapeXml(destinationLabel)} - ${escapeXml(styleLabel)}</text>
    <text x="120" y="416" fill="${palette.line}" opacity="0.72" font-size="32" font-family="Arial, sans-serif">${escapeXml(scene.description)}</text>
    <rect x="120" y="1030" width="960" height="2" fill="rgba(255,255,255,0.22)" />
    <text x="120" y="1140" fill="${palette.line}" opacity="0.72" font-size="28" font-family="Arial, sans-serif" letter-spacing="4">SUBJECTS</text>
    <text x="120" y="1208" fill="${palette.line}" font-size="60" font-family="Arial, sans-serif" font-weight="600">${escapeXml(participantLabel)}</text>
    <text x="120" y="1292" fill="${palette.line}" opacity="0.74" font-size="30" font-family="Arial, sans-serif">${escapeXml(styleTone[style])}</text>
    <text x="120" y="1362" fill="${palette.line}" opacity="0.74" font-size="30" font-family="Arial, sans-serif">Wardrobe note: ${escapeXml(scene.wardrobeHint)}</text>
    <text x="120" y="1452" fill="${palette.line}" opacity="0.58" font-size="24" font-family="Arial, sans-serif">Frame ${String(index + 1).padStart(2, "0")} - Deterministic placeholder for MVP validation</text>
  </svg>`;

  return encodeSvg(svg);
}

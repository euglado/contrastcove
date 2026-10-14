export type Language = "tr" | "en";

export function color(input: string): string {
  const value = input.trim();
  if (!/^#?[0-9a-fA-F]{6}$/.test(value)) throw new Error("color");
  return `#${value.replace(/^#/, "").toUpperCase()}`;
}

export function luminance(input: string): number {
  const hex = color(input).slice(1);
  const channels = [0, 2, 4].map((offset) => {
    const srgb = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

export function ratio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function grades(value: number) {
  if (!Number.isFinite(value) || value < 1 || value > 21) throw new Error("ratio");
  return {
    aaNormal: value >= 4.5,
    aaLarge: value >= 3,
    aaaNormal: value >= 7,
    aaaLarge: value >= 4.5,
  };
}

export function report(foreground: string, background: string, lang: Language): string {
  const fg = color(foreground);
  const bg = color(background);
  const value = ratio(fg, bg);
  const g = grades(value);
  const alternative = ratio("#000000", bg) >= ratio("#FFFFFF", bg) ? "#000000" : "#FFFFFF";
  const verdict = (pass: boolean) =>
    lang === "tr" ? (pass ? "GEÇER" : "KALIR") : pass ? "PASS" : "FAIL";
  const heading = lang === "tr" ? "Metin / arka plan" : "Text / background";
  const rows = [
    `ContrastCove — ${heading}: ${fg} / ${bg}`,
    `${lang === "tr" ? "Kontrast" : "Contrast"}: ${value.toFixed(3)}:1`,
    `AA ${lang === "tr" ? "normal metin" : "normal text"} (4.5): ${verdict(g.aaNormal)}`,
    `AA ${lang === "tr" ? "büyük metin" : "large text"} (3): ${verdict(g.aaLarge)}`,
    `AAA ${lang === "tr" ? "normal metin" : "normal text"} (7): ${verdict(g.aaaNormal)}`,
    `AAA ${lang === "tr" ? "büyük metin" : "large text"} (4.5): ${verdict(g.aaaLarge)}`,
    lang === "tr"
      ? `Bu arka planda siyah/beyaz arasındaki güçlü metin seçeneği: ${alternative} (${ratio(alternative, bg).toFixed(3)}:1).`
      : `Stronger black/white text on this background: ${alternative} (${ratio(alternative, bg).toFixed(3)}:1).`,
    lang === "tr"
      ? "Kararlar yuvarlanmamış orandan alınır. Büyük: en az 18pt veya kalın 14pt. Yalnızca opak sRGB metin renkleri; tam erişilebilirlik değerlendirmesi değildir. Discord temasını otomatik algılamaz."
      : "Decisions use the unrounded ratio. Large: at least 18pt or bold 14pt. Opaque sRGB text colors only; this is not a full accessibility assessment. Discord theme is not detected.",
  ];
  return rows.join("\n");
}

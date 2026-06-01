// Generates TEMPORARY placeholder brand assets. Replaced by the branding session.
import sharp from "sharp";

// OG image placeholder: 1200x630 from the hero coaching photo
await sharp("src/assets/photos/coach-huddle.jpg")
  .resize(1200, 630, { fit: "cover" })
  .png()
  .toFile("public/og-image.png");

// Apple touch icon placeholder: solid brand blue 180x180
await sharp({ create: { width: 180, height: 180, channels: 4, background: "#005A9C" } })
  .png()
  .toFile("public/apple-touch-icon.png");

console.log("Placeholder assets generated: public/og-image.png, public/apple-touch-icon.png");

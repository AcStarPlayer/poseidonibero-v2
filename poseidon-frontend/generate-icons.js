// generate-icons.js
import sharp from "sharp";
import fs from "fs";

const inputPath = "./public/logo.png"; // Tu logo base
const outputDir = "./public/";

if (!fs.existsSync(inputPath)) {
  console.error("❌ No se encontró el archivo ./public/logo.png");
  process.exit(1);
}

async function generateIcons() {
  try {
    // Crear iconos
    await sharp(inputPath)
      .resize(192, 192)
      .toFile(`${outputDir}/logo192.png`);

    await sharp(inputPath)
      .resize(512, 512)
      .toFile(`${outputDir}/logo512.png`);

    console.log("✅ Iconos generados correctamente:");
    console.log("- logo192.png");
    console.log("- logo512.png");
  } catch (err) {
    console.error("❌ Error al generar los iconos:", err);
  }
}

generateIcons();

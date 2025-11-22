/**
 * Script para generar iconos de PWA desde una imagen base
 * Uso: node generate-pwa-icons.js <ruta-imagen-base>
 *
 * Requiere: sharp (npm install sharp)
 *
 * Ejemplo:
 * node generate-pwa-icons.js ./public/isis.png
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Tamaños de iconos necesarios para PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

// Color de fondo para padding si es necesario
const BACKGROUND_COLOR = { r: 102, g: 126, b: 234, alpha: 1 } // #667eea

async function generateIcons() {
  // Obtener ruta de imagen base desde argumentos
  const inputImagePath = process.argv[2] || './public/isis.png'
  const outputDir = './public/icons'

  // Verificar que existe la imagen base
  if (!fs.existsSync(inputImagePath)) {
    console.error('❌ Error: No se encontró la imagen base en:', inputImagePath)
    console.log('💡 Uso: node generate-pwa-icons.js <ruta-imagen-base>')
    console.log('   Ejemplo: node generate-pwa-icons.js ./public/logo.png')
    process.exit(1)
  }

  // Crear directorio de iconos si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    console.log('📁 Directorio de iconos creado:', outputDir)
  }

  console.log('🎨 Generando iconos de PWA desde:', inputImagePath)
  console.log('📦 Directorio de salida:', outputDir)
  console.log('')

  try {
    // Obtener metadata de la imagen base
    const metadata = await sharp(inputImagePath).metadata()
    console.log(`📐 Imagen base: ${metadata.width}x${metadata.height}px`)
    console.log('')

    // Generar cada tamaño de icono
    for (const size of ICON_SIZES) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`)

      await sharp(inputImagePath)
        .resize(size, size, {
          fit: 'contain', // Mantiene aspect ratio, añade padding si es necesario
          background: BACKGROUND_COLOR,
        })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(outputPath)

      console.log(`✅ Generado: icon-${size}x${size}.png`)
    }

    console.log('')
    console.log('🎉 ¡Iconos generados exitosamente!')
    console.log(`📊 Total: ${ICON_SIZES.length} iconos creados`)
    console.log('')
    console.log('📝 Próximos pasos:')
    console.log('   1. Verifica que los iconos se vean bien en public/icons/')
    console.log('   2. La PWA ya está configurada y lista para usar')
    console.log('   3. Construye la app: npm run build')
    console.log('   4. Despliega en un servidor HTTPS')
    console.log('')

  } catch (error) {
    console.error('❌ Error al generar iconos:', error.message)
    process.exit(1)
  }
}

// Verificar dependencias
try {
  await import('sharp')
  generateIcons()
} catch (error) {
  console.error('❌ Error: El paquete "sharp" no está instalado')
  console.log('')
  console.log('📦 Instala las dependencias:')
  console.log('   npm install sharp')
  console.log('')
  console.log('Luego ejecuta nuevamente:')
  console.log('   node generate-pwa-icons.js <ruta-imagen>')
  process.exit(1)
}

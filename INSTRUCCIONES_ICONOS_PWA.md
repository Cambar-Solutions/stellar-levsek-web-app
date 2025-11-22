# 🎨 Instrucciones para Generar Iconos de PWA

Tienes 3 opciones para generar los iconos necesarios para la PWA:

---

## Opción 1: Script Automático con Node.js (Recomendado) ⭐

### Paso 1: Instalar dependencias
```bash
npm install sharp
```

### Paso 2: Ejecutar el script
```bash
node generate-pwa-icons.js ./public/isis.png
```

Esto generará automáticamente todos los iconos en `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

---

## Opción 2: Herramienta Online (Más Fácil) 🌐

### Paso 1: Ir a una de estas herramientas
- **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
- **RealFaviconGenerator**: https://realfavicongenerator.net/

### Paso 2: Subir tu logo (isis.png)

### Paso 3: Descargar los iconos generados

### Paso 4: Copiar a tu proyecto
```bash
# Crea el directorio si no existe
mkdir -p public/icons

# Copia todos los iconos descargados
cp ~/Downloads/pwa-icons/* public/icons/
```

---

## Opción 3: ImageMagick (CLI) 💻

### Paso 1: Instalar ImageMagick
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Windows (usar Chocolatey)
choco install imagemagick
```

### Paso 2: Crear directorio de iconos
```bash
mkdir -p public/icons
```

### Paso 3: Generar todos los tamaños
```bash
# Desde la raíz del proyecto

# 72x72
magick public/isis.png -resize 72x72 -background "#667eea" -gravity center -extent 72x72 public/icons/icon-72x72.png

# 96x96
magick public/isis.png -resize 96x96 -background "#667eea" -gravity center -extent 96x96 public/icons/icon-96x96.png

# 128x128
magick public/isis.png -resize 128x128 -background "#667eea" -gravity center -extent 128x128 public/icons/icon-128x128.png

# 144x144
magick public/isis.png -resize 144x144 -background "#667eea" -gravity center -extent 144x144 public/icons/icon-144x144.png

# 152x152
magick public/isis.png -resize 152x152 -background "#667eea" -gravity center -extent 152x152 public/icons/icon-152x152.png

# 192x192
magick public/isis.png -resize 192x192 -background "#667eea" -gravity center -extent 192x192 public/icons/icon-192x192.png

# 384x384
magick public/isis.png -resize 384x384 -background "#667eea" -gravity center -extent 384x384 public/icons/icon-384x384.png

# 512x512
magick public/isis.png -resize 512x512 -background "#667eea" -gravity center -extent 512x512 public/icons/icon-512x512.png
```

---

## Opción 4: Manual con Photoshop/GIMP/Figma 🎨

### Crear cada tamaño manualmente:

1. Abre tu logo en tu editor favorito
2. Para cada tamaño (72, 96, 128, 144, 152, 192, 384, 512):
   - Crea un canvas cuadrado del tamaño requerido
   - Fondo: #667eea (color de Levsek)
   - Centra tu logo
   - Exporta como PNG con el nombre: `icon-{tamaño}x{tamaño}.png`
3. Guarda todos en `public/icons/`

---

## ✅ Verificar que todo está correcto

Después de generar los iconos, verifica:

```bash
# Listar todos los iconos generados
ls -lh public/icons/

# Deberías ver 8 archivos .png
```

Tamaños esperados aproximadamente:
- icon-72x72.png (~2-5 KB)
- icon-96x96.png (~3-6 KB)
- icon-128x128.png (~4-8 KB)
- icon-144x144.png (~5-10 KB)
- icon-152x152.png (~6-12 KB)
- icon-192x192.png (~8-15 KB)
- icon-384x384.png (~15-30 KB)
- icon-512x512.png (~20-40 KB)

---

## 🚀 Probar la PWA

### 1. Construir la aplicación
```bash
npm run build
```

### 2. Servir la build localmente (con HTTPS)
```bash
# Opción A: Usar serve
npx serve -s dist -l 3000

# Opción B: Usar http-server con SSL
npx http-server dist -p 3000 --ssl
```

### 3. Abrir en el navegador
- **Desktop**: Chrome DevTools → Application → Manifest
- **Mobile**: Abre en Chrome móvil, verás "Instalar app"

---

## 📱 Probar en Móvil

### Android (Chrome):
1. Abre la URL en Chrome móvil
2. Verás un banner: "Agregar Levsek a la pantalla de inicio"
3. Toca "Instalar"
4. El icono aparecerá en tu pantalla de inicio

### iOS (Safari):
1. Abre la URL en Safari
2. Toca el botón "Compartir" (cuadro con flecha)
3. Selecciona "Agregar a pantalla de inicio"
4. El icono aparecerá en tu pantalla de inicio

---

## 🎯 Iconos Opcionales (Screenshots)

Para mejorar la presentación en la tienda de apps:

### Screenshots Desktop (1280x720):
```bash
# Toma un screenshot del dashboard en 1280x720
# Guárdalo como: public/screenshots/dashboard.png
```

### Screenshots Mobile (750x1334):
```bash
# Toma un screenshot del móvil
# Guárdalo como: public/screenshots/mobile.png
```

Estos son opcionales pero mejoran la apariencia en:
- Chrome Web Store
- Microsoft Store
- Play Store (si usas TWA)

---

## 🔍 Troubleshooting

### "Los iconos no aparecen"
✅ Verifica que existan en `public/icons/`
✅ Verifica que el servidor esté sirviendo archivos estáticos
✅ Limpia el cache del navegador

### "La app no se puede instalar"
✅ Debe estar en HTTPS (o localhost)
✅ Debe tener manifest.json válido
✅ Debe tener service worker registrado
✅ Los iconos deben existir y ser accesibles

### "Service Worker no se registra"
✅ Verifica la consola del navegador
✅ Verifica que `public/service-worker.js` exista
✅ En producción, debe estar en HTTPS

---

## 📚 Recursos Útiles

- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Can I Use - Service Worker](https://caniuse.com/serviceworkers)

---

**¡Listo! Tu PWA estará completa una vez que generes los iconos.** 🎉

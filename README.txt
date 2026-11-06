CANCIONERO MERIBÁ (junio 2026)
==============================

App web instalable (PWA) para Android, iPhone y iPad, móvil y tableta.
Funciona sin conexión después de la primera visita.

1) PUBLICARLA
- Sube TODO el contenido de esta carpeta a tu hosting, manteniendo las carpetas:
    index.html, manifest.webmanifest, sw.js
    css/styles.css, js/app.js, js/songs.js, icons/*.png
- La dirección tiene que ser HTTPS (GitHub Pages, Netlify, Cloudflare Pages
  y la mayoría de hostings ya lo dan). Sin HTTPS el navegador no permite
  instalarla ni usarla sin conexión.
- Puede ir en la raíz del dominio o en una subcarpeta.

2) INSTALARLA EN CADA DISPOSITIVO
Android (móvil y tableta), con Chrome:
  Abre la dirección. Aparece el aviso "Instalar" en la página (o menú ⋮ >
  Instalar aplicación / Añadir a pantalla de inicio).
iPhone y iPad, con Safari:
  Abre la dirección, toca Compartir (cuadrado con flecha) > Añadir a pantalla
  de inicio. En iOS tiene que hacerse desde Safari.
Ordenador (Chrome o Edge): icono de instalar en la barra de direcciones.

3) ACTUALIZAR CANCIONES
Los datos están en js/songs.js. Tras cambiar cualquier archivo, edita sw.js y
sube el número de VERSION (cancionero-v2 > cancionero-v3) para que los
dispositivos descarguen la versión nueva.

4) TIPOGRAFÍA
Se carga desde Google Fonts y se guarda para uso sin conexión. Si no hay
conexión la primera vez, usa las fuentes del sistema.

5) APP DE TIENDA (OPCIONAL)
Esto no es un archivo .apk ni .ipa. Si quieres publicarla en Google Play o la
App Store, hay que empaquetar esta misma web con herramientas como PWABuilder o
Capacitor. Requiere cuenta de desarrollador (Google Play y Apple Developer,
esta última de pago anual) y, para iOS, un Mac con Xcode.

NOTAS
- El tono elegido en cada canción se guarda en cada dispositivo.
- C10 "Rey de Reyes" y D05 "Qué bien se está aquí" no tenían texto en el PDF.

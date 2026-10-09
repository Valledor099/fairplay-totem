# FAIR PLAY — Tótem del evento

Web local, sin dependencias de red ni compilación. Abrir `dist/index.html` en un navegador o ejecutar `python serve.py` y visitar http://127.0.0.1:4184/.

La interfaz parte de los cinco PDF Frame 2 a Frame 6: mapa general y cuatro fichas de actividades. Conserva los textos, elimina las duplicaciones del PDF y usa la paleta Noche, Carbón, Pizarra, Salvia y Papel del manual de marca. Barlow Condensed y Manrope continúan el lenguaje de la web actual; los logotipos originales se conservan sin redibujar.

## Deploy en Vercel

1. Entrar a https://vercel.com/new e importar `Valledor099/fairplay-totem`. La integración de GitHub debe tener acceso al repo de esa cuenta.
2. Dejar **Root Directory** en la raíz del repositorio (`./`). No cambiarla a `dist`.
3. Usar la rama `main` y presionar **Deploy**.

`vercel.json` configura **Framework Preset: Other**, **Output Directory: dist** y omite instalación y compilación. La web ya está lista en `dist/`; Playwright y Python se usan únicamente para las herramientas locales. No requiere variables de entorno ni servicios externos.

Si la pantalla de importación pide valores manualmente, usar `Other`, directorio de salida `dist` y dejar vacíos **Build Command** e **Install Command**, con sus overrides habilitados. Mantener la raíz en `./` para que Vercel lea `vercel.json`.

Después del deploy, abrir la URL en el tótem con la pantalla configurada en vertical y el navegador en pantalla completa. La navegación entre experiencias funciona dentro de la página y no necesita reglas de redirección adicionales.

Referencia: [configuración oficial de Vercel](https://vercel.com/docs/project-configuration/vercel-json).

## Uso en el tótem

- La web ocupa todo el ancho disponible, sin marco angosto de simulación ni límite de tamaño. Escala usando tanto el ancho como la altura del display para evitar que una pantalla muy alta reduzca los controles. La composición del tótem sigue siendo vertical.
- Revisión de escala: titulares de 146 px, nombres de actividades de 80 px, descripciones de 58 px y botones principales de 138 px de alto a 1080 × 1920. En un panel estrecho se permite desplazamiento antes que achicar estos elementos; las experiencias pasan a una columna.
- Tocá una actividad de la lista para abrir su ficha. Tocá un número en el mapa para resaltar la zona y abrir su ficha.
- «Ver ubicación en el mapa» vuelve al mapa y resalta la experiencia seleccionada.
- El mapa se mueve arrastrando con un dedo o el mouse, incluso sin zoom. También permite usar las flechas del teclado, zoom con + / − y pellizco con dos dedos. «Ver todo» restablece el encuadre y la posición.
- El botón de la esquina superior activa pantalla completa. Para un dispositivo de exposición, configurar el navegador en modo kiosco desde el sistema operativo.
- Tras 100 segundos de inactividad en una pantalla modificada, aparece un aviso de 20 segundos. A los 120 segundos vuelve al mapa limpio. «Sí, quiero continuar» reinicia el período. No guarda información de visitantes.
- Navegación por teclado, foco visible, etiquetas para lectores de pantalla y respeto por movimiento reducido.
- Todos los recursos se incluyen en `dist/`. Funciona sin conexión; puede abrirse directamente como archivo local. No requiere un servidor para navegar.

## Contenido y mapa

Ubicaciones según el wireframe: El vestuario en cancha de hockey, La alfombra roja en gimnasio / básquet, Comprate un deporte y Lo que no se ve en las dos mitades de la cancha exterior oeste.

El mapa utiliza la geometría OSM incluida en `data/base-osm.xml`. Se regenera con `python generate-map.py`. No se agregan senderos ni recorridos peatonales inventados. El acceso está identificado; no se rotula «Estás acá» porque falta confirmar el punto exacto de montaje. Confirmar la distribución de las actividades y los accesos en el predio antes de instalar. Es un plano orientativo, no de evacuación. Geometría © colaboradores de OpenStreetMap, ODbL: https://www.openstreetmap.org/copyright.

La imagen de El vestuario es la fotografía conceptual generada para la web FAIR PLAY. Las otras tres se reemplazaron por fotografías conceptuales nuevas generadas con la herramienta integrada Imagegen: una deportista en la alfombra salvia entre fotógrafos, equipamiento de tres deportes y un atleta atándose los botines. No son documentación de un evento realizado. Los originales PNG se conservan en `design/` y el conjunto de prompts completos en `design/image-prompts.json`. Los archivos usados por la web son `dist/assets/alfombra-v2.webp`, `dist/assets/deporte-v2.webp` y `dist/assets/invisible-v2.webp`. Fuentes OFL incluidas en `dist/fonts/`.

## Archivos

`dist/index.html`: estructura. `dist/styles.css`: componentes base. `dist/totem-large.css`: composición vertical y escala grande. `dist/app.js`: navegación, selección, zoom y retorno por inactividad. `dist/map.js`: mapa incrustado para funcionamiento sin conexión. `generate-map.py`: regeneración del mapa a partir de la geometría local. `evidence/`: capturas y resultados de verificación.

## Verificación

Para ejecutar la verificación automatizada, instalar Node.js y Python, ejecutar `npm install`, `npx playwright install chromium`, iniciar `python serve.py` en otra terminal y ejecutar `npm test`. En Windows también se puede usar Chrome o Edge instalado; `PLAYWRIGHT_EXECUTABLE_PATH` permite indicar otro ejecutable. Las capturas anteriores se conservan como historial; las que incluyen `enorme` y `mapa-arrastrable.png` muestran la versión más reciente.

No se utiliza Sites para servir ni publicar esta web. Todos los archivos necesarios para ejecutar la interfaz están incluidos en `dist/`.

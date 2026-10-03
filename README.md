# Truco Criollo

Juego web de truco argentino, mano a mano contra la computadora. React + TypeScript + Vite. Funciona en el navegador del celular; no requiere una aplicación Android ni una cuenta.

## Ejecutar

Requiere Node.js 24 y npm. Desde la carpeta del proyecto:

```sh
npm ci
npm run dev
```

Abrir `http://localhost:3000`. Para probar desde un teléfono en la misma red, usar `http://IP-DE-TU-PC:3000` y permitir el puerto en el firewall local. No exponer el servidor de desarrollo a Internet.

```sh
npm run lint
npm test
npm run build
```

Para servir el build, configurar `NODE_ENV=production` y ejecutar `npm start`. El puerto se puede configurar con `PORT`. El archivo de bloqueo mantenido es `package-lock.json`.

## Modalidad disponible

- 1 contra 1, computadora local, a 15 o 30 puntos, marcador inicial 0–0.
- Sin flor ni apuestas. Las salas multijugador y los torneos del prototipo no estaban conectados a un servidor de juego; no se ofrecen como modos disponibles.
- Envido calculado siempre con las tres cartas originales. Empate a favor de quien es mano. Envido + envido + real suma 7. El rechazo de un aumento paga el valor anterior; un primer envido/real/falta rechazado paga 1.
- **Variante de falta envido de esta mesa:** lo que le falta al puntero para llegar al objetivo, incluso en malas. Reemplaza el valor del envite; no suma los cantos anteriores si se acepta. Esta es una regla de la mesa, no una afirmación de reglamento único para todas las regiones.
- Truco/retruco/vale cuatro aceptados valen 2/3/4; rechazados pagan 1/2/3. El derecho a aumentar queda con quien aceptó. El envido puede interrumpir el primer truco pendiente y después se retoma su respuesta.
- Pardas, mano y derecho de salida resueltos por el motor. Los puntos del envido pueden finalizar la partida antes del truco.
- La computadora sólo usa sus cartas y lo que ya se jugó. Espera 1,8–2,8 segundos para jugar y 2,5–4 segundos para responder un canto.
- Resultado de mano: 2 segundos. Anuncio del siguiente reparto: otros 2 segundos. El historial pausa la mesa mientras está abierto.
- Guardado local validado; salir o recargar permite continuar desde el lobby. El guardado es por navegador, no se sincroniza por Firebase. Si el navegador bloquea el almacenamiento, la partida sigue en memoria y se avisa.
- Anotador manual independiente, con deshacer y reinicio. No modifica la partida contra la computadora.

## Estructura y verificación

`src/services/GameLogic.ts` es el único motor de decisiones, turnos y puntuación. `act` rechaza acciones ilegales sin modificar el estado; `advance` controla las transiciones. La interfaz dispone de un solo temporizador con limpieza al salir o cambiar de estado para evitar jugadas tardías o puntos duplicados.

`tests/game.test.ts` prueba jerarquía, envido, pardas, turnos, cartas repetidas, aumentos, rechazos, prioridad envido/truco, final de partida, guardado, decisiones de la computadora y 500 partidas completas con semillas reproducibles. No reemplaza las pruebas en dispositivos físicos.

Firebase es opcional para ingresar con Google. El juego local no depende de ese ingreso. El asistente de voz del prototipo no está expuesto en la navegación: para usar sus endpoints hay que configurar `GEMINI_API_KEY`, `GEMINI_TEXT_MODEL` y `GEMINI_LIVE_MODEL` con modelos habilitados en el proyecto. No configurar estos valores no impide iniciar el juego. Nunca poner la clave de Gemini en variables `VITE_*`.

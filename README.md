# Speaking Test (formato TOEIC® Speaking · Questions 1–11)

Un examen oral cronometrado con **todo el TOEIC Speaking**, de la Question 1 a la 11. El reloj cuenta el tiempo para
leer o preparar, suena un beep, el micrófono se enciende solo, graba hasta que se acaba el tiempo y pasa a la pregunta
siguiente. Cada respuesta va a tu Google Drive y a una planilla donde ponés la nota.

**Hay 14 versiones, una por artículo, y cada estudiante hace una distinta:** ningún estudiante repite la versión de
otro.

## El examen

| Parte | Qué hace | Tiempo |
| --- | --- | --- |
| **Questions 1–2** · Read a text aloud | Lee en voz alta dos fragmentos del artículo | cada uno: 45 s para preparar · 45 s para leer |
| **Question 3** · Describe a picture | Describe una foto del artículo | 30 s para preparar · 1 min para hablar |
| **Questions 4–6** · Respond to questions | Una entrevista telefónica sobre el tema del artículo: tres preguntas | sin preparación · 1 min cada una |
| **Questions 7–9** · Respond using information | Un gráfico con los datos del artículo; responde tres preguntas de alguien que llama | 30 s para leer · responde en 15 s, 15 s y 30 s |
| **Question 10** · Propose a solution | Un mensaje de voz con un problema del artículo; responde en el papel que le toca | 30 s para preparar · 60 s para hablar |
| **Question 11** · Express an opinion | Su opinión sobre el debate del artículo | 15 s para preparar · 60 s para hablar |

Son **11 respuestas grabadas**: de 0 a 3 puntos las Questions 1–9 y de 0 a 5 la 10 y la 11, **37 puntos** en total. El
examen dura unos 17 minutos. Las consignas se oyen (voz del navegador) y se leen en pantalla.

- **El texto, la foto y el gráfico aparecen cuando empieza su reloj**, así todos tienen el mismo tiempo. El texto y la
  foto quedan en pantalla mientras responden.
- **Questions 7–9: el gráfico no desaparece.** Queda en pantalla hasta el final de la parte, pero **lo que dice quien
  llama y las preguntas solo se oyen, no se ven**. La consigna se lo avisa a los estudiantes.
- **Questions 10 y 11:** el mensaje de voz y el tema se ven mientras escuchan y preparan, y **desaparecen cuando empieza
  el tiempo de respuesta**.
- **El reloj** es un anillo que se vacía: azul mientras leen o preparan, rojo mientras graba. Se pone ámbar en los
  últimos 10 segundos y parpadea en los últimos 5.
- **El micrófono** se pide una vez, en la prueba antes de empezar. Después graba solo en cada *Response time*.
- **No se pierde nada.** Cada grabación se guarda en el navegador y se envía enseguida; si se corta internet, se
  reintenta. Al final el estudiante ve “✓ Sent” en cada respuesta.
- **Si se recarga la página**, el examen sigue desde la pregunta que estaba respondiendo, sin repetir el tiempo de
  lectura del gráfico ni volver a mostrar el mensaje o el tema que ya desaparecieron. La planilla cuenta los reinicios y
  las veces que el estudiante salió de la página.

## Las 14 versiones

Todo sale de cada artículo: los dos textos son fragmentos del artículo, la foto es la del artículo (con su crédito), y
las preguntas, el gráfico, el problema y el tema de opinión son sobre lo que cuenta el artículo.

| Versión | Artículo |
| --- | --- |
| 1 | ‘It keeps growing’: the tent camp that stands against Spain’s housing crisis |
| 2 | ‘I’m screwed’: young adults forced by EU housing crisis to live with parents |
| 3 | AI threatens democracy. But we are not powerless: here’s how to fight back |
| 4 | We are teaching children maths they will never use. Isn’t it better to help them speak fluently? |
| 5 | Britain is addicted to prisons. Our crumbling probation service proves they don’t work |
| 6 | The scandal of food waste – and how we can stop it |
| 7 | ‘I have no neighbours’: overtourism pushes residents in Spain and Portugal to the limit |
| 8 | ‘The way universities are run is making us ill’: inside the student mental health crisis |
| 9 | Japan’s September surge in student suicides: What are the key drivers? |
| 10 | School phone bans alone do not improve grades or wellbeing, says UK study |
| 11 | Do you remember your first crappy job? Today’s young people would wish for half your luck |
| 12 | Burnt out: is the exhausting cult of productivity finally over? |
| 13 | ‘Where do they expect us to go?’ Life at one Bay Area encampment before eviction |
| 14 | How do we know that the climate crisis is to blame for extreme weather? |

### Una versión distinta para cada estudiante

Con el link general, **tu script le da a cada estudiante una versión que nadie más tiene**, al azar entre las que
quedan. El mismo nombre siempre recibe la misma versión, aunque lo escriba con o sin tildes o mayúsculas, así que nadie
puede cambiar de examen recargando la página. La hoja **Versions** de la planilla muestra quién tiene cuál:

- Para **liberar** una versión, borrá su fila.
- Para **empezar de nuevo** con otro grupo, borrá todas las filas menos la primera.
- Si ya se dieron las 14, el estudiante siguiente ve “All 14 versions have been given out. Please ask your teacher.”

En la página Teacher también hay **un link por versión**, por si querés elegir la versión de un estudiante. Esa versión
también queda anotada. Las demos (*Try it*) no gastan versiones.

## Instalación

1. **La planilla y el script.**
   1. Creá una planilla **nueva** (<https://sheets.new>) y abrí **Extensiones → Apps Script**.
   2. Borrá lo que haya y pegá las 6 partes de [`google-apps-script/partes/`](google-apps-script/partes/) (o todo
      [`Code.gs`](google-apps-script/Code.gs) de una vez, si el editor te deja):
      - La **parte 1** va en `Código.gs`, reemplazando todo.
      - Cada una de las otras va en un archivo nuevo (**＋ → Secuencia de comandos**, llamalo `parte2`, `parte3`…).
      - Cada parte empieza con `/* ── Speaking Test · parte N de 6 ── */` y termina con
        `/* ── fin de la parte N de 6 ── */`. Si no ves esa última línea, se cortó al pegar.
   3. Guardá, elegí **`setup`**, **▶ Ejecutar** y aceptá los permisos. Se crean las hojas *Exams*, *Responses*,
      *Versions* y *Rubric*, y la carpeta *Speaking Test — Recordings* en tu Drive.
2. **Implementar → Nueva implementación → Aplicación web.** Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier
   persona**. Copiá la URL que termina en `/exec`.
3. **En el examen, abrí la página Teacher** (`…/#teacher`, código **6060**). Pegá la URL, tocá *Test* y después *Save*.
   - Ahí están el link para los estudiantes y los links por versión.
   - También hay una **vista previa** de cada paso de cada versión (sin grabar nada) y las 14 versiones completas
     (con lo que dice quien llama y las preguntas 7–9, que los estudiantes solo oyen).
   - Para no tener que pegar la URL en cada computadora, también podés ponerla en [`js/config.js`](js/config.js)
     (`SCRIPT_URL`).

> **¿Cambiaste el script?** Guardar no alcanza: la URL `/exec` sigue usando la versión anterior hasta que la publiques.
> Andá a **Implementar → Administrar implementaciones → ✏️ (la implementación de siempre) → Versión: Nueva versión →
> Implementar.** Así la URL no cambia.

### Qué guarda la planilla

| Hoja | Qué tiene |
| --- | --- |
| **Exams** | Una fila por estudiante: inicio, nombre, **versión**, estado, respuestas, fin, veces que salió de la página, reinicios, **total** (suma automática, de 37) y la carpeta de sus audios |
| **Responses** | Una fila por respuesta: pregunta, enunciado, segundos, **▶ Listen** (el audio en tu Drive), **Score** (la celda acepta solo de 0 a 3, o de 0 a 5 en la 10 y la 11), *Out of* y *Comments* |
| **Versions** | Quién tiene cada versión, y su artículo |
| **Rubric** | Criterios de cada puntaje, con las escalas del TOEIC Speaking |

Los audios quedan en *Speaking Test — Recordings / nombre · V7 · código*.

## Cambiar el examen

Lo que pregunta cada versión está en [`js/versions.js`](js/versions.js) y las fotos en [`img/`](img/). Los relojes
están en [`js/format.js`](js/format.js), y las consignas cambian solas con ellos. Después:

```bash
npm run gs        # pasa al script las respuestas y las versiones, y lo vuelve a partir en partes cortas
npm run version   # antes de publicar: pone una versión nueva a los archivos (?v=…)
npm test
```

Si cambiaste el script, pegá de nuevo las partes que cambiaron y publicá una versión nueva (ver arriba).

## Publicarlo

En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`** → **Save**.
En uno o dos minutos queda en `https://royespnz-jpg.github.io/<nombre-del-repositorio>/`.

## Probarlo

```bash
npm start     # http://localhost:8080 ( …/?demo=1 prueba con los relojes reales; …/?quick=1 los acorta al 10 %)
npm test
```

No hay dependencias ni build: es HTML, CSS y JavaScript. Funciona en Chrome, Edge, Firefox y Safari, también en el
celular. Conviene usar auriculares.

*Material de clase con el formato del TOEIC Speaking; no es un examen oficial de ETS. Los textos y las fotos son de los
artículos de The Guardian y The Japan Times que se indican en cada versión, con sus créditos, para uso en clase.*

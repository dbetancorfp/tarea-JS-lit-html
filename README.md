# Tarea Final — JavaScript Avanzado con lit-html

Migración de componentes Angular a **Web Components nativos** usando [lit-html](https://lit.dev/docs/libraries/standalone-templates/) como motor de templates declarativo.

---

## Descripción

Aplicación de navegación de productos que demuestra los conceptos clave del módulo:

- Tres Web Components nativos (`task-breadcrumb`, `task-button`, `task-pagination`)
- Comunicación entre componentes mediante `CustomEvent`
- Renderizado declarativo con `lit-html` y sus bindings (`.prop`, `@event`, `?attr`, `repeat`)
- Ciclo de vida completo con `connectedCallback`, `disconnectedCallback` y patrón de disposables
- Arquitectura SOLID con separación de responsabilidades

Sin herramientas de build. Funciona directamente en el navegador mediante ES Modules e `importmap`.

---

## Componentes

### `task-breadcrumb`
Muestra la ruta de navegación activa. Recibe los elementos como array mediante property binding (`.items`). El último elemento se muestra como texto estático; el resto son enlaces clicables.

```html
<task-breadcrumb></task-breadcrumb>
```

```js
breadcrumb.items = [
  { label: 'Inicio', href: '#', onClick: () => goToPage(1) },
  { label: 'Categorías', href: '#pagina-2', onClick: () => goToPage(2) },
  { label: 'Electrónica' }   // último: no clicable
]
```

| API | Tipo | Descripción |
|---|---|---|
| `.items` | `Array` | Property binding — array de `{ label, href?, onClick? }` |

---

### `task-button`
Botón reutilizable con tres variantes visuales. Se comunica hacia afuera mediante `CustomEvent`.

```html
<task-button .label=${'Comprar'} .variant=${'primary'}></task-button>
```

| API | Tipo | Valores | Descripción |
|---|---|---|---|
| `.label` | `string` | cualquier texto | Texto del botón |
| `.variant` | `string` | `primary` · `secondary` · `ghost` | Estilo visual |
| `.size` | `string` | `compact` | Tamaño reducido (para paginación) |
| `disabled` | atributo booleano | — | Deshabilita el botón |
| `@task-click` | `CustomEvent` | `{ label }` | Se emite al hacer click |

---

### `task-pagination`
Gestiona la navegación entre páginas. Calcula automáticamente qué números mostrar con puntos suspensivos cuando hay muchas páginas. Lee su estado de atributos HTML.

```html
<task-pagination total-pages="10" current-page="1"></task-pagination>
```

| API | Tipo | Descripción |
|---|---|---|
| `current-page` | atributo numérico | Página activa |
| `total-pages` | atributo numérico | Total de páginas |
| `@page-change` | `CustomEvent` | `{ page }` — se emite al cambiar de página |

---

## Arquitectura

```
/
├── index.html                  # Punto de entrada — importmap + <app-root>
├── main.js                     # Inyecta PAGES en <app-root> (DIP)
│
├── components/
│   ├── component-breadCrumb.js # Web Component <task-breadcrumb>
│   ├── component-button.js     # Web Component <task-button>
│   ├── component-pagination.js # Web Component <task-pagination>
│   └── component-app-root.js   # Orquestador <app-root>
│
├── services/
│   └── view-loader.js          # Fetch + caché de fragmentos HTML (SRP)
│
├── templates/
│   ├── nav-template.js         # Función pura — template de navegación principal
│   └── content-template.js     # Función pura — template de secciones con repeat()
│
├── data/
│   └── pages.js                # Datos de navegación (páginas y secciones)
│
├── views/                      # Fragmentos HTML cargados dinámicamente
│   ├── novedades.html
│   ├── electronica.html
│   └── ...                     # 15 vistas en total
│
└── styles/
    └── main.css                # Estilos globales
```

### Flujo de datos

```
main.js
  └─ app-root.pages = PAGES          ← inyección de dependencia
        └─ #goToPage(1)
              ├─ #renderNav()         → navTemplate()    → <nav id="nav-pages">
              ├─ #renderContent()     → contentTemplate() → <div id="content">
              ├─ #setBreadcrumb()     → task-breadcrumb.items = [...]
              └─ #clearView()         → <div id="view">

  [usuario clica sección]
        └─ #selectSection()
              ├─ #setBreadcrumb()
              ├─ #renderContent()
              └─ #loadView()          → ViewLoader.load() → fetch + unsafeHTML
```

---

## Conceptos lit-html aplicados

| Concepto | Ejemplo en el proyecto |
|---|---|
| `html` tagged template | Template de cada componente |
| `render(tmpl, container)` | Diff eficiente en Shadow DOM y contenedores |
| `.prop=${value}` | `.label`, `.variant`, `.items` |
| `@event=${fn}` | `@task-click`, `@click`, `@page-change` |
| `?attr=${bool}` | `?disabled` en button y pagination |
| `repeat(items, keyFn, tmplFn)` | `contentTemplate`, `TaskPagination` |
| `unsafeHTML` | Inyección de vistas HTML remotas |
| Shadow DOM | `TaskButton`, `TaskBreadcrumb`, `TaskPagination` |
| `connectedCallback` | Inicialización en todos los componentes |
| `disconnectedCallback` + disposables | `AppRoot` — limpieza de listeners |
| `CustomEvent` `bubbles + composed` | `task-click`, `page-change` |
| Property injection | `app-root.pages = PAGES` desde `main.js` |

---

## Principios SOLID

| Principio | Aplicación |
|---|---|
| **S** — Single Responsibility | `ViewLoader` solo gestiona fetch/caché · templates como funciones puras · cada componente una responsabilidad |
| **O** — Open/Closed | Atributo `view-base-path` configurable · variantes de `task-button` extensibles solo con CSS |
| **L** — Liskov Substitution | Todos los componentes extienden `HTMLElement` respetando su contrato de ciclo de vida |
| **I** — Interface Segregation | APIs mínimas y cohesionadas por componente |
| **D** — Dependency Inversion | `AppRoot` recibe `PAGES` inyectado desde `main.js`, no lo importa directamente |

---

## Ejecución

No requiere instalación ni herramientas de build. Servir con cualquier servidor HTTP estático:

```bash
# Python
python3 -m http.server 3000

# Node.js (npx)
npx serve .

# VS Code
# Extensión Live Server → botón "Go Live"
```

Abrir `http://localhost:3000` en cualquier navegador moderno (Chrome 89+, Firefox 90+, Safari 15+).

> El `importmap` de `index.html` resuelve `lit-html` desde [esm.sh](https://esm.sh) sin necesidad de `npm install`.

---

## Requisitos del curso cubiertos

- [x] Custom Element con nombre válido (guión) y `customElements.define`
- [x] Shadow DOM con `attachShadow({ mode: 'open' })`
- [x] Templates con `html` de lit-html y todos los bindings
- [x] `connectedCallback` y `disconnectedCallback` con patrón de disposables
- [x] `CustomEvent` con `bubbles: true` y `composed: true`
- [x] ES Modules — `export class` en fichero propio por componente
- [x] Sin herramientas de build — `<script type="module">` directo

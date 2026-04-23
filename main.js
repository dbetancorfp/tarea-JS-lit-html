// Importa los datos de navegación: páginas y secciones de la aplicación
import { PAGES } from './data/pages.js'

// Importa y registra el componente orquestador <app-root>
// El import ejecuta customElements.define('app-root', AppRoot) como efecto secundario
import './components/component-app-root.js'

// Inyección de dependencias: pasa los datos al componente desde fuera (principio D — DIP).
// app-root no sabe de dónde vienen los datos, solo los recibe por propiedad.
document.querySelector('app-root').pages = PAGES

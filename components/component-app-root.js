import { html, render } from 'lit-html'
// unsafeHTML: directiva que inserta HTML arbitrario como string sin escapar.
// Se usa para inyectar las vistas cargadas remotamente desde /views/*.html.
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'


import './component-breadCrumb.js'
import './component-pagination.js'
import './component-button.js'
import { ViewLoader } from '../services/view-loader.js'
import { navTemplate } from '../templates/nav-template.js'
import { contentTemplate } from '../templates/content-template.js'

// Componente orquestador: coordina la navegación entre páginas y secciones.
// No usa Shadow DOM porque necesita acceder al light DOM de sus hijos con querySelector.
// Los datos se inyectan desde fuera con .pages = PAGES (principio D — Dependency Inversion).
export class AppRoot extends HTMLElement {
    #disposables = []    
    #breadcrumb          
    #navPages           
    #pagination         
    #content             
    #viewArea           
    #loader             
    #pages = {}          
    #activeSection = null 

    // Setter de property binding: main.js asigna .pages = PAGES después de importar el componente.
    // Si el elemento ya está en el DOM cuando llegan los datos, arranca la navegación.
    set pages(value) {
        this.#pages = value
        if (this.isConnected) this.#goToPage(1)
    }

    // Lee el atributo 'view-base-path' para saber dónde están los fragmentos HTML.
    // Principio O (Open/Closed): el path es configurable sin modificar el código.
    get #viewBasePath() {
        return this.getAttribute('view-base-path') || './views/'
    }

    // Ciclo de vida: el elemento acaba de insertarse en el DOM.
    // Aquí es seguro hacer querySelector porque los hijos ya existen.
    // Se registra el listener de 'page-change' y se guarda su limpieza en #disposables.
    connectedCallback() {
        this.#breadcrumb = this.querySelector('task-breadcrumb')
        this.#navPages   = this.querySelector('#nav-pages')
        this.#pagination = this.querySelector('task-pagination')
        this.#content    = this.querySelector('#content')
        this.#viewArea   = this.querySelector('#view')
        this.#loader     = new ViewLoader(this.#viewBasePath)

        // Solo arranca si ya se inyectaron los datos con .pages
        if (Object.keys(this.#pages).length > 0) this.#goToPage(1)

        // Escucha el evento que emite task-pagination al cambiar de página
        const onPageChange = (e) => this.#goToPage(e.detail.page)
        this.#pagination.addEventListener('page-change', onPageChange)
        // Guarda la función de limpieza para ejecutarla en disconnectedCallback
        this.#disposables.push(() => this.#pagination.removeEventListener('page-change', onPageChange))
    }

    // Ciclo de vida: el elemento se ha eliminado del DOM.
    // Patrón disposables: ejecuta todas las funciones de limpieza registradas
    // para evitar memory leaks por listeners huérfanos.
    disconnectedCallback() {
        this.#disposables.forEach(d => d())
        this.#disposables = []
    }

    // Construye el array de items para el breadcrumb según la página y sección activas.
    // Asigna el array directamente a la propiedad .items del Web Component (property binding).
    #setBreadcrumb(page, sectionLabel = null) {
        const { label } = this.#pages[page]
        const itemInicio = { label: 'Inicio', href: '#', onClick: () => this.#goToPage(1) }

        let items
        if (page === 1) {
            items = sectionLabel
                ? [itemInicio, { label: sectionLabel }]
                : [{ label: 'Inicio' }]
        } else {
            const itemPage = { label, href: `#pagina-${page}`, onClick: () => this.#goToPage(page) }
            items = sectionLabel ? [itemInicio, itemPage, { label: sectionLabel }] : [itemInicio, itemPage]
        }

        // Property binding directo: evita recrear el elemento, solo actualiza su estado
        this.#breadcrumb.items = items
    }

    // Renderiza los botones de navegación principal (Inicio, Categorías, Marcas).
    // navTemplate es una función pura importada: recibe datos y devuelve un TemplateResult.
    #renderNav(activePage) {
        render(navTemplate(this.#pages, activePage, (p) => this.#goToPage(p)), this.#navPages)
    }

    // Renderiza los botones de sección de la página actual.
    // contentTemplate usa repeat() internamente para renderizado eficiente con keys.
    #renderContent(page) {
        render(
            contentTemplate(this.#pages[page].sections, this.#activeSection, (s) => this.#selectSection(page, s)),
            this.#content
        )
    }

    // Gestiona la selección de una sección: actualiza estado, breadcrumb, botones y vista.
    #selectSection(page, section) {
        this.#activeSection = section.label
        this.#setBreadcrumb(page, section.label)
        this.#renderContent(page)
        this.#loadView(section.view)
    }

    // Carga el fragmento HTML de la sección vía fetch (con caché en ViewLoader)
    // y lo inyecta en el área de vista con unsafeHTML.
    async #loadView(viewId) {
        const html_str = await this.#loader.load(viewId)
        render(html`${unsafeHTML(html_str)}`, this.#viewArea)
    }

    // Limpia el área de vista (render de template vacío)
    #clearView() {
        render(html``, this.#viewArea)
    }

    // Punto de entrada de la navegación: coordina todos los renders al cambiar de página.
    // Resetea la sección activa, actualiza la paginación y re-renderiza todos los bloques.
    #goToPage(page) {
        this.#activeSection = null
        this.#pagination.setAttribute('current-page', page)
        this.#setBreadcrumb(page)
        this.#renderNav(page)
        this.#renderContent(page)
        this.#clearView()
    }
}

customElements.define('app-root', AppRoot)

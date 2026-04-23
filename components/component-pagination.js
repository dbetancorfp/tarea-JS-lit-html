import { html, render } from 'lit-html'
// repeat: directiva de lit-html equivalente a *ngFor con trackBy.
// Reutiliza nodos DOM existentes cuando cambia la lista, en lugar de recrearlos.
import { repeat } from 'lit-html/directives/repeat.js'
import './component-button.js'

// Web Component que gestiona la navegación entre páginas.
// Lee su estado de los atributos HTML 'current-page' y 'total-pages'.
// Emite el CustomEvent 'page-change' cuando el usuario cambia de página.
export class TaskPagination extends HTMLElement {

    // observedAttributes: cualquier cambio en estos atributos dispara attributeChangedCallback,
    // lo que provoca un re-render automático del componente.
    static get observedAttributes() { return ['current-page', 'total-pages'] }

    #shadow

    constructor() {
        super()
        this.#shadow = this.attachShadow({ mode: 'open' })
    }

    // Primer render al conectarse al DOM
    connectedCallback() {
        this.#render()
    }

    // Re-render cada vez que 'current-page' o 'total-pages' cambian
    attributeChangedCallback() {
        this.#render()
    }

    // Getters que leen los atributos HTML y los convierten a número.
    // Los atributos HTML son siempre strings; parseInt los convierte al tipo correcto.
    get currentPage() {
        return parseInt(this.getAttribute('current-page') || '1')
    }

    get totalPages() {
        return parseInt(this.getAttribute('total-pages') || '1')
    }

    // Cambia a la página indicada si está dentro del rango válido.
    // Actualiza el atributo (lo que dispara attributeChangedCallback y re-render)
    // y emite un CustomEvent para que el componente padre pueda reaccionar.
    #changePage(page) {
        if (page < 1 || page > this.totalPages) return
        this.setAttribute('current-page', page)
        this.dispatchEvent(new CustomEvent('page-change', {
            bubbles: true,
            composed: true,
            detail: { page }
        }))
    }

    // Calcula qué números de página mostrar, insertando '...' cuando hay muchas páginas.
    // Si hay 7 o menos páginas, las muestra todas. Si hay más, aplica ventana deslizante
    // mostrando siempre la primera, la última y las páginas adyacentes a la actual.
    #getPages() {
        const current = this.currentPage
        const total = this.totalPages

        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

        const pages = [1]
        if (current > 3) pages.push('...')

        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)
        for (let i = start; i <= end; i++) pages.push(i)

        if (current < total - 2) pages.push('...')
        if (total > 1) pages.push(total)

        return pages
    }

    #render() {
        render(this.#template(), this.#shadow)
    }

    // Template con lit-html.
    // repeat(pages, keyFn, templateFn): la keyFn (p => p) permite a lit-html
    // identificar cada elemento y reutilizar su nodo DOM en vez de recrearlo.
    // ?disabled — boolean binding: el botón ‹ se deshabilita en la primera página,
    //             el botón › se deshabilita en la última.
    #template() {
        const current = this.currentPage
        const total = this.totalPages
        const pages = this.#getPages()

        return html`
            <style>
                :host {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-family: sans-serif;
                }
                .dots { color: #9CA3AF; padding: 0 0.25rem; }
            </style>

            <!-- Botón "anterior": deshabilitado en la primera página -->
            <task-button
                size="compact"
                .variant=${'ghost'}
                .label=${'‹'}
                ?disabled=${current === 1}
                @task-click=${() => this.#changePage(current - 1)}
            ></task-button>

            <!-- Lista de páginas: números o puntos suspensivos -->
            ${repeat(pages, p => p, p =>
                p === '...'
                    ? html`<span class="dots">&#8230;</span>`
                    : html`<task-button
                            size="compact"
                            .variant=${p === current ? 'primary' : 'ghost'}
                            .label=${String(p)}
                            @task-click=${() => this.#changePage(p)}
                        ></task-button>`
            )}

            <!-- Botón "siguiente": deshabilitado en la última página -->
            <task-button
                size="compact"
                .variant=${'ghost'}
                .label=${'›'}
                ?disabled=${current === total}
                @task-click=${() => this.#changePage(current + 1)}
            ></task-button>
        `
    }
}

customElements.define('task-pagination', TaskPagination)

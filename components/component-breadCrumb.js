// lit-html proporciona html (tagged template) y render (motor de diff sobre el DOM)
import { html, render } from 'lit-html'

// Web Component que muestra una ruta de navegación (breadcrumb).
// Recibe los elementos como array a través de la propiedad .items (property binding).
export class TaskBreadcrumb extends HTMLElement {
    #shadow        // referencia al Shadow DOM encapsulado
    #items = []    // array de objetos { label, href?, onClick? }

    constructor() {
        super()
        // Shadow DOM: encapsula estilos y estructura, evitando colisiones con el exterior
        this.#shadow = this.attachShadow({ mode: 'open' })
    }

    // Setter: lit-html usa .items=${array} para asignar esta propiedad directamente.
    // Cada vez que cambia el array se vuelve a renderizar el template.
    set items(value) {
        this.#items = value
        this.#render()
    }

    get items() {
        return this.#items
    }

    // Ciclo de vida: se ejecuta cuando el elemento se inserta en el DOM.
    // El guard evita un render vacío si .items todavía no se ha asignado.
    connectedCallback() {
        if (this.#items.length > 0) this.#render()
    }

    // Llama a render() de lit-html: aplica diff sobre el Shadow DOM
    // y actualiza solo los nodos que han cambiado.
    #render() {
        render(this.#template(), this.#shadow)
    }

    // Template declarativo con lit-html.
    // Itera #items: el último elemento es el "actual" (no clicable),
    // el resto son enlaces con separador "/".
    #template() {
        return html`
            <style>
                :host { display: block; }
                nav {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    font-family: sans-serif;
                    font-size: 0.875rem;
                    color: #6B7280;
                }
                a {
                    text-decoration: none;
                    color: #6B7280;
                    transition: color 0.2s;
                }
                a:hover { color: var(--primary, #FF4F5A); }
                .current {
                    color: #111827;
                    font-weight: 500;
                }
                .separator {
                    margin: 0 0.4rem;
                    color: #D1D5DB;
                    user-select: none;
                }
            </style>
            <nav aria-label="Ruta de navegación">
                ${this.#items.map((item, i) => {
                    const isLast = i === this.#items.length - 1
                    return isLast
                        // Último elemento: texto estático con aria-current para accesibilidad
                        ? html`<span class="current" aria-current="page">${item.label}</span>`
                        // Elementos intermedios: enlace clicable + separador visual
                        : html`
                            <a
                                href=${item.href || '#'}
                                @click=${(e) => { e.preventDefault(); item.onClick?.() }}
                            >${item.label}</a>
                            <span class="separator" aria-hidden="true">/</span>
                          `
                })}
            </nav>
        `
    }
}

// Registra el custom element con nombre válido (debe contener guión)
customElements.define('task-breadcrumb', TaskBreadcrumb)

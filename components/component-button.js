import { html, render } from 'lit-html'

// Web Component reutilizable que encapsula un <button> con variantes visuales.
// Se comunica hacia afuera mediante el CustomEvent 'task-click'.
export class TaskButton extends HTMLElement {

    // observedAttributes: lista de atributos HTML que disparan attributeChangedCallback.
    // Permite usar el componente tanto via atributos (attr="valor") como via propiedades (.prop=valor).
    static get observedAttributes() {
        return ['label', 'variant', 'disabled', 'size']
    }

    #shadow             // Shadow DOM encapsulado
    #label   = ''       // texto del botón
    #variant = 'primary' // estilo visual: primary | secondary | ghost
    #size    = ''       // tamaño especial: 'compact' para paginación

    constructor() {
        super()
        this.#shadow = this.attachShadow({ mode: 'open' })
    }

    // Setters/Getters: permiten el property binding con lit-html (.label=${valor}).
    // Cada setter provoca un re-render para reflejar el nuevo valor en el DOM.
    set label(v)   { this.#label = String(v);   this.#render() }
    get label()    { return this.#label }

    set variant(v) { this.#variant = String(v); this.#render() }
    get variant()  { return this.#variant }

    set size(v)    { this.#size = String(v);    this.#render() }
    get size()     { return this.#size }

    // Getter privado: comprueba la presencia del atributo booleano 'disabled'.
    // En HTML los atributos booleanos se activan por presencia, no por valor.
    get #disabled() { return this.hasAttribute('disabled') }

    // Ciclo de vida: primer render cuando el elemento entra en el DOM.
    connectedCallback() {
        this.#render()
    }

    // Ciclo de vida: se llama cuando cambia cualquier atributo de observedAttributes.
    // Sincroniza el estado interno (#label, #variant, #size) con el atributo recibido.
    attributeChangedCallback(name, _, newVal) {
        if (name === 'label')   this.#label   = newVal ?? ''
        if (name === 'variant') this.#variant = newVal ?? 'primary'
        if (name === 'size')    this.#size    = newVal ?? ''
        this.#render()
    }

    // Emite un CustomEvent hacia el exterior cuando se hace click.
    // bubbles: true  → el evento sube por el árbol DOM.
    // composed: true → el evento atraviesa los límites del Shadow DOM.
    #handleClick() {
        if (this.#disabled) return
        this.dispatchEvent(new CustomEvent('task-click', {
            bubbles: true,
            composed: true,
            detail: { label: this.#label }
        }))
    }

    #render() {
        render(this.#template(), this.#shadow)
    }

    // Template con lit-html.
    // ?disabled — boolean attribute binding: añade/elimina el atributo según el valor booleano.
    // @click    — event binding: equivalente a addEventListener('click', fn).
    // class     — combina variante + tamaño compact si aplica.
    #template() {
        return html`
            <style>
                :host { display: inline-block; }

                button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    padding: 0.55rem 1.25rem;
                    border-radius: 0.5rem;
                    border: 1px solid transparent;
                    font-size: 0.875rem;
                    font-weight: 500;
                    font-family: inherit;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s;
                }

                button.compact {
                    min-width: 2.5rem;
                    height: 2.5rem;
                    padding: 0 0.5rem;
                }

                button:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                button.primary {
                    background: var(--primary, #FF4F5A);
                    color: #fff;
                    border-color: var(--primary, #FF4F5A);
                }
                button.primary:hover:not(:disabled) {
                    background: #e0434d;
                    border-color: #e0434d;
                }

                button.secondary {
                    background: #fff;
                    color: var(--primary, #FF4F5A);
                    border-color: var(--primary, #FF4F5A);
                }
                button.secondary:hover:not(:disabled) {
                    background: #FFF1F2;
                }

                button.ghost {
                    background: transparent;
                    color: #374151;
                    border-color: #E5E7EB;
                }
                button.ghost:hover:not(:disabled) {
                    background: #F9FAFB;
                    border-color: #D1D5DB;
                }
            </style>

            <button
                class="${this.#variant}${this.#size === 'compact' ? ' compact' : ''}"
                ?disabled=${this.#disabled}
                @click=${() => this.#handleClick()}
            >
                <slot></slot>${this.#label}
            </button>
        `
    }
}

customElements.define('task-button', TaskButton)

import { html } from 'lit-html'

// Función pura de template: genera los botones de navegación principal (Inicio, Categorías, Marcas).
// Al ser una función pura sin estado, no depende de ningún componente concreto
// y podría reutilizarse en cualquier contexto que necesite una barra de navegación.
// Principio S (Single Responsibility): solo renderiza, no gestiona estado.
//
// @param pages       objeto PAGES completo { 1: { label, sections }, 2: ..., 3: ... }
// @param activePage  número de la página actualmente activa (para marcarla como 'primary')
// @param onNavigate  callback que se invoca con el número de página al hacer click
export const navTemplate = (pages, activePage, onNavigate) => html`
    ${Object.entries(pages).map(([key, { label }]) => {
        const page = Number(key)
        return html`
            <task-button
                .label=${label}
                .variant=${page === activePage ? 'primary' : 'ghost'}
                @task-click=${() => onNavigate(page)}
            ></task-button>
        `
    })}
`

import { html } from 'lit-html'
// repeat: directiva de lit-html equivalente a *ngFor con trackBy.
// La keyFn (s => s.view) identifica cada elemento de forma única,
// permitiendo reutilizar nodos DOM existentes en lugar de recrearlos al re-renderizar.
import { repeat } from 'lit-html/directives/repeat.js'

// Función pura de template: recibe datos y devuelve un TemplateResult de lit-html.
// Al ser una función pura (sin estado, sin efectos secundarios), es fácil de testear
// y reutilizable desde cualquier componente. Principio S (Single Responsibility).
//
// @param sections     array de secciones de la página actual { label, view }
// @param activeSection label de la sección seleccionada (para marcarla como 'primary')
// @param onSelect     callback que se invoca cuando el usuario pulsa una sección
export const contentTemplate = (sections, activeSection, onSelect) => html`
    ${repeat(
        sections,
        s => s.view,      // keyFn: identificador único de cada sección (equivalente a trackBy)
        s => html`
            <task-button
                .label=${s.label}
                .variant=${s.label === activeSection ? 'primary' : 'ghost'}
                @task-click=${() => onSelect(s)}
            ></task-button>
        `
    )}
`

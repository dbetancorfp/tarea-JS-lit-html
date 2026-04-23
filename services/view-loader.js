// Servicio responsable de cargar fragmentos HTML desde el servidor y mantenerlos en caché.
// Principio S (Single Responsibility): esta clase hace una única cosa — fetch + caché.
// Principio D (Dependency Inversion): AppRoot la instancia con el basePath configurado,
// no la importa con una ruta hardcoded.
export class ViewLoader {
    #cache = new Map()  // caché en memoria: evita peticiones repetidas al mismo recurso
    #basePath           // ruta base configurable desde fuera (ej. './views/')

    // El basePath se inyecta en el constructor, lo que permite cambiar el origen
    // de las vistas sin modificar esta clase (principio O — Open/Closed).
    constructor(basePath = './views/') {
        this.#basePath = basePath
    }

    // Carga el fragmento HTML identificado por viewId.
    // Si ya está en caché, lo devuelve directamente sin hacer fetch.
    // Si no, lo descarga, lo almacena en caché y lo devuelve.
    // Es async porque fetch es una operación asíncrona (devuelve una Promise).
    async load(viewId) {
        if (!this.#cache.has(viewId)) {
            const res = await fetch(`${this.#basePath}${viewId}.html`)
            this.#cache.set(viewId, await res.text())
        }
        return this.#cache.get(viewId)
    }
}

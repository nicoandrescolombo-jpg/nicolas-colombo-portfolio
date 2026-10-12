import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 text-center">
      <span className="font-ui text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">
        Error 404
      </span>
      <h1 className="font-display italic text-5xl md:text-6xl text-text-primary mb-4">
        Obra no encontrada
      </h1>
      <p className="font-body text-text-secondary max-w-md text-sm md:text-base mb-8">
        El proyecto que estás buscando no existe o ha sido movido por el artista.
      </p>
      <Link
        href="/"
        className="btn-primary"
      >
        Volver al portafolio
      </Link>
    </div>
  )
}

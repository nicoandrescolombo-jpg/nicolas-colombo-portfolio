import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink text-paper flex items-center">
      <div className="site-container">
        <p className="type-sc text-[1.1rem] text-lead">Page not found</p>
        <h1 className="mt-3 type-display text-display-xl max-w-[14ch]">
          This project isn’t here anymore.
        </h1>
        <p className="mt-6 type-body text-lead max-w-[48ch]">
          It may have been renamed or taken down. The rest of the work is on the home page.
        </p>
        <Link href="/#work" className="btn-paper mt-10">
          See all work
        </Link>
      </div>
    </main>
  )
}

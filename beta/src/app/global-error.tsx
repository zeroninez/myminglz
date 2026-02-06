'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Something went wrong!</h2>
            <button onClick={() => reset()} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

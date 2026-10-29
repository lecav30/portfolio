export default function BlogUnavailable() {
  return (
    <section aria-live="polite" className="mx-auto max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-8 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
      <h1 className="text-2xl font-bold">El blog no está disponible temporalmente</h1>
      <p className="mt-3 leading-7">No fue posible obtener los artículos publicados. Inténtalo de nuevo en unos minutos.</p>
    </section>
  );
}

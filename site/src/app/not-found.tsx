import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-y">
      <div className="container-site text-center">
        <p className="grad-text font-display text-[clamp(80px,14vw,140px)] font-bold leading-none">404</p>
        <h1 className="mt-4 text-[clamp(26px,3vw,36px)]">Такой страницы нет</h1>
        <p className="mx-auto mt-4 max-w-[40ch] text-subtle">
          Зато есть шесть решений, которые работают. Начните с них — или вернитесь на главную.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn btn-primary">На главную</Link>
          <Link href="/solutions" className="btn btn-secondary">Смотреть решения</Link>
        </div>
      </div>
    </section>
  );
}

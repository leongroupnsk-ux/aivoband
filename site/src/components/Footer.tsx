import Link from "next/link";
import Logo from "./Logo";
import { solutions } from "@/data/solutions";

export default function Footer() {
  return (
    <footer className="border-t border-primary-l/10 bg-ink py-14 text-[14.5px] text-subtle">
      <div className="container-site grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <span className="flex items-center gap-2.5 font-display text-[19px] font-bold text-white">
            <Logo size={24} /> Aivo
          </span>
          <p className="mt-3.5 max-w-[34ch]">
            Внедряем ИИ-системы, которые отвечают точно, работают 24/7 и окупаются.
          </p>
        </div>
        <nav aria-label="Решения">
          <p className="mb-3.5 font-display font-semibold text-[15px] text-white">Решения</p>
          <ul className="space-y-2">
            {solutions.map((s) => (
              <li key={s.slug}>
                <Link className="transition-colors hover:text-white" href={`/solutions/${s.slug}`}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Компания">
          <p className="mb-3.5 font-display font-semibold text-[15px] text-white">Компания</p>
          <ul className="space-y-2">
            <li><Link className="transition-colors hover:text-white" href="/process">Как мы работаем</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/scenarios">Сценарии внедрения</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/cases">Кейсы</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/about">О нас</Link></li>
            <li><Link className="transition-colors hover:text-white" href="/contacts">Контакты</Link></li>
          </ul>
        </nav>
        <nav aria-label="Ресурсы">
          <p className="mb-3.5 font-display font-semibold text-[15px] text-white">Ресурсы</p>
          <ul className="space-y-2">
            <li><Link className="transition-colors hover:text-white" href="/blog">Блог</Link></li>
            <li>
              <a className="transition-colors hover:text-white" href="https://aivochat.ru" rel="noopener" target="_blank">
                Aivo Chat — платформа
              </a>
            </li>
            <li><a className="transition-colors hover:text-white" href="https://t.me/reklamshek" rel="noopener">Telegram</a></li>
            <li><Link className="transition-colors hover:text-white" href="/privacy">Политика ПД</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container-site mt-12 border-t border-primary-l/10 pt-6 font-mono text-xs">
        © {new Date().getFullYear()} Aivo · ИИ, который не выдумывает
      </div>
    </footer>
  );
}

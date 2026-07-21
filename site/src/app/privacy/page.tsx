import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description: "Политика обработки персональных данных Aivo.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <section className="section-y">
      <div className="container-site max-w-[760px]">
        <h1 className="text-[clamp(32px,4vw,44px)]">Политика обработки персональных данных</h1>
        <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-subtle">
          <p>
            [Плейсхолдер, этап 6/7 — юридический текст готовится на основе юрданных заказчика: наименование оператора, ИНН/ОГРН, адрес, цели и сроки обработки, перечень данных.]
          </p>
          <p>
            Через формы сайта мы собираем: имя, контакт (Telegram / телефон / email) и текст сообщения — исключительно для ответа на заявку. Данные не передаются третьим лицам и хранятся в защищённом месте.
          </p>
          <p>Вопросы по данным: <a href="mailto:nikitaoshepkove@gmail.com" className="underline underline-offset-2">nikitaoshepkove@gmail.com</a>.</p>
        </div>
      </div>
    </section>
  );
}

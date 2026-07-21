import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Контакты и заявка",
  description: "Расскажите о задаче — в течение 24 часов предложим решение, сроки и оценку. Telegram, email, форма заявки.",
};

export default function ContactsPage() {
  return (
    <section className="section-y">
      <div className="container-site grid items-start gap-14 lg:grid-cols-2">
        <div>
          <span className="eyebrow">Контакты</span>
          <h1 className="mt-5 max-w-[16ch] text-[clamp(38px,5vw,54px)]">Расскажите о задаче</h1>
          <p className="mt-6 max-w-[44ch] text-[18px] text-subtle">
            Отвечаем в течение 24 часов. Разбор задачи и предварительная оценка — бесплатно.
          </p>
          <div className="mt-10 space-y-4">
            <div className="card-n !p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-subtle">Telegram</p>
              <a href="https://t.me/reklamshek" rel="noopener" className="mt-1 block text-[17px] text-primary-l hover:underline">
                @reklamshek
              </a>
            </div>
            <div className="card-n !p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-subtle">Email</p>
              <a href="mailto:nikitaoshepkove@gmail.com" className="mt-1 block text-[17px] text-primary-l hover:underline">
                nikitaoshepkove@gmail.com
              </a>
            </div>
          </div>
        </div>
        <div className="card-n">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

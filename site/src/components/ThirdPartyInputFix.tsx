"use client";

import { useEffect } from "react";

/**
 * Гасим автозаполнение браузера в полях сторонних виджетов (чат aivochat.ru).
 *
 * Проблема: у поля ввода виджета нет атрибута autocomplete, и Chrome по своим
 * эвристикам принимает его за платёжное — при фокусе показывает сохранённые карты
 * пользователя. Выглядит пугающе и мешает печатать.
 *
 * Правильное место фикса — сам виджет, но пока правим со стороны сайта: всем полям,
 * которые не наши (без класса .field) и без явного autocomplete, проставляем "off".
 * Наблюдаем за DOM, потому что виджет монтируется асинхронно и может перерисовываться.
 */
export default function ThirdPartyInputFix() {
  useEffect(() => {
    const harden = (root: ParentNode) => {
      const fields = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
      fields.forEach((el) => {
        if (el.classList.contains("field")) return; // наши поля не трогаем
        if (el.getAttribute("autocomplete")) return; // уже задано владельцем
        el.setAttribute("autocomplete", "off");
        el.setAttribute("data-form-type", "other"); // подсказка менеджерам паролей
        const form = el.closest("form");
        if (form && !form.getAttribute("autocomplete")) form.setAttribute("autocomplete", "off");
      });
    };

    harden(document);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType === 1) harden(n as Element);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

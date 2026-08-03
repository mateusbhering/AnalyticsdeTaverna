"use client";

import { useState } from "react";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

type Event = { time: string; title: string };
type EventMap = Record<string, Event[]>;

const EVENTS: EventMap = {
  "2026-05-11": [
    { time: "11:30", title: "REUNIÃO COM NEMEC (2TSCPF)" },
  ],
  "2026-06-26": [
    { time: "", title: "DEADLINE" },
  ],
};

function eventKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AdminCalendar() {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<number | null>(today.getDate());

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const hasEvent = (day: number) => !!EVENTS[eventKey(year, month, day)];

  const prev = () => { setCurrent(new Date(year, month - 1, 1)); setSelected(null); };
  const next = () => { setCurrent(new Date(year, month + 1, 1)); setSelected(null); };

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedEvents = selected ? (EVENTS[eventKey(year, month, selected)] ?? []) : [];

  return (
    <div className="paper-card paper-frame p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prev}
          className="w-8 h-8 bg-[rgba(60,42,24,0.06)] border border-[rgba(96,66,26,0.35)] text-[var(--ink-70)] hover:border-[var(--seal)] hover:text-[var(--seal)] transition-all flex items-center justify-center cursor-pointer"
        >
          ‹
        </button>
        <div className="text-center">
          <div
            className="text-[var(--ink)] font-bold"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {MONTHS[month]}
          </div>
          <div className="text-[var(--ink-50)] text-xs">{year}</div>
        </div>
        <button
          onClick={next}
          className="w-8 h-8 bg-[rgba(60,42,24,0.06)] border border-[rgba(96,66,26,0.35)] text-[var(--ink-70)] hover:border-[var(--seal)] hover:text-[var(--seal)] transition-all flex items-center justify-center cursor-pointer"
        >
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[var(--foil)] text-xs py-1 font-semibold"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const todayCell = isToday(day);
          const selectedCell = selected === day;
          const event = hasEvent(day);

          return (
            <button
              key={day}
              onClick={() => setSelected(day)}
              className={`
                relative aspect-square text-sm font-medium transition-all duration-150 flex items-center justify-center cursor-pointer
                ${todayCell
                  ? "bg-[var(--seal)] text-[#f6e6c2] shadow-[0_2px_8px_rgba(140,35,24,0.4)]"
                  : selectedCell
                  ? "bg-[rgba(140,35,24,0.12)] border border-[rgba(140,35,24,0.5)] text-[var(--seal)]"
                  : "text-[var(--ink-70)] hover:bg-[rgba(60,42,24,0.08)] hover:text-[var(--ink)]"
                }
              `}
            >
              {day}
              {event && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--gold)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day info */}
      <div className="mt-4 pt-4 border-t border-[rgba(96,66,26,0.25)]">
        {selectedEvents.length > 0 ? (
          <div className="space-y-2">
            {selectedEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-[rgba(201,151,63,0.12)] border border-[rgba(138,100,40,0.4)]">
                <div className="text-[var(--foil)] font-bold text-xs w-10 flex-shrink-0">{ev.time}</div>
                <div className="text-[var(--ink)] text-xs font-semibold">{ev.title}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-[var(--ink-50)] italic">
            {selected
              ? `${selected} de ${MONTHS[month]} de ${year} — sem compromissos`
              : "Selecione um dia"}
          </div>
        )}
      </div>
    </div>
  );
}

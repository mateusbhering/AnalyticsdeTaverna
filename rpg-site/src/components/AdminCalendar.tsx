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
    <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prev}
          className="w-8 h-8 rounded-lg bg-white/5 border border-purple-800/30 text-purple-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="text-white font-bold">{MONTHS[month]}</div>
          <div className="text-purple-400/60 text-xs">{year}</div>
        </div>
        <button
          onClick={next}
          className="w-8 h-8 rounded-lg bg-white/5 border border-purple-800/30 text-purple-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-purple-500/60 text-xs py-1 font-semibold">
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
                relative aspect-square rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center
                ${todayCell
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : selectedCell
                  ? "bg-purple-900/60 border border-purple-600/60 text-white"
                  : "text-purple-300/80 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              {day}
              {event && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day info */}
      <div className="mt-4 pt-4 border-t border-purple-900/40">
        {selectedEvents.length > 0 ? (
          <div className="space-y-2">
            {selectedEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-900/20 border border-amber-700/40">
                <div className="text-amber-400 font-bold text-xs w-10 flex-shrink-0">{ev.time}</div>
                <div className="text-white text-xs font-semibold">{ev.title}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-purple-400/50">
            {selected
              ? `${selected} de ${MONTHS[month]} de ${year} — sem compromissos`
              : "Selecione um dia"}
          </div>
        )}
      </div>
    </div>
  );
}

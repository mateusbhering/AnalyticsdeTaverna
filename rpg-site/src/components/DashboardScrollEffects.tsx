"use client";
import { useEffect, useRef } from "react";

/** Efeitos de apresentação; não lê nem altera dados ou cálculos do dashboard. */
export default function DashboardScrollEffects() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const scene = marker.current?.closest(".dashboard-painted-scene");
    const panel = scene?.querySelector<HTMLElement>(".dashboard-painted-scroll");
    const nav = scene?.querySelector<HTMLElement>(".dashboard-analyst-nav");
    if (!panel || !nav) return;
    const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#dashboard-"]')];
    const targets = links.map(link => panel.querySelector<HTMLElement>(link.hash));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visualFrame = 0;
    let motionFrame = 0;
    let destination = panel.scrollTop;
    let previousTime = 0;

    const update = () => {
      visualFrame = 0;
      const bounds = panel.getBoundingClientRect();
      const readingLine = bounds.top + Math.min(130, bounds.height * .25);
      const rectangles = targets.map(target => target?.getBoundingClientRect());
      let activeIndex = 0;
      rectangles.forEach((rect, index) => {
        if (rect && rect.top <= readingLine) activeIndex = index;
      });
      links.forEach((link, index) => {
        link.dataset.scrollState = index === activeIndex ? "active" : index < activeIndex ? "past" : "upcoming";
        if (index === activeIndex) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      panel.style.setProperty("--dashboard-fade-top", `${Math.min(72, panel.scrollTop)}px`);
      if (!motionFrame) destination = panel.scrollTop;
    };
    const scheduleUpdate = () => {
      if (!visualFrame) visualFrame = requestAnimationFrame(update);
    };
    const stopMotion = () => {
      cancelAnimationFrame(motionFrame);
      motionFrame = 0;
      previousTime = 0;
      destination = panel.scrollTop;
    };
    const animate = (time: number) => {
      const elapsed = Math.min(previousTime ? time - previousTime : 16, 40);
      previousTime = time;
      const distance = destination - panel.scrollTop;
      if (Math.abs(distance) < 2.5) {
        panel.scrollTo({ top: destination, behavior: "instant" });
        stopMotion();
        return;
      }
      panel.scrollTo({ top: panel.scrollTop + distance * (1 - Math.exp(-elapsed / 95)), behavior: "instant" });
      motionFrame = requestAnimationFrame(animate);
    };
    const onWheel = (event: WheelEvent) => {
      // Toque e pequenos gestos de trackpad conservam a rolagem nativa.
      if (reducedMotion.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || (event.deltaMode === 0 && Math.abs(event.deltaY) < 50)) {
        stopMotion();
        return;
      }
      const maximum = panel.scrollHeight - panel.clientHeight;
      if (maximum <= 0) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? panel.clientHeight : 1);
      destination = Math.max(0, Math.min(maximum, (motionFrame ? destination : panel.scrollTop) + delta));
      if (!motionFrame) motionFrame = requestAnimationFrame(animate);
    };
    const resize = new ResizeObserver(scheduleUpdate);
    resize.observe(panel);
    targets.forEach(target => { if (target) resize.observe(target); });
    panel.addEventListener("scroll", scheduleUpdate, { passive: true });
    panel.addEventListener("wheel", onWheel, { passive: false });
    panel.addEventListener("touchstart", stopMotion, { passive: true });
    panel.addEventListener("pointerdown", stopMotion);
    panel.addEventListener("keydown", stopMotion);
    nav.addEventListener("click", stopMotion);
    scheduleUpdate();
    return () => {
      stopMotion();
      cancelAnimationFrame(visualFrame);
      resize.disconnect();
      panel.removeEventListener("scroll", scheduleUpdate);
      panel.removeEventListener("wheel", onWheel);
      panel.removeEventListener("touchstart", stopMotion);
      panel.removeEventListener("pointerdown", stopMotion);
      panel.removeEventListener("keydown", stopMotion);
      nav.removeEventListener("click", stopMotion);
      panel.style.removeProperty("--dashboard-fade-top");
      links.forEach(link => { delete link.dataset.scrollState; link.removeAttribute("aria-current"); });
    };
  }, []);
  return <span ref={marker} hidden aria-hidden="true" />;
}



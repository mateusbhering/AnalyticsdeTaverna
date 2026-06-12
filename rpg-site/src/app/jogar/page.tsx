import QuizForm from "@/components/QuizForm";
import Image from "next/image";

export default function JogarPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "url('https://www.transparenttextures.com/patterns/dark-wood.png'), radial-gradient(ellipse at top, rgba(74,14,14,.2) 0%, transparent 70%), #0e0e0e",
      }}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(74,14,14,0.2)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Analytics de Taverna"
              width={100}
              height={100}
              className="drop-shadow-[0_0_20px_rgba(184,134,11,0.5)]"
            />
          </a>
          <h1
            className="text-4xl text-[var(--parchment)] mb-3"
            style={{ textShadow: "0 0 30px rgba(184,134,11,0.15)" }}
          >
            Descubra sua <span className="gold-grad">Classe</span>
          </h1>
          <p className="text-[rgba(244,228,188,0.5)] italic">
            Responda as perguntas e descubra qual herói você é.
          </p>
        </div>

        <QuizForm />

        <div className="text-center mt-8">
          <a
            href="/"
            className="text-[rgba(184,134,11,0.4)] hover:text-[var(--gold)] text-sm transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

import QuizForm from "@/components/QuizForm";
import Image from "next/image";

export default function JogarPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "radial-gradient(60% 40% at 50% 0%, rgba(255,176,80,.14) 0%, transparent 70%), url('/textures/dark-wood.png'), linear-gradient(180deg, #2a180a 0%, #170d06 90%)",
      }}
    >
      <div className="relative max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Analytics de Taverna"
              width={100}
              height={100}
              className="drop-shadow-[0_0_20px_rgba(255,176,80,0.5)]"
            />
          </a>
          <h1
            className="text-4xl text-[var(--parchment)] mb-3"
            style={{ textShadow: "0 0 30px rgba(255,176,80,0.2)" }}
          >
            Descubra sua <span className="gold-grad">Classe</span>
          </h1>
          <p className="text-[rgba(240,226,189,0.55)] italic">
            Responda as perguntas e descubra qual herói você é.
          </p>
        </div>

        <QuizForm />

        <div className="text-center mt-8">
          <a
            href="/"
            className="text-[rgba(230,188,106,0.5)] hover:text-[var(--gold-light)] text-sm transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

import QuizForm from "@/components/QuizForm";
import Image from "next/image";

export default function JogarPage() {
  return (
    <div className="min-h-screen bg-[#050010] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.2)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-grid" />

      <div className="relative max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <a href="/" className="inline-flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Analytics de Taverna"
              width={100}
              height={100}
              className="drop-shadow-[0_0_20px_rgba(124,58,237,0.6)]"
            />
          </a>
          <h1 className="text-4xl font-black text-white mb-3">
            Descubra sua <span className="text-gradient-purple">Classe</span>
          </h1>
          <p className="text-purple-300/70">
            Responda as perguntas e descubra qual herói você é.
          </p>
        </div>

        <QuizForm />

        <div className="text-center mt-8">
          <a href="/" className="text-purple-400/50 hover:text-purple-300 text-sm transition-colors">
            ← Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

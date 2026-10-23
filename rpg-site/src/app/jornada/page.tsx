import { Suspense } from "react";
import Link from "next/link";
import MinhaJornada from "./MinhaJornada";

export default function JornadaPage() {
  return <main className="saved-journey-page min-h-screen px-5 py-12">
    <div className="mx-auto max-w-md"><header className="text-center mb-8"><span className="section-eyebrow">Seu lugar na taverna</span><h1 className="text-4xl gold-grad mb-3">Minha Jornada</h1><p>Seu último herói, pronto para a próxima aventura.</p></header>
    <Suspense fallback={<p role="status" className="text-center">Abrindo seu grimório…</p>}><MinhaJornada /></Suspense>
    <Link href="/" className="block text-center mt-8 text-sm">← Voltar à taverna</Link></div>
  </main>;
}

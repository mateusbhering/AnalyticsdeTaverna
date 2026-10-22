import Image from "next/image";

const characters = ["paladino", "artifice", "mago-chatgpt", "vidente", "necromante"];

export default function AnimatedClassCharacter({ index, className, label }: { index: number; className?: string; label?: string }) {
  return <Image src={`/classes/${characters[index]}.png`} alt={label ?? ""} width={1254} height={1254} unoptimized className={`original-class-animation ${className ?? ""}`} />;
}
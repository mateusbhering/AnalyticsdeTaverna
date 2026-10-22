import type { ReactNode } from "react";
import PixelQuestBackdrop from "@/components/PixelQuestBackdrop";

export default function PixelWorldZone({ stage, children }: { stage: number; children: ReactNode }) {
  return <div className={`pixel-world-zone world-zone-${stage}`}>
    <div className="pixel-world-scenery" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" focusable="false">
        <image href="/scenery/continuous-fortress-world-v2.png" x={-(stage % 2) * 100} y={-Math.floor(stage / 2) * 100} width="200" height="300" preserveAspectRatio="none" />
      </svg>
    </div>
    {stage !== 2 && stage !== 3 && <PixelQuestBackdrop showScenery={false} />}
    {children}
  </div>;
}

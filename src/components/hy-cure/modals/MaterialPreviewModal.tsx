"use client";

import type { EduMaterial } from "@/lib/hy-cure-data";
import CardNewsModal from "./CardNewsModal";
import LeafletModal from "./LeafletModal";
import VideoModal from "./VideoModal";

export default function MaterialPreviewModal({
  material,
  onClose,
}: {
  material: EduMaterial;
  onClose: () => void;
}) {
  switch (material.format) {
    case "카드뉴스":
      return <CardNewsModal material={material} onClose={onClose} />;
    case "주의사항 리플렛":
      return <LeafletModal material={material} onClose={onClose} />;
    case "동영상 가이드":
      return <VideoModal material={material} onClose={onClose} />;
    default:
      return null;
  }
}

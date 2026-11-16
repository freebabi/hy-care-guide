"use client";

import Image from "next/image";
import { useState } from "react";
import { IMAGE_APPROVAL_LABEL, getImageAsset } from "@/lib/care-guide/image-assets";
import type { GuideImageAsset } from "@/lib/care-guide/types";
import Modal from "./modals/Modal";
import { withBasePath } from "@/lib/care-guide/base-path";

const ZOOMS = [1, 2, 3] as const;

/** 눌러서 크게 보는 확대 창. 비율은 그대로 두고 배율만 바꾸며, 넘치면 창 안에서 스크롤합니다. */
function Lightbox({ asset, onClose }: { asset: GuideImageAsset; onClose: () => void }) {
  // 가로로 매우 긴 그림(예: 7단계 인포그래픽)은 처음부터 2배로 보여 글자가 읽히게 합니다.
  const [zoom, setZoom] = useState<number>(asset.width / asset.height > 2.2 ? 2 : 1);

  return (
    <Modal onClose={onClose} ariaLabel={`${asset.description} 크게 보기`} maxWidthClassName="sm:max-w-5xl">
      <div className="flex flex-col gap-3 p-4 pt-5 sm:p-6">
        <div className="pr-10">
          <h2 className="text-base font-extrabold text-slate-900">{asset.description}</h2>
          <p className="mt-0.5 text-xs text-slate-600">
            그림을 손가락으로 밀거나 마우스로 스크롤해 구석구석 볼 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="그림 확대 배율">
          <span className="text-xs font-semibold text-slate-700">크기</span>
          {ZOOMS.map((z) => (
            <button
              key={z}
              type="button"
              aria-pressed={zoom === z}
              onClick={() => setZoom(z)}
              className={`min-h-[40px] min-w-[56px] rounded-full border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
                zoom === z
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-blue-soft/60"
              }`}
            >
              {z === 1 ? "화면에 맞춤" : `${z}배`}
            </button>
          ))}
        </div>
        <div className="max-h-[62vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50" tabIndex={0} aria-label="확대한 그림">
          <Image
            src={withBasePath(asset.src)}
            alt={asset.alt}
            width={asset.width}
            height={asset.height}
            unoptimized
            sizes="100vw"
            style={{ width: `${zoom * 100}%`, maxWidth: "none", height: "auto" }}
          />
        </div>
        {asset.caption && <p className="text-xs leading-relaxed text-slate-700">{asset.caption}</p>}
      </div>
    </Modal>
  );
}

/**
 * 상세 화면 안에 들어가는 안내 이미지. 비율을 유지하고, 누르면 확대 창이 열립니다.
 * 세로로 긴 포스터는 폭을 제한해 화면을 지나치게 차지하지 않게 합니다.
 */
export default function GuideFigure({ assetId, variant }: { assetId: string; variant: "staff" | "patient" }) {
  const asset = getImageAsset(assetId);
  const [open, setOpen] = useState(false);
  if (!asset) return null; // 등록되지 않은 이미지는 표시하지 않습니다.

  const portrait = asset.height > asset.width;
  const approved = asset.approval === "approved";

  return (
    <figure className={`flex flex-col gap-2 ${portrait ? "mx-auto w-full max-w-[440px]" : "w-full"}`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${asset.description} — 눌러서 크게 보기`}
        className="group relative block overflow-hidden rounded-xl border border-slate-200 bg-white text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-2"
      >
        <Image
          src={withBasePath(asset.src)}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          unoptimized
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 680px"
          className="block h-auto w-full"
        />
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-brand-blue-dark/90 px-3 py-1.5 text-xs font-bold text-white print:hidden">
          눌러서 크게 보기
        </span>
      </button>
      <figcaption className={`flex flex-col gap-1 leading-relaxed text-slate-700 ${variant === "patient" ? "text-sm" : "text-xs"}`}>
        {asset.caption && <span>{asset.caption}</span>}
        {!approved && (
          <span className="w-fit rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 ring-1 ring-amber-200">
            {variant === "staff" ? IMAGE_APPROVAL_LABEL[asset.approval] : "부서 승인 전 안내자료"}
          </span>
        )}
      </figcaption>
      {open && <Lightbox asset={asset} onClose={() => setOpen(false)} />}
    </figure>
  );
}

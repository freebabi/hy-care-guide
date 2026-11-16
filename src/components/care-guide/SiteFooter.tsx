import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import CurrentYear from "./CurrentYear";
import { withBasePath } from "@/lib/care-guide/base-path";

/**
 * 모든 페이지 공통 공식 푸터.
 * 요청된 정보(플랫폼명·설명·주소·전화·저작권)만 담고, 외부 링크는 전화 연결 하나뿐입니다.
 * 색상: 배경 #26384D / 기본 글자 #FFFFFF / 보조 글자 #C2CCD8 / 구분선 #536273
 * 너비·좌우 여백은 본문(max-w-6xl)과 같은 기준이라 위아래로 정렬이 맞습니다.
 */
export default function SiteFooter() {
  return (
    <footer className="w-full bg-[#26384D] text-white print:hidden" aria-label="HY CARE GUIDE 하단 정보" data-site-footer>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 py-7 md:flex-row md:items-start md:justify-between md:gap-10 md:py-8">
          <div className="flex items-center gap-3.5 md:max-w-sm">
            {/* 은색(실버) 한양대학교병원 로고: 어두운 푸터 배경에서 선명하게 보입니다. */}
            <Image src={withBasePath("/assets/hyumc-logo-silver.png")} alt="" width={40} height={49} unoptimized className="h-11 w-auto shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[17px] font-extrabold tracking-[0.04em] text-white">HY CARE GUIDE</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#C2CCD8]">한양대학교병원 환자 안내 콘텐츠 플랫폼</p>
            </div>
          </div>

          <address className="flex flex-col gap-2.5 text-sm not-italic md:max-w-md md:items-start">
            <p className="flex items-start gap-2.5 leading-relaxed text-[#C2CCD8]">
              <MapPin className="mt-[3px] h-4 w-4 shrink-0 text-[#C2CCD8]" aria-hidden="true" />
              <span className="min-w-0 break-keep">
                <span className="sr-only">주소: </span>서울특별시 성동구 왕십리로 222-1 동관 9층 서비스전략팀
              </span>
            </p>
            <p className="flex items-center gap-2.5 text-[#C2CCD8]">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a
                href="tel:0222909631"
                className="-my-2 inline-flex min-h-[44px] items-center font-semibold tabular-nums text-white underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:my-0 md:min-h-0"
                aria-label="전화 02-2290-9631"
              >
                02-2290-9631
              </a>
            </p>
          </address>
        </div>

        <div className="border-t border-[#536273] py-4">
          <p className="text-xs leading-relaxed text-[#C2CCD8]">
            Copyright © <CurrentYear /> Hanyang University Medical Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

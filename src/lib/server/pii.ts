/**
 * 환자 식별정보로 보이는 숫자 패턴(주민등록번호, 전화번호)이 들어 있으면 true.
 * 자료 묶음 제목·설명, 개선 요청 내용 같은 자유 입력에 환자 정보가 저장되는 것을 막기 위한 최소한의 안전장치입니다.
 */
export function looksLikePersonalData(text: string): boolean {
  return /\d{6}\s*-?\s*[1-8]\d{6}/.test(text) || /0\d{1,2}\s*-?\s*\d{3,4}\s*-?\s*\d{4}/.test(text) || /01[016789]\s*-?\s*\d{3,4}\s*-?\s*\d{4}/.test(text);
}

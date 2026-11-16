import "server-only";

/** 요청 처리 중 호출한 사람에게 그대로 알려도 되는 오류(상태 코드 + 한국어 메시지). */
export class ApiFail extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiFail";
  }
}

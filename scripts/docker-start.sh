#!/bin/sh
# HY CARE GUIDE 컨테이너 시작 스크립트 (HY AGENT PLACE)
#
# 하는 일
#  1) 플랫폼이 넣어 준 APP_BASE_PATH(예: /apps/앱이름)를 읽어, 빌드 결과물 안의 자리표시(/__APP_BASE_PATH__)를 그 값으로 바꾼다.
#     Next.js 의 basePath 는 빌드 때 고정되므로 이 방식이 필요하다. 값을 코드에 적어 두지 않는다.
#  2) APP_DATA_DIR(서버 데이터 폴더)를 확인한다. 쓸 수 없으면 경고만 남긴다.
#  3) 필수 환경변수 이름이 비어 있으면 이름만 경고한다(값은 절대 출력하지 않는다).
#  4) 8000번 포트로 서버를 시작한다.
#
# 로컬 시험용: APP_DIR(앱 폴더), HYCG_PORT(포트)를 바꿀 수 있다. 플랫폼에서는 기본값(/app, 8000)을 쓴다.
set -eu

APP_DIR="${APP_DIR:-/app}"
TOKEN="__APP_BASE_PATH__"
cd "$APP_DIR"

log() { echo "[docker-start] $*"; }
fail() { echo "[docker-start] 오류: $*" >&2; exit 1; }

# ---- 1) APP_BASE_PATH 정리·검사 ----
RAW="${APP_BASE_PATH:-}"
CLEAN=$(printf '%s' "$RAW" | tr -d '[:space:]' | sed -e 's|^/*||' -e 's|/*$||')
if [ -z "$CLEAN" ]; then VALUE=""; else VALUE="/$CLEAN"; fi
if [ -n "$VALUE" ]; then
  printf '%s' "$VALUE" | grep -Eq '^/[A-Za-z0-9._~-]+(/[A-Za-z0-9._~-]+)*$' \
    || fail "APP_BASE_PATH 형식이 올바르지 않습니다(영문·숫자·점·밑줄·하이픈·/ 만 가능)."
  case "$VALUE" in
    */./*|*/../*|*/.|*/..) fail "APP_BASE_PATH 에 . 또는 .. 구간을 쓸 수 없습니다." ;;
  esac
fi

# 파일 안의 문자열을 바꾼다. `sed -i`는 파일 옆에 임시 파일을 만들어야 해서, 앱 폴더(/app)가 root 소유이고 실행 사용자가
# node 이면 "Permission denied" 로 실패한다. 그래서 임시 파일은 /tmp 에 만들고 원래 파일 내용을 덮어쓴다(파일 쓰기 권한만 있으면 된다).
# 사용: apply_sed "<파일 목록(줄바꿈 구분)>" <sed 인자...>
apply_sed() {
  list="$1"
  shift
  tmp="$(mktemp "${TMPDIR:-/tmp}/hycg-sed.XXXXXX")" || fail "임시 파일을 만들 수 없습니다."
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    sed "$@" "$f" > "$tmp" || { rm -f "$tmp"; fail "치환하지 못했습니다: $f"; }
    cat "$tmp" > "$f" || { rm -f "$tmp"; fail "파일을 쓸 수 없습니다(권한 확인): $f"; }
  done <<HYCG_LIST
$list
HYCG_LIST
  rm -f "$tmp"
}

MARKER="$APP_DIR/.next/.base-path-applied"
if [ -f "$MARKER" ]; then
  APPLIED=$(cat "$MARKER")
  if [ "$APPLIED" != "$VALUE" ]; then
    fail "이 컨테이너는 이미 다른 APP_BASE_PATH 로 적용되었습니다. 이미지를 새로 시작(컨테이너 재생성)해 주세요."
  fi
  log "APP_BASE_PATH 는 이미 적용되어 있습니다: '${VALUE:-/}'"
else
  FILES=$(grep -rlF -- "$TOKEN" "$APP_DIR/server.js" "$APP_DIR/.next" 2>/dev/null || true)
  if [ -n "$FILES" ]; then
    COUNT=$(printf '%s\n' "$FILES" | wc -l | tr -d ' ')
    if [ -n "$VALUE" ]; then
      ENC=$(printf '%s' "$VALUE" | sed 's|/|%2F|g')
      # 일반 형태(/__APP_BASE_PATH__)와 주소에 인코딩되어 들어간 형태(%2F__APP_BASE_PATH__)를 모두 바꾼다.
      apply_sed "$FILES" -e "s|/$TOKEN|$VALUE|g" -e "s|%2F$TOKEN|$ENC|g"
    else
      # 루트에서 실행: 자리표시를 지운다.
      #  - 코드(.js/.json)의 "/__APP_BASE_PATH__" 값(basePath 설정·BASE_PATH 상수)은 빈 문자열("")이어야 한다("/"이면 모든 주소가 깨짐).
      #  - 미리 만들어진 화면 자료(.html/.rsc 등)의 홈 링크 "/__APP_BASE_PATH__" 는 빈 주소가 되지 않게 "/" 로 바꾼다.
      CODE_FILES=$(printf '%s\n' "$FILES" | grep -E '\.(js|mjs|cjs|json)$' || true)
      DATA_FILES=$(printf '%s\n' "$FILES" | grep -Ev '\.(js|mjs|cjs|json)$' || true)
      if [ -n "$CODE_FILES" ]; then
        apply_sed "$CODE_FILES" -e "s|\"/$TOKEN\"|\"\"|g" -e "s|'/$TOKEN'|''|g" -e "s|\`/$TOKEN\`|\`\`|g" \
          -e "s|/$TOKEN/|/|g" -e "s|%2F$TOKEN%2F|%2F|g" -e "s|/$TOKEN||g" -e "s|%2F$TOKEN||g"
      fi
      if [ -n "$DATA_FILES" ]; then
        apply_sed "$DATA_FILES" -e "s|\"/$TOKEN\"|\"/\"|g" -e "s|'/$TOKEN'|'/'|g" \
          -e "s|/$TOKEN/|/|g" -e "s|%2F$TOKEN%2F|%2F|g" -e "s|/$TOKEN||g" -e "s|%2F$TOKEN||g"
      fi
    fi
    REMAIN=$(grep -rlF -- "$TOKEN" "$APP_DIR/server.js" "$APP_DIR/.next" 2>/dev/null | wc -l | tr -d ' ')
    log "APP_BASE_PATH '${VALUE:-/}' 적용: 파일 ${COUNT}개 처리, 남은 자리표시 파일 ${REMAIN}개"
    [ "$REMAIN" = "0" ] || log "경고: 자리표시가 남아 있는 파일이 있습니다."
  else
    log "치환할 자리표시가 없습니다(자리표시 없이 빌드된 이미지)."
  fi
  printf '%s' "$VALUE" > "$MARKER" 2>/dev/null || log "경고: 적용 표시 파일을 쓰지 못했습니다."
fi

# ---- 2) 서버 데이터 폴더(APP_DATA_DIR) ----
if [ -z "${APP_DATA_DIR:-}" ]; then
  export APP_DATA_DIR="/tmp/hycg-data"
  export HYCG_DATA_DIR_TEMP=1 # 앱이 "저장이 안전하다"고 표시하지 않도록 임시 폴더임을 알린다.
  log "경고: APP_DATA_DIR 가 비어 있어 임시 폴더($APP_DATA_DIR)를 씁니다. 재배포하면 저장한 데이터가 사라집니다."
fi
mkdir -p "$APP_DATA_DIR" 2>/dev/null || true
if ( : > "$APP_DATA_DIR/.write-test" ) 2>/dev/null; then
  rm -f "$APP_DATA_DIR/.write-test"
  log "APP_DATA_DIR 쓰기 확인: $APP_DATA_DIR"
else
  log "경고: APP_DATA_DIR($APP_DATA_DIR)에 쓸 수 없습니다. 내 보관함·최근 본 자료·공지·접속 기록이 저장되지 않습니다. 폴더 권한을 확인하세요."
fi

# ---- 3) 필수 환경변수 이름 점검(값은 출력하지 않음) ----
for NAME in SESSION_SECRET ADMIN_PASSWORD ADMIN_EMPLOYEE_ID ADMIN_NAME; do
  eval "VAL=\${$NAME:-}"
  [ -n "$VAL" ] || log "경고: 환경변수 $NAME 이(가) 비어 있습니다(포털 '앱 비밀값'에 입력 후 다시 배포)."
done

# ---- 4) 서버 시작(8000번 포트) ----
export PORT="${HYCG_PORT:-8000}"
export HOSTNAME="0.0.0.0"
log "서버를 시작합니다: 0.0.0.0:$PORT, 주소 앞부분 '${VALUE:-/}'"
exec node server.js

# HY CARE GUIDE — HY AGENT PLACE(병원 내부 플랫폼) 배포용 이미지
#
# 플랫폼 조건
#  - 앱은 8000번 포트에서 응답한다.
#  - APP_BASE_PATH(주소 앞부분)는 빌드 때 고정할 수 없으므로, 자리표시(/__APP_BASE_PATH__)로 빌드하고
#    컨테이너가 시작될 때 scripts/docker-start.sh 가 실제 값으로 바꾼다.
#  - `RUN chown -R` 는 쓰지 않는다(파일이 많으면 빌드가 매우 느려짐). 소유자는 COPY --chown 으로만 정한다.
#
# 환경변수(값은 포털 "앱 비밀값"에 입력하며 이미지에는 넣지 않는다): SESSION_SECRET, ADMIN_PASSWORD, ADMIN_EMPLOYEE_ID,
# ADMIN_NAME. APP_DATA_DIR·APP_BASE_PATH 는 플랫폼이 자동으로 넣어 준다. 자세한 설명: docs/deployment/HY_AGENT_PLACE_DEPLOYMENT.md

# ---------- 1) 빌드 ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# 윈도 줄바꿈(CRLF)이 섞여 들어와도 시작 스크립트가 깨지지 않게 정리한다.
RUN sed -i 's/\r$//' scripts/docker-start.sh

# 자리표시로 빌드한다. 실제 APP_BASE_PATH 는 컨테이너 시작 때 적용된다.
ENV APP_BASE_PATH=/__APP_BASE_PATH__
ENV NEXT_OUTPUT=standalone
RUN npm run build && rm -rf .next/standalone/.data && rm -f .next/standalone/.env .next/standalone/.env.*

# ---------- 2) 실행 ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8000
ENV HOSTNAME=0.0.0.0

# 실행에 필요한 최소 묶음(standalone) + 정적 파일 + public + 시작 스크립트. 소유자는 COPY 때 정한다.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/scripts/docker-start.sh ./docker-start.sh

# 일반 사용자로 실행한다. 플랫폼이 APP_DATA_DIR 를 root 소유로 연결해 저장이 안 되면(시작 로그에 경고가 나온다)
# 플랫폼 담당자와 상의해 이 줄을 빼거나 폴더 권한을 맞춘다.
USER node

EXPOSE 8000
CMD ["sh", "./docker-start.sh"]

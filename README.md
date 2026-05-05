# Pagely Frontend

중고 도서 마켓 + TossPayments 결제 연동 React 앱

## 실행 환경

- Node.js 18+
- 백엔드 서버 (gateway-server, user-service, market-service, payment-service) 실행 중

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev
```

## 백엔드 연동

Vite 개발 서버가 `/api` 경로를 `http://localhost:8080` (gateway-server)으로 프록시합니다.

백엔드 서비스 포트 구성:

| 서비스 | 포트 |
|--------|------|
| gateway-server | 8080 |
| user-service | 19001 |
| market-service | 19021 |
| payment-service | 19041 |

## 주요 화면

| 경로 | 설명 |
|------|------|
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/` | 판매글 목록 (AVAILABLE 상태만 표시) |
| `/sale-posts/:id` | 판매글 상세 + 구매하기 |
| `/widget/checkout` | TossPayments 결제 위젯 |
| `/widget/success` | 결제 확인 (payment-service confirm 호출) |
| `/orders` | 내 주문 목록 |
| `/orders/:orderId` | 주문 상세 |

## 결제 흐름

1. 판매글 상세에서 **구매하기** 클릭
2. `POST /api/v1/orders` → 주문 생성
3. TossPayments 결제 위젯에서 결제 진행
4. 결제 성공 시 `/widget/success`로 리다이렉트
5. `POST /api/v1/payments/confirm` 호출 → 결제 확정

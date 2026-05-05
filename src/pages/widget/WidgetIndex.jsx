import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useEffect, useState } from 'react';

const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

export function WidgetIndexPage() {
  const [amount, setAmount] = useState({ currency: 'KRW', value: 22000 });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);

  useEffect(() => {
    async function init() {
      const tossPayments = await loadTossPayments(clientKey);
      const w = tossPayments.widgets({ customerKey: generateRandomString() });
      setWidgets(w);
    }
    init();
  }, []);

  useEffect(() => {
    if (widgets == null) return;

    async function renderPaymentWidgets() {
      // ------  주문서의 결제 금액 설정 ------
      // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
      await widgets.setAmount(amount);

      await Promise.all([
        // ------  결제 UI 렌더링 ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
        widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
        // ------  이용약관 UI 렌더링 ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderagreement
        widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '30px', maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* 주문서형 결제 */}
        <div className="wrapper" style={{ flex: 1, display: 'flex' }}>
          <div
            className="box_section"
            style={{ padding: '40px 30px 50px 30px', marginTop: '30px', marginBottom: '50px', flex: 1 }}
          >
            <h2 className="title">주문서형 결제</h2>
            <p style={{ margin: '8px 0 24px', color: '#8b95a1', fontSize: '14px' }}>
              주문서 안에서 결제 방법 선택(widget/checkout)
            </p>
            {/* 결제 UI */}
            <div id="payment-method" />
            {/* 이용약관 UI */}
            <div id="agreement" />
            {/* 쿠폰 체크박스 */}
            <div style={{ paddingLeft: '30px' }}>
              <div className="checkable typography--p">
                <label htmlFor="coupon-box" className="checkable__label typography--regular">
                  <input
                    id="coupon-box"
                    className="checkable__input"
                    type="checkbox"
                    aria-checked="true"
                    disabled={!ready}
                    // ------  주문서의 결제 금액이 변경되었을 경우 결제 금액 업데이트 ------
                    // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
                    onChange={async (event) => {
                      await widgets.setAmount({
                        currency: amount.currency,
                        value: event.target.checked ? amount.value - 5000 : amount.value,
                      });
                    }}
                  />
                  <span className="checkable__label-text">5,000원 쿠폰 적용</span>
                </label>
              </div>
            </div>
            {/* 결제하기 버튼 */}
            <button
              className="button"
              style={{ marginTop: '30px' }}
              disabled={!ready}
              // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
              // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
              onClick={async () => {
                try {
                  // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
                  // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
                  await widgets.requestPayment({
                    orderId: 'c9001bcd-df9a-4a36-9dfb-e548215e60bf',
                    orderName: '도메인 주도 설계(DDD) 책 팝니다 (상태 좋음)',
                    successUrl: window.location.origin + '/widget/success',
                    failUrl: window.location.origin + '/fail',
                    customerEmail: 'customer123@gmail.com',
                    customerName: '김토스',
                    // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
                    // customerMobilePhone: "01012341234",
                  });
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}

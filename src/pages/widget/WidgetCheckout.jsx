import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
const customerKey = generateRandomString();

export function WidgetCheckoutPage() {
  const { state } = useLocation();
  const orderId = state?.orderId ?? 'c9001bcd-df9a-4a36-9dfb-e548215e60bf';
  const orderName = state?.orderName ?? '주문';
  const [amount, setAmount] = useState({
    currency: 'KRW',
    value: state?.price ?? 22000,
  });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey });
        setWidgets(widgets);
      } catch (error) {
        console.error('Error fetching payment widget:', error);
      }
    }
    fetchPaymentWidgets();
  }, []);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) return;
      await widgets.setAmount(amount);
      await Promise.all([
        widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
        widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' }),
      ]);
      setReady(true);
    }
    renderPaymentWidgets();
  }, [widgets]);

  return (
    <div className="wrapper">
      <div className="box_section">
        {/* 주문 정보 */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #f2f4f6', marginBottom: '8px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#191f28', marginBottom: '8px' }}>
            {orderName}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1b64da' }}>
            {Number(amount.value).toLocaleString()}원
          </div>
        </div>

        {/* 결제 UI */}
        <div id="payment-method" />
        {/* 이용약관 UI */}
        <div id="agreement" />

        {/* 결제하기 버튼 */}
        <button
          className="button"
          style={{ marginTop: '30px' }}
          disabled={!ready}
          onClick={async () => {
            try {
              await widgets.requestPayment({
                orderId,
                orderName,
                successUrl: window.location.origin + '/widget/success',
                failUrl: window.location.origin + '/fail',
                customerEmail: 'customer123@gmail.com',
                customerName: '김토스',
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
  );
}

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}

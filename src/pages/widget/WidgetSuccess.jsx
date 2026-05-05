import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../api/client';

export function WidgetSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | fail
  const [errorMsg, setErrorMsg] = useState('');
  const [payment, setPayment] = useState(null);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = Number(searchParams.get('amount'));

    apiFetch('/api/v1/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error?.message || body?.message || `HTTP ${res.status}`);
        }
        setPayment(body.data ?? body);
        setStatus('success');
      })
      .catch((e) => {
        setErrorMsg(e.message);
        setStatus('fail');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div style={centerStyle}>
        <div style={cardStyle}>
          <div style={{ marginBottom: '20px' }}>
            <Spinner />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>결제 처리 중...</h2>
          <p style={{ color: '#8b95a1', fontSize: '14px', marginTop: '8px' }}>잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  if (status === 'fail') {
    return (
      <div style={centerStyle}>
        <div style={cardStyle}>
          <img width="80px" src="https://static.toss.im/illusts/check-red-spot-ending-frame.png"
            onError={(e) => { e.target.style.display = 'none'; }} />
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '16px', color: '#dc2626' }}>결제에 실패했어요</h2>
          <p style={{ color: '#8b95a1', fontSize: '14px', marginTop: '8px', wordBreak: 'break-all' }}>{errorMsg}</p>
          <button
            className="button"
            style={btnStyle}
            onClick={() => window.history.back()}
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={centerStyle}>
      <div className="box_section" style={{ width: '500px' }}>
        <img width="80px" src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png" />
        <h2 style={{ marginTop: '16px' }}>결제를 완료했어요</h2>

        <div className="p-grid typography--p" style={{ marginTop: '40px' }}>
          <div className="p-grid-col text--left"><b>결제금액</b></div>
          <div className="p-grid-col text--right">
            {payment?.amount != null ? `${Number(payment.amount).toLocaleString()}원` : searchParams.get('amount') + '원'}
          </div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: '10px' }}>
          <div className="p-grid-col text--left"><b>주문번호</b></div>
          <div className="p-grid-col text--right">{payment?.orderId ?? searchParams.get('orderId')}</div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: '10px' }}>
          <div className="p-grid-col text--left"><b>결제 수단</b></div>
          <div className="p-grid-col text--right">{payment?.method ?? '-'}</div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: '10px' }}>
          <div className="p-grid-col text--left"><b>상태</b></div>
          <div className="p-grid-col text--right">{payment?.status ?? '-'}</div>
        </div>

        <div className="p-grid-col" style={{ marginTop: '30px' }}>
          <button
            className="button"
            style={btnStyle}
            onClick={() => window.location.href = '/'}
          >
            마켓으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: '48px',
      height: '48px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #3182f6',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto',
    }} />
  );
}

const centerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f9fafb',
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '48px 40px',
  textAlign: 'center',
  minWidth: '360px',
};

const btnStyle = {
  margin: '0',
  width: '100%',
  boxSizing: 'border-box',
};

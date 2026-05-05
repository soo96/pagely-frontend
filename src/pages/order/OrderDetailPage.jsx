import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client';

const STATUS_LABEL = {
  PENDING: '대기중',
  ACCEPTED: '수락됨',
  SHIPPING: '배송중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
  FAILED: '실패',
};

function Row({ label, value }) {
  return (
    <div className="p-grid typography--p" style={{ marginTop: '10px' }}>
      <div className="p-grid-col text--left" style={{ minWidth: '140px' }}>
        <b>{label}</b>
      </div>
      <div className="p-grid-col text--right">{value ?? '-'}</div>
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  async function fetchOrder() {
    try {
      const res = await apiFetch(`/api/v1/orders/${orderId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      setOrder(body.data ?? body);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function handleAction(action) {
    setActionError('');
    try {
      const res = await apiFetch(`/api/v1/orders/${orderId}/${action}`, { method: 'POST' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      await fetchOrder();
    } catch (e) {
      setActionError(e.message);
    }
  }

  function handlePayment() {
    navigate('/widget/checkout', { state: { orderId: order.id, price: order.price } });
  }

  if (loading) return <div className="wrapper"><p style={{ padding: '40px' }}>불러오는 중...</p></div>;

  if (!order) return (
    <div className="wrapper">
      <div className="box_section" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <p style={{ color: '#ef4444' }}>주문을 불러올 수 없습니다: {actionError}</p>
        <button className="button" style={{ marginTop: '16px' }} onClick={() => navigate('/orders')}>
          목록으로
        </button>
      </div>
    </div>
  );

  return (
    <div className="wrapper">
      <div className="box_section" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <h2>주문 상세</h2>
        <div style={{ marginTop: '24px' }}>
          <Row label="주문 ID" value={<span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{order.id}</span>} />
          <Row label="상태" value={STATUS_LABEL[order.status] ?? order.status} />
          <Row label="구매자 ID" value={order.buyerId} />
          <Row label="판매글 ID" value={order.salePostId} />
          <Row label="금액" value={order.price != null ? `${Number(order.price).toLocaleString()}원` : '-'} />
          <Row label="운송장 번호" value={order.trackingNumber} />
          <Row label="택배사" value={order.courierCompany} />
          <Row
            label="운송장 등록일"
            value={order.trackingRegisteredAt ? new Date(order.trackingRegisteredAt).toLocaleString('ko-KR') : null}
          />
          <Row label="생성일" value={order.createdAt ? new Date(order.createdAt).toLocaleString('ko-KR') : null} />
          <Row label="수정일" value={order.updatedAt ? new Date(order.updatedAt).toLocaleString('ko-KR') : null} />
        </div>

        {actionError && (
          <p style={{ color: '#ef4444', marginTop: '16px', fontSize: '14px' }}>{actionError}</p>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px', flexWrap: 'wrap' }}>
          {order.status === 'PENDING' && (
            <>
              <button className="button" onClick={handlePayment}>
                결제하기
              </button>
              <button
                className="button"
                style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                onClick={() => handleAction('cancel')}
              >
                주문 취소
              </button>
            </>
          )}
          {order.status === 'ACCEPTED' && (
            <button className="button" onClick={() => handleAction('confirm')}>
              구매 확정
            </button>
          )}
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
}

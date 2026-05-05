import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';

const STATUS_LABEL = {
  PENDING: '대기중',
  ACCEPTED: '수락됨',
  SHIPPING: '배송중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
  FAILED: '실패',
};

export function OrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('orderIds') || '[]');
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(
      ids.map((id) =>
        apiFetch(`/api/v1/orders/${id}`)
          .then((r) => (r.ok ? r.json().then((b) => b.data ?? b) : null))
          .catch(() => null)
      )
    ).then((results) => {
      setOrders(results.filter(Boolean));
      setLoading(false);
    });
  }, []);

  return (
    <div className="wrapper">
      <div className="box_section" style={{ maxWidth: '700px', margin: '40px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>주문 목록</h2>
          <button className="button" onClick={() => navigate('/orders/new')}>
            + 주문 생성
          </button>
        </div>

        {loading && <p style={{ marginTop: '24px', color: '#8b95a1' }}>불러오는 중...</p>}

        {!loading && orders.length === 0 && (
          <p style={{ marginTop: '24px', color: '#8b95a1' }}>주문 내역이 없습니다.</p>
        )}

        {!loading && orders.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>주문 ID</th>
                <th style={{ padding: '8px' }}>상태</th>
                <th style={{ padding: '8px' }}>금액</th>
                <th style={{ padding: '8px' }}>생성일</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {order.id}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {order.price != null ? `${Number(order.price).toLocaleString()}원` : '-'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleString('ko-KR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

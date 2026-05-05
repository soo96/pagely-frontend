import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';

export function CreateOrderPage() {
  const navigate = useNavigate();
  const [salePostId, setSalePostId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({ salePostId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const body = await res.json();
      const order = body.data ?? body;

      const saved = JSON.parse(localStorage.getItem('orderIds') || '[]');
      if (!saved.includes(order.id)) {
        localStorage.setItem('orderIds', JSON.stringify([...saved, order.id]));
      }

      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrapper">
      <div className="box_section" style={{ maxWidth: '500px', margin: '40px auto' }}>
        <h2>구매 요청 (주문 생성)</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Sale Post ID
          </label>
          <input
            type="text"
            value={salePostId}
            onChange={(e) => setSalePostId(e.target.value)}
            placeholder="판매글 UUID를 입력하세요"
            required
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ color: '#ef4444', marginTop: '8px', fontSize: '14px' }}>{error}</p>
          )}
          <button
            type="submit"
            className="button"
            disabled={loading}
            style={{ marginTop: '16px', width: '100%' }}
          >
            {loading ? '요청 중...' : '주문 생성'}
          </button>
        </form>
        <button
          onClick={() => navigate('/orders')}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '10px',
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          주문 목록으로
        </button>
      </div>
    </div>
  );
}

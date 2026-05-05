import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/client';

const STATUS_LABEL = {
  AVAILABLE: '판매중',
  RESERVED: '예약중',
  SOLD: '판매완료',
};

export function SalePostDetailPage() {
  const { salePostId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    apiFetch(`/api/v1/sale-posts/${salePostId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => setPost(res.data ?? res))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [salePostId]);

  async function handleBuy() {
    setBuyError('');
    setBuying(true);
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

      navigate('/widget/checkout', { state: { orderId: order.id, price: order.price, orderName: post.title } });
    } catch (e) {
      setBuyError(e.message);
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
        <p style={{ color: '#8b95a1' }}>불러오는 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
        <p style={{ color: '#ef4444' }}>오류: {error || '판매글을 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}>
          목록으로
        </button>
      </div>
    );
  }

  const canBuy = post.status === 'AVAILABLE';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 16px' }}>
      <button
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '14px', padding: 0 }}
      >
        ← 목록으로
      </button>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '28px 32px',
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, flex: 1, paddingRight: '16px' }}>
            {post.title}
          </h2>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: post.status === 'AVAILABLE' ? '#16a34a' : '#9ca3af',
              padding: '4px 12px',
              border: `1px solid ${post.status === 'AVAILABLE' ? '#16a34a' : '#9ca3af'}`,
              borderRadius: '20px',
              whiteSpace: 'nowrap',
            }}
          >
            {STATUS_LABEL[post.status] ?? post.status}
          </span>
        </div>

        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b64da', marginBottom: '20px' }}>
          {Number(post.price).toLocaleString()}원
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '0 0 20px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#374151', marginBottom: '20px' }}>
          {post.description && (
            <div>
              <span style={{ color: '#8b95a1', marginRight: '8px' }}>설명</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{post.description}</span>
            </div>
          )}
          {post.condition && (
            <div>
              <span style={{ color: '#8b95a1', marginRight: '8px' }}>상태</span>
              {post.condition}
            </div>
          )}
          {post.bookId && (
            <div>
              <span style={{ color: '#8b95a1', marginRight: '8px' }}>도서 ID</span>
              {post.bookId}
            </div>
          )}
          {post.createdAt && (
            <div>
              <span style={{ color: '#8b95a1', marginRight: '8px' }}>등록일</span>
              {new Date(post.createdAt).toLocaleString('ko-KR')}
            </div>
          )}
        </div>

        {buyError && (
          <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{buyError}</p>
        )}

        <button
          className="button"
          disabled={!canBuy || buying}
          onClick={handleBuy}
          style={{ width: '100%', fontSize: '16px', padding: '14px', margin: 0, boxSizing: 'border-box', opacity: canBuy ? 1 : 0.5, cursor: canBuy ? 'pointer' : 'not-allowed' }}
        >
          {buying ? '주문 생성 중...' : canBuy ? '구매하기' : '구매 불가'}
        </button>
      </div>
    </div>
  );
}

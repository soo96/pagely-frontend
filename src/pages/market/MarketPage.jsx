import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';

const STATUS_LABEL = {
  AVAILABLE: '판매중',
  RESERVED: '예약중',
  SOLD: '판매완료',
};

const STATUS_COLOR = {
  AVAILABLE: '#16a34a',
  RESERVED: '#d97706',
  SOLD: '#9ca3af',
};

export function MarketPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/v1/sale-posts?page=${page}&size=10`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        // ApiResponse: { success, data: { content, totalPages, ... } }
        const pageData = res.data ?? res;
        const all = pageData.content ?? [];
        setPosts(all.filter((p) => p.status === 'AVAILABLE'));
        setTotalPages(pageData.totalPages ?? 1);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>중고 마켓</h1>
      <p style={{ color: '#8b95a1', fontSize: '14px', marginBottom: '24px' }}>
        판매 중인 도서 목록입니다.
      </p>

      {loading && <p style={{ color: '#8b95a1' }}>불러오는 중...</p>}
      {error && <p style={{ color: '#ef4444' }}>오류: {error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p style={{ color: '#8b95a1' }}>등록된 판매글이 없습니다.</p>
      )}

      {!loading && posts.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/sale-posts/${post.id}`)}
                style={{
                  padding: '16px 20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                    {post.title}
                  </div>
                  <div style={{ color: '#374151', fontSize: '15px' }}>
                    {Number(post.price).toLocaleString()}원
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR') : ''}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: STATUS_COLOR[post.status] ?? '#6b7280',
                    padding: '4px 10px',
                    border: `1px solid ${STATUS_COLOR[post.status] ?? '#6b7280'}`,
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {STATUS_LABEL[post.status] ?? post.status}
                </span>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
              >
                이전
              </button>
              <span style={{ padding: '6px 0', color: '#6b7280', fontSize: '14px' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1 }}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

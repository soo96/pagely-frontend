import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';

const CONDITION_OPTIONS = ['최상', '상', '중', '하'];

const RULES = {
  bookId: (v) => { if (!v) return '도서를 검색해서 선택해 주세요.'; },
  title: (v) => {
    if (!v?.trim()) return '제목을 입력하세요.';
    if (v.length > 100) return '제목은 100자 이하여야 합니다.';
  },
  description: (v) => { if (!v?.trim()) return '설명을 입력하세요.'; },
  price: (v) => {
    if (!v && v !== 0) return '가격을 입력하세요.';
    const n = Number(v);
    if (isNaN(n) || n < 1 || n > 10000000) return '가격은 1원 이상 10,000,000원 이하여야 합니다.';
  },
  condition: (v) => { if (!v) return '도서 상태를 선택하세요.'; },
};

function validate(form) {
  const errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    const msg = rule(form[field]);
    if (msg) errors[field] = msg;
  }
  return errors;
}

export function CreateSalePostPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ bookId: '', title: '', description: '', price: '', condition: '' });
  const [selectedBook, setSelectedBook] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) {
      const msg = RULES[name]?.(value);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = RULES[name]?.(value);
    setErrors((prev) => ({ ...prev, [name]: msg }));
  }

  function handleBookSelect(book) {
    setSelectedBook(book);
    const bookId = book.bookId ?? '';
    setForm((f) => ({ ...f, bookId }));
    setTouched((t) => ({ ...t, bookId: true }));
    setErrors((prev) => ({ ...prev, bookId: bookId ? undefined : RULES.bookId('') }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(RULES).map((k) => [k, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSubmitError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/sale-posts', {
        method: 'POST',
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message || body?.message || `HTTP ${res.status}`);
      navigate(`/sale-posts/${(body.data ?? body).id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
      <button onClick={() => navigate('/')}
        style={{ marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '14px', padding: 0 }}>
        ← 목록으로
      </button>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>판매글 등록</h2>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          <div>
            <label style={labelStyle}>도서 검색 <Required /></label>
            <BookSearch selected={selectedBook} onSelect={handleBookSelect} hasError={!!errors.bookId} />
            {errors.bookId && <p style={errorStyle}>{errors.bookId}</p>}
          </div>

          <Field label="제목" name="title" value={form.title} error={errors.title}
            onChange={handleChange} onBlur={handleBlur} placeholder="판매글 제목 (최대 100자)" required maxLength={100} />

          <div>
            <label style={labelStyle}>설명 <Required /></label>
            <textarea name="description" value={form.description} onChange={handleChange}
              onBlur={handleBlur} placeholder="도서 상태, 구매 시기 등 상세 설명을 입력하세요"
              rows={5} style={{ ...inputStyle(!!errors.description), resize: 'vertical' }} />
            {errors.description && <p style={errorStyle}>{errors.description}</p>}
          </div>

          <Field label="가격 (원)" name="price" type="number" value={form.price} error={errors.price}
            onChange={handleChange} onBlur={handleBlur} placeholder="1 ~ 10,000,000" required min={1} max={10000000} />

          <div>
            <label style={labelStyle}>도서 상태 <Required /></label>
            <select name="condition" value={form.condition} onChange={handleChange} onBlur={handleBlur}
              style={{ ...inputStyle(!!errors.condition), background: '#fff' }}>
              <option value="">선택하세요</option>
              {CONDITION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.condition && <p style={errorStyle}>{errors.condition}</p>}
          </div>

          {submitError && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{submitError}</p>}

          <button type="submit" className="button" disabled={loading}
            style={{ margin: '4px 0 0 0', width: '100%', padding: '12px', boxSizing: 'border-box' }}>
            {loading ? '등록 중...' : '판매글 등록'}
          </button>
        </form>
      </div>
    </div>
  );
}

function BookSearch({ selected, onSelect, hasError }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiFetch(`/api/v1/books/search?query=${encodeURIComponent(query)}&queryType=Title&page=0&size=8`);
        const body = await res.json();
        const pageData = body.data ?? body;
        setResults(pageData.content ?? []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(book) {
    onSelect(book);
    setQuery(''); setOpen(false); setResults([]);
  }

  if (selected?.bookId) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
        border: '1px solid #3182f6', borderRadius: '6px', background: '#eff6ff',
      }}>
        {selected.thumbnailUrl && (
          <img src={selected.thumbnailUrl} alt="" style={{ width: '36px', height: '48px', objectFit: 'cover', borderRadius: '2px' }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.title}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{selected.author}</div>
        </div>
        <button type="button" onClick={() => onSelect({ bookId: '' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px', lineHeight: 1 }}>
          ×
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="도서 제목으로 검색하세요"
        style={inputStyle(hasError)} />
      {searching && (
        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }}>
          검색 중...
        </span>
      )}
      {open && results.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', margin: 0, padding: 0,
          listStyle: 'none', zIndex: 50, maxHeight: '300px', overflowY: 'auto',
        }}>
          {results.map((book) => (
            <li key={book.bookId} onMouseDown={() => handleSelect(book)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
              {book.thumbnailUrl && (
                <img src={book.thumbnailUrl} alt="" style={{ width: '32px', height: '42px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {book.author}{book.publisher ? ` · ${book.publisher}` : ''}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && !searching && results.length === 0 && query.trim() && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
          padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', zIndex: 50,
        }}>
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}

function Required() {
  return <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>;
}

function Field({ label, name, type = 'text', value, error, onChange, onBlur, placeholder, required, maxLength, min, max }) {
  return (
    <div>
      <label style={labelStyle}>{label} {required && <Required />}</label>
      <input name={name} type={type} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} maxLength={maxLength} min={min} max={max}
        style={inputStyle(!!error)} />
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' };
const errorStyle = { color: '#ef4444', fontSize: '12px', marginTop: '4px', marginBottom: 0 };
const inputStyle = (hasError) => ({
  width: '100%', padding: '10px 12px', fontSize: '14px',
  border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
  borderRadius: '6px', boxSizing: 'border-box', outline: 'none',
});

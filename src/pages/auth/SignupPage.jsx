import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GENDER_OPTIONS = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loginId: '',
    email: '',
    password: '',
    name: '',
    nickname: '',
    phone: '',
    gender: '',
    birthDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '40px 36px',
          width: '400px',
        }}
      >
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px', color: '#1b64da' }}>
          Pagely
        </h1>
        <p style={{ color: '#8b95a1', fontSize: '14px', marginBottom: '28px' }}>회원가입</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="아이디" name="loginId" value={form.loginId} onChange={handleChange}
            placeholder="4~50자, 영문/숫자/언더스코어" required />
          <Field label="이메일" name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="example@email.com" required />
          <Field label="비밀번호" name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="비밀번호를 입력하세요" required autoComplete="new-password" />
          <Field label="이름" name="name" value={form.name} onChange={handleChange}
            placeholder="실명을 입력하세요" required />
          <Field label="닉네임" name="nickname" value={form.nickname} onChange={handleChange}
            placeholder="2~30자" required />
          <Field label="전화번호" name="phone" value={form.phone} onChange={handleChange}
            placeholder="010-0000-0000" required />

          <div>
            <label style={labelStyle}>성별</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              style={{ ...inputStyle, background: '#fff' }}
            >
              <option value="">선택하세요</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <Field label="생년월일" name="birthDate" type="date" value={form.birthDate} onChange={handleChange}
            required />

          {error && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            className="button"
            disabled={loading}
            style={{ marginTop: '4px', width: '100%', padding: '12px', margin: '4px 0 0 0', boxSizing: 'border-box' }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#8b95a1' }}>
          이미 계정이 있으신가요?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: '#1b64da', cursor: 'pointer', fontWeight: '600' }}
          >
            로그인
          </span>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder, required, autoComplete }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  marginBottom: '6px',
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  boxSizing: 'border-box',
  outline: 'none',
};

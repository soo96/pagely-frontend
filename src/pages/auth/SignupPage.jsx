import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GENDER_OPTIONS = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

const RULES = {
  loginId: (v) => {
    if (!v) return '아이디를 입력하세요.';
    if (!/^[a-zA-Z0-9_]{4,50}$/.test(v)) return '4~50자, 영문·숫자·언더스코어(_)만 사용 가능합니다.';
  },
  email: (v) => {
    if (!v) return '이메일을 입력하세요.';
    if (v.length > 100) return '이메일은 100자 이하여야 합니다.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '올바른 이메일 형식이 아닙니다.';
  },
  password: (v) => {
    if (!v) return '비밀번호를 입력하세요.';
    if (v.length < 10 || v.length > 64) return '비밀번호는 10~64자여야 합니다.';
    if (/\s/.test(v)) return '비밀번호에 공백을 포함할 수 없습니다.';
  },
  name: (v) => {
    if (!v) return '이름을 입력하세요.';
    if (v.length > 100) return '이름은 100자 이하여야 합니다.';
  },
  nickname: (v) => {
    if (!v) return '닉네임을 입력하세요.';
    if (v.length < 2 || v.length > 30) return '닉네임은 2~30자여야 합니다.';
  },
  phone: (v) => {
    if (!v) return '전화번호를 입력하세요.';
    if (!/^010-\d{4}-\d{4}$/.test(v)) return '010-0000-0000 형식으로 입력하세요.';
  },
  gender: (v) => {
    if (!v) return '성별을 선택하세요.';
  },
  birthDate: (v) => {
    if (!v) return '생년월일을 입력하세요.';
  },
};

function validate(form) {
  const errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    const msg = rule(form[field]);
    if (msg) errors[field] = msg;
  }
  return errors;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loginId: '', email: '', password: '', name: '',
    nickname: '', phone: '', gender: '', birthDate: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function handleChange(e) {
    let { name, value } = e.target;
    if (name === 'phone') value = formatPhone(value);
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
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
      navigate('/login');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '40px 16px' }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '40px 36px', width: '400px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px', color: '#1b64da' }}>Pagely</h1>
        <p style={{ color: '#8b95a1', fontSize: '14px', marginBottom: '28px' }}>회원가입</p>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="아이디" name="loginId" value={form.loginId} error={errors.loginId}
            onChange={handleChange} onBlur={handleBlur} placeholder="4~50자, 영문/숫자/언더스코어" required />
          <Field label="이메일" name="email" type="email" value={form.email} error={errors.email}
            onChange={handleChange} onBlur={handleBlur} placeholder="example@email.com" required />
          <Field label="비밀번호" name="password" type="password" value={form.password} error={errors.password}
            onChange={handleChange} onBlur={handleBlur} placeholder="10~64자, 공백 불가" required autoComplete="new-password" />
          <Field label="이름" name="name" value={form.name} error={errors.name}
            onChange={handleChange} onBlur={handleBlur} placeholder="실명을 입력하세요" required />
          <Field label="닉네임" name="nickname" value={form.nickname} error={errors.nickname}
            onChange={handleChange} onBlur={handleBlur} placeholder="2~30자" required />
          <Field label="핸드폰" name="phone" value={form.phone} error={errors.phone}
            onChange={handleChange} onBlur={handleBlur} placeholder="010-0000-0000" required />

          <div>
            <label style={labelStyle}>성별 <Required /></label>
            <select name="gender" value={form.gender} onChange={handleChange} onBlur={handleBlur}
              style={{ ...inputStyle(!!errors.gender), background: '#fff' }}>
              <option value="">선택하세요</option>
              {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.gender && <p style={errorStyle}>{errors.gender}</p>}
          </div>

          <Field label="생년월일" name="birthDate" type="date" value={form.birthDate} error={errors.birthDate}
            onChange={handleChange} onBlur={handleBlur} required />

          {submitError && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{submitError}</p>}

          <button type="submit" className="button" disabled={loading}
            style={{ margin: '4px 0 0 0', width: '100%', padding: '12px', boxSizing: 'border-box' }}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#8b95a1' }}>
          이미 계정이 있으신가요?{' '}
          <span onClick={() => navigate('/login')} style={{ color: '#1b64da', cursor: 'pointer', fontWeight: '600' }}>
            로그인
          </span>
        </p>
      </div>
    </div>
  );
}

function Required() {
  return <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>;
}

function Field({ label, name, type = 'text', value, error, onChange, onBlur, placeholder, required, autoComplete }) {
  return (
    <div>
      <label style={labelStyle}>{label} {required && <Required />}</label>
      <input name={name} type={type} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} autoComplete={autoComplete}
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

import { useState } from 'react';
import { Mail, Lock, User, KeyRound, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { UserProfile } from '../types';

interface AuthFormProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const user = await api.signIn(email, password);
        onAuthSuccess(user);
      } else {
        if (!name.trim()) {
          throw new Error("이름을 입력해 주세요.");
        }
        const user = await api.signUp(email, password, name, roleCode);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2 className="auth-title">
            {isLogin ? '반갑습니다' : '계정 만들기'}
          </h2>
          <p className="auth-subtitle">
            {isLogin 
              ? '할 일 관리 서비스에 로그인하세요' 
              : '새로운 할 일 관리 계정을 등록합니다'}
          </p>
        </div>

        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            로그인
          </button>
          <button 
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            회원가입
          </button>
        </div>

        {error && (
          <div className="warning-banner" style={{ color: 'hsl(var(--color-danger))', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div className="warning-banner-title" style={{ color: 'hsl(var(--color-danger))' }}>오류 발생</div>
              <div className="warning-banner-desc" style={{ color: 'hsl(var(--text-secondary))' }}>{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">
                <User size={14} /> 이름
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={18} /></span>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="이름 입력"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <Mail size={14} /> 이메일 주소
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Mail size={18} /></span>
              <input 
                type="email" 
                className="form-input" 
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={14} /> 비밀번호
            </label>
            <div className="input-wrapper">
              <span className="input-icon"><Lock size={18} /></span>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">
                <KeyRound size={14} /> 교사 인증 코드 (선택사항)
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><KeyRound size={18} /></span>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="교사 가입 시에만 입력"
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.2rem' }}>
                * 비워두시면 학생 계정으로 가입됩니다. (기본 코드: TEACHER123)
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            style={{ marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? (
              '처리 중...'
            ) : isLogin ? (
              <>
                <LogIn size={18} /> 로그인
              </>
            ) : (
              <>
                <UserPlus size={18} /> 회원가입 완료
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

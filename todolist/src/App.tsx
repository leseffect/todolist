import { useState, useEffect } from 'react';
import { LogOut, ClipboardList, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
import { api } from './services/api';
import type { UserProfile } from './types';
import { AuthForm } from './components/AuthForm';
import { TodoList } from './components/TodoList';
import { Dashboard } from './components/Dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Subscribe to Authentication status
  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = api.subscribeAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await api.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div className="app-container">
      {/* Firebase Config Missing Warning Banner */}
      {!api.isFirebase && (
        <div className="warning-banner">
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div className="warning-banner-title">
              로컬 가상 데이터베이스(Mock Mode)로 실행 중입니다
            </div>
            <div className="warning-banner-desc">
              현재 Firebase 설정 정보가 없거나 비어 있어 브라우저 로컬 저장소를 활용해 구동 중입니다. 
              로그인(교사: <code style={{background:'rgba(255,255,255,0.1)', padding:'1px 4px', borderRadius:'3px'}}>teacher@test.com</code> / 비밀번호 6자리 이상) 및 
              학생 회원가입/CRUD를 바로 테스트하실 수 있습니다.
              <br />
              <strong style={{color: 'white', marginTop: '0.25rem', display: 'inline-block'}}>
                Firebase 연결 방법:
              </strong> 
              프로젝트 루트 폴더의 <code style={{background:'rgba(255,255,255,0.1)', padding:'1px 4px', borderRadius:'3px'}}>.env</code> 파일에 Firebase SDK 설정을 입력하고 앱을 다시 시작해 주세요. 
              Vercel 배포 시에는 Vercel Dashboard의 Environment Variables에 해당 값을 똑같이 등록해 주시면 정상 동작합니다.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header>
        <div className="logo-container">
          <div className="logo-icon">
            <ClipboardList size={22} />
          </div>
          <span className="logo-text">EduTodo</span>
          {currentUser && (
            <span className="logo-badge">
              {currentUser.role === 'teacher' ? '교사용' : '학생용'}
            </span>
          )}
        </div>

        {currentUser && (
          <div className="user-nav-info">
            <div className="user-profile-summary">
              <span className="profile-name">{currentUser.name} 님</span>
              <span className="profile-role">
                {currentUser.role === 'teacher' ? 'TEACHER' : 'STUDENT'}
              </span>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleLogout}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {authLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'hsl(var(--text-muted))', gap: '1rem', minHeight: '300px' }}>
            <div style={{ 
              width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', 
              borderTopColor: 'hsl(var(--accent-purple))', borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} />
            <span>인증 상태 조회 중...</span>
          </div>
        ) : !currentUser ? (
          // Logged Out Screen
          <AuthForm onAuthSuccess={(user) => setCurrentUser(user)} />
        ) : currentUser.role === 'teacher' ? (
          // Teacher View
          <Dashboard currentUser={currentUser} />
        ) : (
          // Student View
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <TodoList student={currentUser} currentUser={currentUser} />
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer style={{ marginTop: '4rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', gap: '1rem' }}>
        <div>
          &copy; {new Date().getFullYear()} EduTodo. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Database size={12} /> Database: {api.isFirebase ? 'Firebase Firestore' : 'LocalStorage Mock'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldCheck size={12} /> Auth: {api.isFirebase ? 'Firebase Auth' : 'LocalStorage Mock'}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

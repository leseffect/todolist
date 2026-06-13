import { useState, useEffect } from 'react';
import { Users, GraduationCap, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import type { UserProfile } from '../types';
import { TodoList } from './TodoList';

interface DashboardProps {
  currentUser: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to students list
  useEffect(() => {
    setLoading(true);
    const unsubscribe = api.subscribeStudents((fetchedStudents) => {
      setStudents(fetchedStudents);
      setLoading(false);
      
      // Keep selected student profile up-to-date if it exists
      if (selectedStudent) {
        const updated = fetchedStudents.find(s => s.uid === selectedStudent.uid);
        if (updated) {
          setSelectedStudent(updated);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedStudent?.uid]);

  return (
    <div className="dashboard-grid">
      {/* Student List Panel (Left) */}
      <div className="glass-card student-panel" style={{ padding: '2rem' }}>
        <h3 className="panel-title">
          <GraduationCap className="logo-icon" style={{ padding: '0.3rem', width: '28px', height: '28px' }} />
          학생 관리 ({students.length}명)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginTop: '-0.75rem' }}>
          목록에서 관리할 학생을 선택해 주세요.
        </p>

        {loading ? (
          <div style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '2rem 0' }}>
            학생 목록 로딩 중...
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <Users size={32} className="empty-icon" />
            <p style={{ fontWeight: 600, color: 'white' }}>등록된 학생이 없습니다</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>학생 계정 가입 시 이곳에 노출됩니다.</p>
          </div>
        ) : (
          <div className="student-list">
            {students.map((student) => {
              const isSelected = selectedStudent?.uid === student.uid;
              return (
                <div 
                  key={student.uid} 
                  className={`student-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="student-info">
                    <span className="student-name">{student.name}</span>
                    <span className="student-email">{student.email}</span>
                  </div>
                  <ArrowRight 
                    size={16} 
                    style={{ 
                      opacity: isSelected ? 1 : 0.3,
                      transform: isSelected ? 'translateX(4px)' : 'none',
                      transition: 'all 0.2s ease',
                      color: isSelected ? 'hsl(var(--accent-purple))' : 'white'
                    }} 
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Student's Todo Management (Right) */}
      <div className="todo-panel-wrapper">
        {selectedStudent ? (
          <TodoList 
            student={selectedStudent} 
            currentUser={currentUser} 
          />
        ) : (
          <div className="glass-card empty-state" style={{ height: '100%', minHeight: '350px', display: 'flex', justifyContent: 'center' }}>
            <UserCheck size={48} className="empty-icon" style={{ marginBottom: '1.5rem', color: 'hsl(var(--accent-purple))' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem', fontWeight: 700 }}>
              학생이 선택되지 않았습니다
            </h3>
            <p style={{ maxWidth: '300px', fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
              왼쪽의 학생 목록에서 할 일을 확인 및 편집할 학생을 클릭해 주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

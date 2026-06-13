import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, ClipboardList, Search, Loader } from 'lucide-react';
import { api } from '../services/api';
import type { Todo, UserProfile } from '../types';

interface TodoListProps {
  student: UserProfile; // The student whose todos are being managed
  currentUser: UserProfile; // The logged-in user (could be this student, or a teacher)
}

export const TodoList: React.FC<TodoListProps> = ({ student, currentUser }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to real-time updates for the student's todos
  useEffect(() => {
    setLoading(true);
    const unsubscribe = api.subscribeTodos(student.uid, (fetchedTodos) => {
      setTodos(fetchedTodos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [student.uid]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    try {
      await api.addTodo(newTodoText.trim(), student.uid, student.name);
      setNewTodoText('');
    } catch (error) {
      console.error("Failed to add todo:", error);
      alert("할 일을 추가하지 못했습니다.");
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      await api.updateTodo(todo.id, { completed: !todo.completed });
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm("이 할 일을 삭제하시겠습니까?")) return;
    try {
      await api.deleteTodo(todoId);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const filteredTodos = todos
    .filter(todo => {
      // Filter status
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter(todo => {
      // Filter search
      return todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const isTeacher = currentUser.role === 'teacher';
  const isSelf = currentUser.uid === student.uid;

  return (
    <div className="todo-container glass-card" style={{ padding: '2rem' }}>
      <div className="todo-header-inline">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={20} className="logo-icon" style={{ padding: '0.3rem', width: '28px', height: '28px' }} />
            {isSelf ? '내 할 일 목록' : `${student.name} 학생의 할 일`}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginTop: '0.2rem' }}>
            {isTeacher 
              ? '교사 권한으로 할 일을 모니터링하고 관리합니다.' 
              : '오늘 해야 할 일들을 등록하고 완료해 보세요.'}
          </p>
        </div>
        {!isSelf && <span className="todo-student-badge">학생 관리 모드</span>}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddTodo} className="todo-creator-input">
        <input 
          type="text" 
          className="form-input" 
          placeholder={isTeacher ? "학생에게 배정할 할 일을 입력하세요..." : "새로운 할 일을 입력하세요..."}
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          style={{ paddingLeft: '1rem' }} // overwrite left icon padding
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }}>
          <Plus size={20} />
          <span style={{ display: 'inline' }}>추가</span>
        </button>
      </form>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0' }}>
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.15)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <button 
            type="button" 
            onClick={() => setFilter('all')}
            style={{ 
              background: filter === 'all' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: filter === 'all' ? 'white' : 'hsl(var(--text-muted))',
              border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            전체
          </button>
          <button 
            type="button" 
            onClick={() => setFilter('active')}
            style={{ 
              background: filter === 'active' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: filter === 'active' ? 'white' : 'hsl(var(--text-muted))',
              border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            진행 중
          </button>
          <button 
            type="button" 
            onClick={() => setFilter('completed')}
            style={{ 
              background: filter === 'completed' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: filter === 'completed' ? 'white' : 'hsl(var(--text-muted))',
              border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            완료
          </button>
        </div>

        <div className="input-wrapper" style={{ minWidth: '200px' }}>
          <span className="input-icon" style={{ left: '0.75rem' }}><Search size={16} /></span>
          <input 
            type="text" 
            className="form-input" 
            placeholder="할 일 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', fontSize: '0.85rem', borderRadius: '8px' }}
          />
        </div>
      </div>

      {/* Todo List Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', color: 'hsl(var(--text-muted))', gap: '0.5rem' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>할 일 목록을 불러오는 중...</span>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={36} className="empty-icon" />
          <p style={{ fontWeight: 600, color: 'white' }}>등록된 할 일이 없습니다</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {searchQuery ? '검색어와 일치하는 항목이 없습니다.' : '새로운 작업을 등록하고 시작해 보세요!'}
          </p>
        </div>
      ) : (
        <div className="todo-list-items">
          {filteredTodos.map((todo) => (
            <div key={todo.id} className="todo-item-card">
              <div className="todo-item-content">
                <label className="todo-checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    className="todo-checkbox-hidden"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                  />
                  <span className="todo-checkbox-custom">
                    <Check size={14} strokeWidth={3} />
                  </span>
                </label>
                <span className="todo-text">{todo.text}</span>
              </div>
              <div className="todo-actions">
                <button 
                  type="button" 
                  className="action-btn delete"
                  onClick={() => handleDeleteTodo(todo.id)}
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spinner animation keyframe definition helper style */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

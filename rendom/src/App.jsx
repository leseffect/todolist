import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudentList from './components/StudentList';
import SlotMachine from './components/SlotMachine';
import SecretModal from './components/SecretModal';
import { ToggleLeft, ToggleRight, Sparkles, HelpCircle } from 'lucide-react';
import { playClick } from './utils/soundEffects';

const DEFAULT_CLASS = '1학년 1반 (샘플)';
const DEFAULT_STUDENTS = [
  { id: '1', name: '김철수', presented: false, excluded: false },
  { id: '2', name: '이영희', presented: false, excluded: false },
  { id: '3', name: '박민수', presented: false, excluded: false },
  { id: '4', name: '최수민', presented: false, excluded: false },
  { id: '5', name: '정훈', presented: false, excluded: false },
  { id: '6', name: '한지원', presented: false, excluded: false },
  { id: '7', name: '윤아름', presented: false, excluded: false },
  { id: '8', name: '강동우', presented: false, excluded: false }
];

export default function App() {
  // --- States ---
  const [classData, setClassData] = useState(() => {
    const saved = localStorage.getItem('neon_spin_class_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse class data', e);
      }
    }
    return { [DEFAULT_CLASS]: DEFAULT_STUDENTS };
  });

  const [currentClass, setCurrentClass] = useState(() => {
    const saved = localStorage.getItem('neon_spin_current_class');
    if (saved && saved in classData) {
      return saved;
    }
    return Object.keys(classData)[0] || DEFAULT_CLASS;
  });

  const [excludePresented, setExcludePresented] = useState(() => {
    const saved = localStorage.getItem('neon_spin_exclude_presented');
    return saved ? JSON.parse(saved) : true;
  });

  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('neon_spin_is_muted');
    return saved ? JSON.parse(saved) : false;
  });

  const [secretQueue, setSecretQueue] = useState([]);
  const [isSecretOpen, setIsSecretOpen] = useState(false);

  // --- Effects for LocalStorage Sync ---
  useEffect(() => {
    localStorage.setItem('neon_spin_class_data', JSON.stringify(classData));
  }, [classData]);

  useEffect(() => {
    localStorage.setItem('neon_spin_current_class', currentClass);
  }, [currentClass]);

  useEffect(() => {
    localStorage.setItem('neon_spin_exclude_presented', JSON.stringify(excludePresented));
  }, [excludePresented]);

  useEffect(() => {
    localStorage.setItem('neon_spin_is_muted', JSON.stringify(isMuted));
  }, [isMuted]);

  // --- Keyboard shortcut listener (Ctrl+Shift+K) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSecretOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Computed State ---
  const currentStudents = classData[currentClass] || [];
  const classes = Object.keys(classData);

  // --- Handlers ---
  const handleSelectClass = (className) => {
    setCurrentClass(className);
    setSecretQueue([]); // Clear secret queue when class switches
  };

  const handleAddClass = (className) => {
    if (classData[className]) {
      alert('이미 존재하는 학급 이름입니다.');
      return;
    }
    setClassData((prev) => ({
      ...prev,
      [className]: []
    }));
    setCurrentClass(className);
    setSecretQueue([]);
  };

  const handleDeleteClass = (className) => {
    const remainingClasses = classes.filter((c) => c !== className);
    if (remainingClasses.length === 0) return;

    const nextClassData = { ...classData };
    delete nextClassData[className];
    
    setClassData(nextClassData);
    setCurrentClass(remainingClasses[0]);
    setSecretQueue([]);
  };

  const handleAddStudents = (names) => {
    setClassData((prev) => {
      const currentList = prev[currentClass] || [];
      const newStudents = names.map((name, idx) => ({
        id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        presented: false,
        excluded: false
      }));
      return {
        ...prev,
        [currentClass]: [...currentList, ...newStudents]
      };
    });
  };

  const handleRemoveStudent = (id) => {
    setClassData((prev) => {
      const currentList = prev[currentClass] || [];
      const studentToRemove = currentList.find(s => s.id === id);
      const filtered = currentList.filter((s) => s.id !== id);
      
      // If removed student was in the secret queue, clear them
      if (studentToRemove) {
        setSecretQueue(q => q.filter(name => name !== studentToRemove.name));
      }
      
      return {
        ...prev,
        [currentClass]: filtered
      };
    });
  };

  const handleToggleExclude = (id) => {
    setClassData((prev) => {
      const currentList = prev[currentClass] || [];
      const updated = currentList.map((s) =>
        s.id === id ? { ...s, excluded: !s.excluded } : s
      );
      
      // If student is excluded, remove from secret queue
      const student = currentList.find(s => s.id === id);
      if (student && !student.excluded) { // was false, now true
        setSecretQueue(q => q.filter(name => name !== student.name));
      }

      return {
        ...prev,
        [currentClass]: updated
      };
    });
  };

  const handleMarkAsPresented = (ids) => {
    setClassData((prev) => {
      const currentList = prev[currentClass] || [];
      const updated = currentList.map((s) =>
        ids.includes(s.id) ? { ...s, presented: true } : s
      );
      return {
        ...prev,
        [currentClass]: updated
      };
    });
  };

  const handleResetPresented = () => {
    setClassData((prev) => {
      const currentList = prev[currentClass] || [];
      const updated = currentList.map((s) => ({ ...s, presented: false }));
      return {
        ...prev,
        [currentClass]: updated
      };
    });
  };

  const handleConsumeSecretQueue = (drawnNames) => {
    // Drawn names is an array of names that were just presented
    setSecretQueue((prev) => prev.filter((name) => !drawnNames.includes(name)));
  };

  return (
    <div className="app-container">
      {/* Background Grid & Scanline Effect for Cyberpunk vibe */}
      <div className="cyber-grid"></div>
      <div className="scanlines"></div>

      <Header
        classes={classes}
        currentClass={currentClass}
        onSelectClass={handleSelectClass}
        onAddClass={handleAddClass}
        onDeleteClass={handleDeleteClass}
        onOpenSecret={() => setIsSecretOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => {
          setIsMuted(!isMuted);
          playClick();
        }}
        secretActive={secretQueue.length > 0}
      />

      <main className="app-main">
        {/* Left column: Slot Machine */}
        <section className="main-left">
          <div className="control-options-bar">
            <button
              onClick={() => {
                setExcludePresented(!excludePresented);
                playClick();
              }}
              className={`toggle-option-btn ${excludePresented ? 'active' : ''}`}
            >
              {excludePresented ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              <span>이미 발표한 학생 제외</span>
            </button>
          </div>

          <SlotMachine
            students={currentStudents}
            secretQueue={secretQueue}
            onConsumeSecretQueue={handleConsumeSecretQueue}
            onMarkAsPresented={handleMarkAsPresented}
            excludePresented={excludePresented}
            isMuted={isMuted}
          />
        </section>

        {/* Right column: Student List Manager */}
        <section className="main-right">
          <StudentList
            students={currentStudents}
            onAddStudents={handleAddStudents}
            onRemoveStudent={handleRemoveStudent}
            onToggleExclude={handleToggleExclude}
            onResetPresented={handleResetPresented}
            isMuted={isMuted}
          />
        </section>
      </main>

      <SecretModal
        isOpen={isSecretOpen}
        onClose={() => setIsSecretOpen(false)}
        students={currentStudents}
        secretQueue={secretQueue}
        onUpdateSecretQueue={setSecretQueue}
        isMuted={isMuted}
      />

      <footer className="app-footer">
        <p>© 2026 NEONSPIN PRESENTATION SYS. OPERATOR EDITION.</p>
      </footer>
    </div>
  );
}

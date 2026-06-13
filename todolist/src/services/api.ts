import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured, TEACHER_INVITATION_CODE } from "../firebase";
import type { UserProfile, Todo, UserRole } from "../types";

// ==========================================
// MOCK DATA STORAGE (Fallback when Firebase is offline)
// ==========================================

const MOCK_USERS_KEY = "todo_mock_users";
const MOCK_TODOS_KEY = "todo_mock_todos";
const MOCK_SESSION_KEY = "todo_mock_session";

const getMockUsers = (): UserProfile[] => {
  const data = localStorage.getItem(MOCK_USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMockUsers = (users: UserProfile[]) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const getMockTodos = (): Todo[] => {
  const data = localStorage.getItem(MOCK_TODOS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMockTodos = (todos: Todo[]) => {
  localStorage.setItem(MOCK_TODOS_KEY, JSON.stringify(todos));
};

// Seed mock data if empty
if (getMockUsers().length === 0) {
  const initialUsers: UserProfile[] = [
    { uid: "mock_teacher_id", email: "teacher@test.com", name: "김교사", role: "teacher" },
    { uid: "mock_student_1", email: "student1@test.com", name: "홍길동", role: "student" },
    { uid: "mock_student_2", email: "student2@test.com", name: "이영희", role: "student" },
  ];
  saveMockUsers(initialUsers);

  const initialTodos: Todo[] = [
    { id: "todo_1", text: "수학 익힘책 42페이지 풀기", completed: false, userId: "mock_student_1", studentName: "홍길동", createdAt: Date.now() - 36000000 },
    { id: "todo_2", text: "과학 보고서 제출하기", completed: true, userId: "mock_student_1", studentName: "홍길동", createdAt: Date.now() - 18000000 },
    { id: "todo_3", text: "영어 단어 50개 암기", completed: false, userId: "mock_student_2", studentName: "이영희", createdAt: Date.now() - 72000000 },
  ];
  saveMockTodos(initialTodos);
}

// ==========================================
// SERVICE LAYER API
// ==========================================

export const api = {
  // Check if using actual Firebase or LocalStorage fallback
  isFirebase: isFirebaseConfigured,

  // SignUp API
  signUp: async (email: string, password: string, name: string, roleCode: string): Promise<UserProfile> => {
    // Determine user role based on invitation code
    const role: UserRole = roleCode.trim() === TEACHER_INVITATION_CODE ? 'teacher' : 'student';

    if (isFirebaseConfigured && auth && db) {
      // 1. Firebase Auth Registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Save User Profile in Firestore
      const userProfile: UserProfile = { uid, email, name, role };
      await setDoc(doc(db, "users", uid), userProfile);
      return userProfile;
    } else {
      // LocalStorage Mock Registration
      const users = getMockUsers();
      if (users.some(u => u.email === email)) {
        throw new Error("이미 사용 중인 이메일 주소입니다.");
      }

      const uid = "mock_uid_" + Math.random().toString(36).substr(2, 9);
      const userProfile: UserProfile = { uid, email, name, role };
      users.push(userProfile);
      saveMockUsers(users);

      // Save session
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(userProfile));
      return userProfile;
    }
  },

  // SignIn API
  signIn: async (email: string, password: string): Promise<UserProfile> => {
    if (isFirebaseConfigured && auth && db) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Fetch user role and details from Firestore
      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) {
        throw new Error("사용자 정보를 데이터베이스에서 찾을 수 없습니다.");
      }
      return userDoc.data() as UserProfile;
    } else {
      const users = getMockUsers();
      // Simple mock sign in (accepts password as long as it's not empty, for testing ease, or matches a simple rule)
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error("가입되지 않은 이메일입니다.");
      }
      if (password.length < 6) {
        throw new Error("비밀번호는 6자리 이상이어야 합니다. (테스트용)");
      }

      // Save session
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
      return user;
    }
  },

  // SignOut API
  signOut: async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem(MOCK_SESSION_KEY);
    }
  },

  // Auth State Listener
  subscribeAuth: (onUserChanged: (user: UserProfile | null) => void) => {
    if (isFirebaseConfigured && auth && db) {
      return fbOnAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
              onUserChanged(userDoc.data() as UserProfile);
            } else {
              onUserChanged(null);
            }
          } catch (e) {
            console.error("Error fetching user profile:", e);
            onUserChanged(null);
          }
        } else {
          onUserChanged(null);
        }
      });
    } else {
      // LocalStorage Session check
      const checkSession = () => {
        const session = localStorage.getItem(MOCK_SESSION_KEY);
        if (session) {
          onUserChanged(JSON.parse(session));
        } else {
          onUserChanged(null);
        }
      };
      
      checkSession();
      // Listen to storage events to support multi-tab testing
      const listener = (e: StorageEvent) => {
        if (e.key === MOCK_SESSION_KEY) {
          checkSession();
        }
      };
      window.addEventListener('storage', listener);
      
      // Return unsubscribe function
      return () => {
        window.removeEventListener('storage', listener);
      };
    }
  },

  // Get Todos for a Student
  subscribeTodos: (userId: string, onTodosChanged: (todos: Todo[]) => void) => {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, "todos"), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      return onSnapshot(q, (snapshot) => {
        const todos: Todo[] = [];
        snapshot.forEach((doc) => {
          todos.push({ id: doc.id, ...doc.data() } as Todo);
        });
        onTodosChanged(todos);
      }, (error) => {
        console.error("Error subscribing to todos:", error);
      });
    } else {
      const fetchMockTodos = () => {
        const allTodos = getMockTodos();
        const filtered = allTodos
          .filter(t => t.userId === userId)
          .sort((a, b) => b.createdAt - a.createdAt);
        onTodosChanged(filtered);
      };
      fetchMockTodos();

      // Simple interval polling to mock reactivity locally
      const interval = setInterval(fetchMockTodos, 1000);
      return () => clearInterval(interval);
    }
  },

  // Get All Students (For Teacher Dashboard)
  subscribeStudents: (onStudentsChanged: (students: UserProfile[]) => void) => {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      return onSnapshot(q, (snapshot) => {
        const students: UserProfile[] = [];
        snapshot.forEach((doc) => {
          students.push(doc.data() as UserProfile);
        });
        onStudentsChanged(students);
      });
    } else {
      const fetchStudents = () => {
        const users = getMockUsers();
        onStudentsChanged(users.filter(u => u.role === "student"));
      };
      fetchStudents();
      const interval = setInterval(fetchStudents, 1000);
      return () => clearInterval(interval);
    }
  },

  // Add Todo Item
  addTodo: async (text: string, userId: string, studentName?: string): Promise<void> => {
    const todoData = {
      text,
      completed: false,
      userId,
      studentName: studentName || "학생",
      createdAt: Date.now()
    };

    if (isFirebaseConfigured && db) {
      await addDoc(collection(db, "todos"), todoData);
    } else {
      const todos = getMockTodos();
      const newTodo: Todo = {
        id: "todo_" + Math.random().toString(36).substr(2, 9),
        ...todoData
      };
      todos.push(newTodo);
      saveMockTodos(todos);
    }
  },

  // Update Todo Item status or text
  updateTodo: async (todoId: string, updates: Partial<Todo>): Promise<void> => {
    if (isFirebaseConfigured && db) {
      const todoRef = doc(db, "todos", todoId);
      await updateDoc(todoRef, updates);
    } else {
      const todos = getMockTodos();
      const index = todos.findIndex(t => t.id === todoId);
      if (index !== -1) {
        todos[index] = { ...todos[index], ...updates };
        saveMockTodos(todos);
      }
    }
  },

  // Delete Todo Item
  deleteTodo: async (todoId: string): Promise<void> => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "todos", todoId));
    } else {
      const todos = getMockTodos();
      const filtered = todos.filter(t => t.id !== todoId);
      saveMockTodos(filtered);
    }
  }
};

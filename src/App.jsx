import React, { useState, useEffect } from 'react';
import { INITIAL_DATA } from './data/seedData';
import Navbar, { Toast } from './components/Navbar';
import InstructorPortal from './components/InstructorPortal';
import StudentPortal from './components/StudentPortal';

export default function App() {
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem('grade_system_db_v1');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('grade_system_db_v1', JSON.stringify(db));
  }, [db]);

  const [currentUserId, setCurrentUserId] = useState('U003');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetDemoData = () => {
    localStorage.removeItem('grade_system_db_v1');
    setDb(INITIAL_DATA);
    showToast('รีเซ็ตข้อมูลจำลองกลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว', 'info');
  };

  const currentUser = db.users.find((u) => u.user_id === currentUserId);
  const currentInstructor = db.instructors.find((i) => i.user_id === currentUserId);
  const currentStudent = db.students.find((s) => s.user_id === currentUserId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Toast toast={toast} />

      <Navbar
        db={db}
        currentUserId={currentUserId}
        setCurrentUserId={setCurrentUserId}
        resetDemoData={resetDemoData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser?.role === 'Instructor' && currentInstructor && (
          <InstructorPortal
            db={db}
            setDb={setDb}
            instructor={currentInstructor}
            showToast={showToast}
          />
        )}

        {currentUser?.role === 'Student' && currentStudent && (
          <StudentPortal
            db={db}
            setDb={setDb}
            student={currentStudent}
            showToast={showToast}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 ระบบตัดเกรด (Grade Management & Learning Evaluation System)</p>
          <p>โครงสร้างฐานข้อมูลอ้างอิงตาม ER Diagram & Activity Diagram</p>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import { GraduationCap, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
        toast.type === 'error'
          ? 'bg-rose-600 text-white border-rose-700'
          : toast.type === 'info'
          ? 'bg-slate-800 text-white border-slate-700'
          : 'bg-emerald-600 text-white border-emerald-700'
      }`}
    >
      {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}

export default function Navbar({ db, currentUserId, setCurrentUserId, resetDemoData }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">ระบบตัดเกรด</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Grade Management & Learning Evaluation System</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 px-2 hidden md:inline">สลับบัญชีทดสอบ:</span>
            <select
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="bg-white text-slate-800 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <optgroup label="นักศึกษา (Student)">
                {db.students.map((st) => (
                  <option key={st.user_id} value={st.user_id}>
                    👨‍🎓 {st.full_name} ({st.student_id})
                  </option>
                ))}
              </optgroup>
              <optgroup label="อาจารย์ผู้สอน (Instructor)">
                {db.instructors.map((ins) => (
                  <option key={ins.user_id} value={ins.user_id}>
                    👨‍🏫 {ins.full_name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={resetDemoData}
            title="รีเซ็ตข้อมูลทดสอบทั้งหมด"
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Users, Award, CheckCircle2, FileWarning, Plus, Trash2,
  Star, BarChart3, UserCheck, Send, Calculator
} from 'lucide-react';
import { calculateLetterGrade, getGradeBadgeStyle } from '../utils/gradeHelpers';

export default function InstructorPortal({ db, setDb, instructor, showToast }) {
  const mySections = db.sections.filter((s) => s.instructor_id === instructor.instructor_id);
  const [selectedSectionId, setSelectedSectionId] = useState(mySections[0]?.section_id || '');
  const [activeTab, setActiveTab] = useState('grading');

  useEffect(() => {
    if (!mySections.some((s) => s.section_id === selectedSectionId)) {
      setSelectedSectionId(mySections[0]?.section_id || '');
    }
  }, [instructor, mySections, selectedSectionId]);

  const activeSection = mySections.find((s) => s.section_id === selectedSectionId);
  const activeCourse = db.courses.find((c) => c.course_code === activeSection?.course_code);
  const sectionCriteria = db.assessment_criteria.filter((c) => c.section_id === selectedSectionId);
  const sectionEnrollments = db.enrollments.filter((e) => e.section_id === selectedSectionId);
  const totalWeight = sectionCriteria.reduce((acc, c) => acc + Number(c.weight_percent), 0);

  const [newCritTitle, setNewCritTitle] = useState('');
  const [newCritMax, setNewCritMax] = useState(20);
  const [newCritWeight, setNewCritWeight] = useState(20);
  const [appealNotes, setAppealNotes] = useState({});

  const pendingAppealsCount = db.grade_appeals.filter((ap) => {
    const enr = db.enrollments.find((e) => e.enrollment_id === ap.enrollment_id);
    return enr && mySections.some((s) => s.section_id === enr.section_id) && ap.status === 'Pending';
  }).length;

  const sectionEvaluations = db.course_evaluations.filter((ev) =>
    sectionEnrollments.some((e) => e.enrollment_id === ev.enrollment_id)
  );

  const handleAddCriteria = (e) => {
    e.preventDefault();
    if (!newCritTitle.trim()) return;
    if (totalWeight + Number(newCritWeight) > 100) {
      showToast('น้ำหนักคะแนนรวมห้ามเกิน 100%', 'error');
      return;
    }
    const newCrit = {
      criteria_id: 'CR' + Date.now().toString().slice(-4),
      section_id: selectedSectionId,
      title: newCritTitle.trim(),
      max_score: Number(newCritMax),
      weight_percent: Number(newCritWeight),
    };
    setDb((prev) => ({
      ...prev,
      assessment_criteria: [...prev.assessment_criteria, newCrit],
    }));
    setNewCritTitle('');
    showToast('เพิ่มเกณฑ์การประเมินเรียบร้อยแล้ว');
  };

  const handleDeleteCriteria = (criteriaId) => {
    setDb((prev) => ({
      ...prev,
      assessment_criteria: prev.assessment_criteria.filter((c) => c.criteria_id !== criteriaId),
      student_scores: prev.student_scores.filter((s) => s.criteria_id !== criteriaId),
    }));
    showToast('ลบเกณฑ์การประเมินแล้ว', 'info');
  };

  const handleScoreChange = (enrollmentId, criteriaId, maxScore, rawVal) => {
    const numVal = rawVal === '' ? 0 : Math.min(Math.max(0, Number(rawVal)), maxScore);

    setDb((prev) => {
      const existingIdx = prev.student_scores.findIndex(
        (s) => s.enrollment_id === enrollmentId && s.criteria_id === criteriaId
      );
      let updatedScores = [...prev.student_scores];
      if (existingIdx > -1) {
        updatedScores[existingIdx] = { ...updatedScores[existingIdx], score_obtained: numVal };
      } else {
        updatedScores.push({
          score_id: 'SC' + Date.now().toString().slice(-5),
          enrollment_id: enrollmentId,
          criteria_id: criteriaId,
          score_obtained: numVal,
        });
      }

      const criteriaList = prev.assessment_criteria.filter((c) => c.section_id === selectedSectionId);
      let totalWeighted = 0;
      criteriaList.forEach((crit) => {
        const scObj = updatedScores.find(
          (s) => s.enrollment_id === enrollmentId && s.criteria_id === crit.criteria_id
        );
        const obtained = scObj ? scObj.score_obtained : 0;
        if (crit.max_score > 0) {
          totalWeighted += (obtained / crit.max_score) * crit.weight_percent;
        }
      });

      const roundedTotal = Math.round(totalWeighted * 100) / 100;
      const newGrade = calculateLetterGrade(roundedTotal);

      const updatedEnrollments = prev.enrollments.map((enr) =>
        enr.enrollment_id === enrollmentId
          ? { ...enr, total_score: roundedTotal, letter_grade: newGrade }
          : enr
      );

      return {
        ...prev,
        student_scores: updatedScores,
        enrollments: updatedEnrollments,
      };
    });
  };

  const togglePublishGrade = (enrollmentId) => {
    if (totalWeight !== 100) {
      showToast('กรุณาตั้งค่าน้ำหนักเกณฑ์การประเมินให้ครบ 100% ก่อนยืนยันเกรด', 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      enrollments: prev.enrollments.map((enr) => {
        if (enr.enrollment_id === enrollmentId) {
          const nextState = !enr.is_evaluated;
          showToast(
            nextState ? 'ยืนยันและประกาศเกรดเรียบร้อยแล้ว' : 'ยกเลิกการประกาศเกรด (กลับสู่สถานะร่าง)',
            'info'
          );
          return { ...enr, is_evaluated: nextState };
        }
        return enr;
      }),
    }));
  };

  const publishAllGrades = () => {
    if (totalWeight !== 100) {
      showToast('กรุณาตั้งค่าน้ำหนักเกณฑ์การประเมินให้ครบ 100% ก่อนประกาศเกรดทั้งหมด', 'error');
      return;
    }
    setDb((prev) => ({
      ...prev,
      enrollments: prev.enrollments.map((enr) =>
        enr.section_id === selectedSectionId ? { ...enr, is_evaluated: true } : enr
      ),
    }));
    showToast('ประกาศเกรดนักศึกษาทุกคนในกลุ่มเรียนนี้เรียบร้อยแล้ว');
  };

  const handleAppealDecision = (appealId, status) => {
    const note =
      appealNotes[appealId] ||
      (status === 'Approved'
        ? 'ตรวจสอบคะแนนเรียบร้อยแล้ว ดำเนินการแก้ไขให้ถูกต้อง'
        : 'ตรวจสอบแล้ว คะแนนถูกต้องตามเกณฑ์การให้คะแนน');
    setDb((prev) => ({
      ...prev,
      grade_appeals: prev.grade_appeals.map((ap) =>
        ap.appeal_id === appealId ? { ...ap, status, instructor_note: note } : ap
      ),
    }));
    showToast(status === 'Approved' ? 'อนุมัติคำร้องอุทธรณ์เกรดแล้ว' : 'ปฏิเสธคำร้องอุทธรณ์เกรดแล้ว');
  };

  const gradeDistribution = useMemo(() => {
    const counts = { A: 0, 'B+': 0, B: 0, 'C+': 0, C: 0, 'D+': 0, D: 0, F: 0 };
    sectionEnrollments.forEach((enr) => {
      if (counts[enr.letter_grade] !== undefined) counts[enr.letter_grade]++;
    });
    return counts;
  }, [sectionEnrollments]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/20 rounded-full">Instructor Portal</span>
              <span className="text-xs text-indigo-100">รหัสผู้สอน: {instructor.instructor_id}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">{instructor.full_name}</h2>
            <p className="text-sm text-indigo-100">{instructor.department}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 min-w-[260px]">
          <label className="block text-xs text-indigo-100 mb-1">เลือกรายวิชา / กลุ่มเรียน (Section)</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full bg-white text-slate-900 text-sm font-semibold px-3 py-2 rounded-lg focus:outline-none"
          >
            {mySections.map((sec) => {
              const c = db.courses.find((course) => course.course_code === sec.course_code);
              return (
                <option key={sec.section_id} value={sec.section_id}>
                  {sec.course_code} - {c?.course_name.split('(')[0]} (เทอม {sec.semester})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {activeCourse && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>รายวิชาที่เลือก</span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {activeCourse.course_code} ({activeCourse.credits} หน่วยกิต)
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{activeCourse.course_name}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>นักศึกษาลงทะเบียน</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {sectionEnrollments.length} <span className="text-sm font-normal text-slate-500">คน</span>
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              ประกาศเกรดแล้ว {sectionEnrollments.filter((e) => e.is_evaluated).length}/{sectionEnrollments.length} คน
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>สัดส่วนเกณฑ์การให้คะแนน</span>
              <Calculator className="w-4 h-4 text-amber-600" />
            </div>
            <p className={`text-2xl font-bold mt-1 ${totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalWeight}% <span className="text-sm font-normal text-slate-500">/ 100%</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalWeight === 100 ? 'สัดส่วนครบถ้วนพร้อมตัดเกรด' : 'กรุณาปรับน้ำหนักให้ครบ 100%'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>คำร้องอุทธรณ์รอดำเนินการ</span>
              <FileWarning className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {pendingAppealsCount} <span className="text-sm font-normal text-slate-500">รายการ</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">ผลประเมินการสอน {sectionEvaluations.length} รายการ</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('grading')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'grading'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" /> บันทึกคะแนน & ตัดเกรด
        </button>

        <button
          onClick={() => setActiveTab('criteria')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'criteria'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" /> เกณฑ์การประเมิน ({sectionCriteria.length})
        </button>

        <button
          onClick={() => setActiveTab('appeals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'appeals'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileWarning className="w-4 h-4" /> คำร้องอุทธรณ์เกรด
          {pendingAppealsCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full">{pendingAppealsCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'evaluations'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Star className="w-4 h-4" /> ผลประเมินการสอน ({sectionEvaluations.length})
        </button>
      </div>

      {activeTab === 'grading' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">สรุปการกระจายตัวของเกรด (Grade Distribution)</h3>
              </div>
              <button
                onClick={publishAllGrades}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" /> ยืนยันประกาศเกรดทั้งหมดในวิชานี้
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${getGradeBadgeStyle(grade)}`}>
                    {grade}
                  </span>
                  <p className="text-xl font-bold text-slate-800 mt-1">{count}</p>
                  <p className="text-[11px] text-slate-400">คน</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                ตารางกรอกคะแนนรายบุคคล (คำนวณคะแนนรวมและตัดเกรดอัตโนมัติ)
              </h3>
              <span className="text-xs text-slate-500">* แก้ไขตัวเลขในช่องคะแนนได้ทันที</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">รหัสนักศึกษา</th>
                    <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                    {sectionCriteria.map((crit) => (
                      <th key={crit.criteria_id} className="py-3 px-3 text-center min-w-[110px]">
                        <div>{crit.title}</div>
                        <div className="text-[11px] font-normal text-indigo-600">
                          เต็ม {crit.max_score} ({crit.weight_percent}%)
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center bg-indigo-50/50">คะแนนรวม (100%)</th>
                    <th className="py-3 px-4 text-center bg-indigo-50/50">เกรด</th>
                    <th className="py-3 px-4 text-center">สถานะประกาศผล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {sectionEnrollments.map((enr) => {
                    const student = db.students.find((s) => s.student_id === enr.student_id);
                    return (
                      <tr key={enr.enrollment_id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">{student?.student_id}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{student?.full_name}</td>
                        {sectionCriteria.map((crit) => {
                          const sc = db.student_scores.find(
                            (s) => s.enrollment_id === enr.enrollment_id && s.criteria_id === crit.criteria_id
                          );
                          return (
                            <td key={crit.criteria_id} className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={crit.max_score}
                                value={sc ? sc.score_obtained : 0}
                                onChange={(e) =>
                                  handleScoreChange(enr.enrollment_id, crit.criteria_id, crit.max_score, e.target.value)
                                }
                                className="w-20 text-center font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-center font-bold text-indigo-700 bg-indigo-50/30">
                          {enr.total_score.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center bg-indigo-50/30">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${getGradeBadgeStyle(enr.letter_grade)}`}>
                            {enr.letter_grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => togglePublishGrade(enr.enrollment_id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              enr.is_evaluated
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                                : 'bg-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white'
                            }`}
                          >
                            {enr.is_evaluated ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> ประกาศแล้ว
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" /> ยืนยันเกรด
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'criteria' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">รายการเกณฑ์การประเมินผล (ASSESSMENT_CRITERIA)</h3>
                <p className="text-xs text-slate-500 mt-0.5">กำหนดสัดส่วนคะแนนของรายวิชา {activeCourse?.course_code}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  totalWeight === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                น้ำหนักรวม: {totalWeight}% / 100%
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {sectionCriteria.map((crit, idx) => (
                <div key={crit.criteria_id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{crit.title}</p>
                      <p className="text-xs text-slate-500">
                        คะแนนเต็มดิบ: {crit.max_score} คะแนน | ค่าน้ำหนัก: {crit.weight_percent}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCriteria(crit.criteria_id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="ลบเกณฑ์นี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {sectionCriteria.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">ยังไม่มีเกณฑ์การประเมินในรายวิชานี้</div>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> เพิ่มหัวข้อการประเมินใหม่
            </h3>
            <form onSubmit={handleAddCriteria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อหัวข้อการประเมิน</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สอบย่อยครั้งที่ 1 (Quiz 1)"
                  value={newCritTitle}
                  onChange={(e) => setNewCritTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">คะแนนเต็มดิบ</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={newCritMax}
                    onChange={(e) => setNewCritMax(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ค่าน้ำหนัก (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={newCritWeight}
                    onChange={(e) => setNewCritWeight(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl shadow-sm transition"
              >
                เพิ่มเกณฑ์การประเมิน
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'appeals' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">รายการคำร้องขออุทธรณ์เกรด (GRADE_APPEALS)</h3>
          <div className="space-y-4">
            {db.grade_appeals
              .filter((ap) => {
                const enr = db.enrollments.find((e) => e.enrollment_id === ap.enrollment_id);
                return enr && mySections.some((s) => s.section_id === enr.section_id);
              })
              .map((appeal) => {
                const enr = db.enrollments.find((e) => e.enrollment_id === appeal.enrollment_id);
                const student = db.students.find((s) => s.student_id === enr?.student_id);
                const sec = db.sections.find((s) => s.section_id === enr?.section_id);
                const course = db.courses.find((c) => c.course_code === sec?.course_code);

                return (
                  <div key={appeal.appeal_id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-indigo-600">
                          {course?.course_code} - {course?.course_name}
                        </span>
                        <h4 className="font-bold text-slate-900">
                          {student?.full_name} ({student?.student_id})
                        </h4>
                        <p className="text-xs text-slate-500">
                          ยื่นคำร้องเมื่อ: {appeal.created_at} | คะแนนปัจจุบัน: {enr?.total_score} ({enr?.letter_grade})
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          appeal.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : appeal.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {appeal.status === 'Pending'
                          ? 'รอพิจารณา'
                          : appeal.status === 'Approved'
                          ? 'อนุมัติคำร้อง'
                          : 'ปฏิเสธคำร้อง'}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">เหตุผลที่ยื่นอุทธรณ์: </span>
                      {appeal.reason}
                    </div>

                    {appeal.status === 'Pending' ? (
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="ระบุหมายเหตุ/คำชี้แจงถึงนักศึกษา..."
                          value={appealNotes[appeal.appeal_id] || ''}
                          onChange={(e) => setAppealNotes({ ...appealNotes, [appeal.appeal_id]: e.target.value })}
                          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleAppealDecision(appeal.appeal_id, 'Approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
                        >
                          อนุมัติ (ไปแก้คะแนน)
                        </button>
                        <button
                          onClick={() => handleAppealDecision(appeal.appeal_id, 'Rejected')}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition"
                        >
                          ปฏิเสธคำร้อง
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg">
                        <span className="font-semibold">คำชี้แจงจากอาจารย์:</span> {appeal.instructor_note}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">ผลการประเมินการเรียนการสอน (COURSE_EVALUATIONS)</h3>
              <p className="text-xs text-slate-500">แสดงความคิดเห็นแบบไม่ระบุตัวตน (Anonymous) จากนักศึกษาที่ส่งแบบประเมินแล้ว</p>
            </div>
            {sectionEvaluations.length > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-900">
                  {(sectionEvaluations.reduce((a, b) => a + b.rating_score, 0) / sectionEvaluations.length).toFixed(2)}
                </span>
                <span className="text-xs text-amber-700">/ 5.00</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionEvaluations.map((ev) => (
              <div key={ev.eval_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= ev.rating_score ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{ev.submitted_at}</span>
                </div>
                <p className="text-sm text-slate-700">"{ev.comment || 'ไม่มีข้อเสนอแนะเพิ่มเติม'}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

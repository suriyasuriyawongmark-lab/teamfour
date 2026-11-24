import React, { useState, useMemo } from 'react';
import { Lock, Unlock, Star, FileWarning, ShieldAlert } from 'lucide-react';
import { gradeToPoint, getGradeBadgeStyle } from '../utils/gradeHelpers';

export default function StudentPortal({ db, setDb, student, showToast }) {
  const myEnrollments = db.enrollments.filter((e) => e.student_id === student.student_id);

  const [evalModalEnrollmentId, setEvalModalEnrollmentId] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [evalComment, setEvalComment] = useState('');

  const [detailEnrollmentId, setDetailEnrollmentId] = useState(null);
  const [appealModalEnrollmentId, setAppealModalEnrollmentId] = useState(null);
  const [appealReason, setAppealReason] = useState('');

  const calculatedStats = useMemo(() => {
    let termPoints = 0;
    let termCredits = 0;

    myEnrollments.forEach((enr) => {
      const hasEvaluatedCourse = db.course_evaluations.some((ev) => ev.enrollment_id === enr.enrollment_id);
      if (enr.is_evaluated && hasEvaluatedCourse) {
        const sec = db.sections.find((s) => s.section_id === enr.section_id);
        const course = db.courses.find((c) => c.course_code === sec?.course_code);
        const pt = gradeToPoint(enr.letter_grade);
        if (course && pt !== null) {
          termPoints += pt * course.credits;
          termCredits += course.credits;
        }
      }
    });

    const termGpa = termCredits > 0 ? (termPoints / termCredits).toFixed(2) : '-';
    const cumulativeGpax =
      termCredits > 0 ? (((student.gpax * 60) + termPoints) / (60 + termCredits)).toFixed(2) : student.gpax.toFixed(2);

    return { termGpa, cumulativeGpax };
  }, [myEnrollments, db, student]);

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    if (!evalModalEnrollmentId) return;

    const newEval = {
      eval_id: 'EV' + Date.now().toString().slice(-4),
      enrollment_id: evalModalEnrollmentId,
      rating_score: Number(ratingScore),
      comment: evalComment.trim(),
      submitted_at: new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setDb((prev) => ({
      ...prev,
      course_evaluations: [...prev.course_evaluations, newEval],
    }));

    setEvalModalEnrollmentId(null);
    setRatingScore(5);
    setEvalComment('');
    showToast('ส่งแบบประเมินการสอนเรียบร้อยแล้ว! ปลดล็อกผลการเรียนทันที');
  };

  const handleSubmitAppeal = (e) => {
    e.preventDefault();
    if (!appealModalEnrollmentId || !appealReason.trim()) return;

    const newAppeal = {
      appeal_id: 'AP' + Date.now().toString().slice(-4),
      enrollment_id: appealModalEnrollmentId,
      reason: appealReason.trim(),
      status: 'Pending',
      instructor_note: '',
      created_at: new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setDb((prev) => ({
      ...prev,
      grade_appeals: [...prev.grade_appeals, newAppeal],
    }));

    setAppealModalEnrollmentId(null);
    setAppealReason('');
    showToast('ยื่นคำร้องขอทบทวนเกรดไปยังอาจารย์ผู้สอนเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl font-bold text-indigo-300">
            {student.full_name.charAt(3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/30">
                Student Portal
              </span>
              <span className="text-xs text-slate-300 font-mono">รหัสนักศึกษา: {student.student_id}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">{student.full_name}</h2>
            <p className="text-sm text-slate-300">สาขาวิชา: {student.major}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/15 text-center">
            <p className="text-xs text-slate-300">เกรดเฉลี่ยเทอมนี้ (GPA)</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{calculatedStats.termGpa}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/15 text-center">
            <p className="text-xs text-slate-300">เกรดเฉลี่ยสะสม (GPAX)</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{calculatedStats.cumulativeGpax}</p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-indigo-900">
          <span className="font-bold">เงื่อนไขการดูผลการเรียน (Business Rule): </span>
          รายวิชาที่อาจารย์ประกาศเกรดแล้ว นักศึกษาจำเป็นต้องทำ{' '}
          <strong>แบบประเมินการเรียนการสอน (Course Evaluation)</strong> ให้เสร็จสิ้นก่อน ระบบจึงจะปลดล็อกผลการเรียนและนำไปคำนวณ GPAX
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myEnrollments.map((enr) => {
          const sec = db.sections.find((s) => s.section_id === enr.section_id);
          const course = db.courses.find((c) => c.course_code === sec?.course_code);
          const ins = db.instructors.find((i) => i.instructor_id === sec?.instructor_id);
          const hasEvaluated = db.course_evaluations.some((ev) => ev.enrollment_id === enr.enrollment_id);
          const existingAppeal = db.grade_appeals.find((ap) => ap.enrollment_id === enr.enrollment_id);

          const isLocked = enr.is_evaluated && !hasEvaluated;
          const isUnlocked = enr.is_evaluated && hasEvaluated;

          return (
            <div key={enr.enrollment_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 transition hover:border-indigo-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-md">
                      {course?.course_code}
                    </span>
                    <span className="text-xs text-slate-500">
                      ภาคการศึกษา {sec?.semester} • {course?.credits} หน่วยกิต
                    </span>
                    {!enr.is_evaluated && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        กำลังดำเนินการเรียนการสอน / รอตัดเกรด
                      </span>
                    )}
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                        <Lock className="w-3 h-3" /> ประกาศเกรดแล้ว (รอทำแบบประเมิน)
                      </span>
                    )}
                    {isUnlocked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                        <Unlock className="w-3 h-3" /> ปลดล็อกผลการเรียนแล้ว
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{course?.course_name}</h3>
                  <p className="text-xs text-slate-500">ผู้สอน: {ins?.full_name}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {isUnlocked ? (
                    <>
                      <div className="text-right mr-2">
                        <p className="text-xs text-slate-400">คะแนนรวม</p>
                        <p className="text-base font-bold text-slate-800">{enr.total_score.toFixed(2)}%</p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-extrabold ${getGradeBadgeStyle(
                          enr.letter_grade
                        )}`}
                      >
                        {enr.letter_grade}
                      </div>
                      <button
                        onClick={() => setDetailEnrollmentId(detailEnrollmentId === enr.enrollment_id ? null : enr.enrollment_id)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                      >
                        {detailEnrollmentId === enr.enrollment_id ? 'ซ่อนคะแนนย่อย' : 'ดูคะแนนย่อย'}
                      </button>
                      {!existingAppeal ? (
                        <button
                          onClick={() => setAppealModalEnrollmentId(enr.enrollment_id)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition"
                        >
                          ยื่นอุทธรณ์เกรด
                        </button>
                      ) : (
                        <span
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                            existingAppeal.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : existingAppeal.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          อุทธรณ์:{' '}
                          {existingAppeal.status === 'Pending'
                            ? 'รอพิจารณา'
                            : existingAppeal.status === 'Approved'
                            ? 'อนุมัติแล้ว'
                            : 'ปฏิเสธ'}
                        </span>
                      )}
                    </>
                  ) : isLocked ? (
                    <button
                      onClick={() => setEvalModalEnrollmentId(enr.enrollment_id)}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition"
                    >
                      <Star className="w-4 h-4 fill-amber-300 text-amber-300" /> ทำแบบประเมินเพื่อดูเกรด
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl">ยังไม่ออกเกรด</div>
                  )}
                </div>
              </div>

              {isUnlocked && detailEnrollmentId === enr.enrollment_id && (
                <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/80 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    รายละเอียดคะแนนตามเกณฑ์การประเมิน
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {db.assessment_criteria
                      .filter((c) => c.section_id === enr.section_id)
                      .map((crit) => {
                        const sc = db.student_scores.find(
                          (s) => s.enrollment_id === enr.enrollment_id && s.criteria_id === crit.criteria_id
                        );
                        const obtained = sc ? sc.score_obtained : 0;
                        const weighted = crit.max_score > 0 ? ((obtained / crit.max_score) * crit.weight_percent).toFixed(2) : 0;
                        return (
                          <div key={crit.criteria_id} className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-800">{crit.title}</p>
                            <div className="flex items-baseline justify-between mt-2">
                              <span className="text-lg font-bold text-indigo-600">
                                {obtained} <span className="text-xs font-normal text-slate-400">/ {crit.max_score}</span>
                              </span>
                              <span className="text-xs font-medium text-emerald-600">
                                ได้ {weighted}% จาก {crit.weight_percent}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {evalModalEnrollmentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">แบบประเมินการเรียนการสอน</h3>
                <p className="text-xs text-slate-500">ข้อมูลการประเมินจะถูกเก็บเป็นความลับ (ไม่ระบุตัวตน)</p>
              </div>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ความพึงพอใจต่อการสอนโดยรวม (1 - 5 ดาว)</label>
                <div className="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-xl border border-slate-200">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button type="button" key={num} onClick={() => setRatingScore(num)} className="p-1">
                      <Star
                        className={`w-8 h-8 ${
                          num <= ratingScore ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ข้อเสนอแนะเพิ่มเติมถึงผู้สอน</label>
                <textarea
                  rows="3"
                  placeholder="พิมพ์ความคิดเห็นหรือข้อเสนอแนะ..."
                  value={evalComment}
                  onChange={(e) => setEvalComment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvalModalEnrollmentId(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm"
                >
                  ส่งแบบประเมินและดูเกรด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {appealModalEnrollmentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <FileWarning className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">ยื่นคำร้องขอทบทวนเกรด</h3>
                <p className="text-xs text-slate-500">ส่งคำร้องไปยังอาจารย์ผู้สอนประจำรายวิชา</p>
              </div>
            </div>

            <form onSubmit={handleSubmitAppeal} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">เหตุผลและรายละเอียดที่ขอทบทวนคะแนน</label>
                <textarea
                  rows="4"
                  required
                  placeholder="ระบุหัวข้อคะแนนหรือส่วนที่ต้องการให้อาจารย์ตรวจสอบอีกครั้ง..."
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAppealModalEnrollmentId(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm"
                >
                  ยืนยันส่งคำร้อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

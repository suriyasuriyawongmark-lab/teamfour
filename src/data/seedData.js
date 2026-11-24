// Initial Seed Data based on ER Diagram
export const INITIAL_DATA = {
  users: [
    { user_id: 'U001', username: 'somchai.j', role: 'Instructor', email: 'somchai.j@university.ac.th' },
    { user_id: 'U002', username: 'suda.k', role: 'Instructor', email: 'suda.k@university.ac.th' },
    { user_id: 'U003', username: '66010001', role: 'Student', email: 'mark.s@student.university.ac.th' },
    { user_id: 'U004', username: '66010002', role: 'Student', email: 'meen.p@student.university.ac.th' },
    { user_id: 'U005', username: '66010003', role: 'Student', email: 'thanawat.w@student.university.ac.th' },
  ],
  instructors: [
    { instructor_id: 'INS01', user_id: 'U001', full_name: 'อ.แอมป์', department: 'วิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ' },
    { instructor_id: 'INS02', user_id: 'U002', full_name: 'อ.ปาร์ม', department: 'วิศวกรรมซอฟต์แวร์' },
  ],
  students: [
    { student_id: '66010001', user_id: 'U003', full_name: 'นายสุริยะ สุริยะวงค์', major: 'เทคโนโลยีสารสนเทศ (IT)', gpax: 3.45 },
    { student_id: '66010002', user_id: 'U004', full_name: 'นางสาวภัคธีมา ชมพูคำ', major: 'เทคโนโลยีสารสนเทศ (IT)', gpax: 3.82 },
    { student_id: '66010003', user_id: 'U005', full_name: 'นายภากร โนผ่า', major: 'วิทยาการข้อมูล (DS)', gpax: 2.95 },
  ],
  courses: [
    { course_code: 'IT305', course_name: 'การพัฒนาเว็บแอปพลิเคชันสมัยใหม่ (Modern Web App Dev)', credits: 3 },
    { course_code: 'CS204', course_name: 'ระบบฐานข้อมูลและการออกแบบ (Database Systems)', credits: 3 },
    { course_code: 'DS401', course_name: 'การวิเคราะห์ข้อมูลทางการเงิน (Financial Data Analytics)', credits: 3 },
  ],
  sections: [
    { section_id: 'SEC01', course_code: 'IT305', instructor_id: 'INS01', semester: '1/2569' },
    { section_id: 'SEC02', course_code: 'CS204', instructor_id: 'INS01', semester: '1/2569' },
    { section_id: 'SEC03', course_code: 'DS401', instructor_id: 'INS02', semester: '1/2569' },
  ],
  assessment_criteria: [
    { criteria_id: 'CR01', section_id: 'SEC01', title: 'จิตพิสัยและการเข้าเรียน', max_score: 10, weight_percent: 10 },
    { criteria_id: 'CR02', section_id: 'SEC01', title: 'งานที่มอบหมาย (Assignments)', max_score: 30, weight_percent: 30 },
    { criteria_id: 'CR03', section_id: 'SEC01', title: 'สอบกลางภาค (Midterm)', max_score: 30, weight_percent: 30 },
    { criteria_id: 'CR04', section_id: 'SEC01', title: 'โปรเจกต์จบรายวิชา (Final Project)', max_score: 30, weight_percent: 30 },
    { criteria_id: 'CR05', section_id: 'SEC02', title: 'แบบฝึกหัด SQL & ER Diagram', max_score: 40, weight_percent: 40 },
    { criteria_id: 'CR06', section_id: 'SEC02', title: 'สอบกลางภาค (Midterm)', max_score: 30, weight_percent: 30 },
    { criteria_id: 'CR07', section_id: 'SEC02', title: 'สอบปลายภาค (Final)', max_score: 30, weight_percent: 30 },
    { criteria_id: 'CR08', section_id: 'SEC03', title: 'Python Lab & Portfolio', max_score: 50, weight_percent: 50 },
    { criteria_id: 'CR09', section_id: 'SEC03', title: 'สอบปลายภาค (Final)', max_score: 50, weight_percent: 50 },
  ],
  enrollments: [
    { enrollment_id: 'ENR01', student_id: '66010001', section_id: 'SEC01', total_score: 78.5, letter_grade: 'B+', is_evaluated: true },
    { enrollment_id: 'ENR02', student_id: '66010001', section_id: 'SEC02', total_score: 84.0, letter_grade: 'A', is_evaluated: true },
    { enrollment_id: 'ENR03', student_id: '66010001', section_id: 'SEC03', total_score: 0, letter_grade: '-', is_evaluated: false },
    { enrollment_id: 'ENR04', student_id: '66010002', section_id: 'SEC01', total_score: 89.0, letter_grade: 'A', is_evaluated: true },
    { enrollment_id: 'ENR05', student_id: '66010002', section_id: 'SEC02', total_score: 91.5, letter_grade: 'A', is_evaluated: true },
    { enrollment_id: 'ENR06', student_id: '66010003', section_id: 'SEC01', total_score: 64.0, letter_grade: 'C', is_evaluated: true },
    { enrollment_id: 'ENR07', student_id: '66010003', section_id: 'SEC03', total_score: 72.0, letter_grade: 'B', is_evaluated: true },
  ],
  student_scores: [
    { score_id: 'SC01', enrollment_id: 'ENR01', criteria_id: 'CR01', score_obtained: 9.5 },
    { score_id: 'SC02', enrollment_id: 'ENR01', criteria_id: 'CR02', score_obtained: 24.0 },
    { score_id: 'SC03', enrollment_id: 'ENR01', criteria_id: 'CR03', score_obtained: 21.0 },
    { score_id: 'SC04', enrollment_id: 'ENR01', criteria_id: 'CR04', score_obtained: 24.0 },
    { score_id: 'SC05', enrollment_id: 'ENR02', criteria_id: 'CR05', score_obtained: 35.0 },
    { score_id: 'SC06', enrollment_id: 'ENR02', criteria_id: 'CR06', score_obtained: 24.0 },
    { score_id: 'SC07', enrollment_id: 'ENR02', criteria_id: 'CR07', score_obtained: 25.0 },
    { score_id: 'SC08', enrollment_id: 'ENR03', criteria_id: 'CR08', score_obtained: 42.0 },
    { score_id: 'SC09', enrollment_id: 'ENR03', criteria_id: 'CR09', score_obtained: 0 },
    { score_id: 'SC10', enrollment_id: 'ENR04', criteria_id: 'CR01', score_obtained: 10.0 },
    { score_id: 'SC11', enrollment_id: 'ENR04', criteria_id: 'CR02', score_obtained: 27.0 },
    { score_id: 'SC12', enrollment_id: 'ENR04', criteria_id: 'CR03', score_obtained: 25.0 },
    { score_id: 'SC13', enrollment_id: 'ENR04', criteria_id: 'CR04', score_obtained: 27.0 },
    { score_id: 'SC14', enrollment_id: 'ENR05', criteria_id: 'CR05', score_obtained: 38.0 },
    { score_id: 'SC15', enrollment_id: 'ENR05', criteria_id: 'CR06', score_obtained: 26.5 },
    { score_id: 'SC16', enrollment_id: 'ENR05', criteria_id: 'CR07', score_obtained: 27.0 },
    { score_id: 'SC17', enrollment_id: 'ENR06', criteria_id: 'CR01', score_obtained: 8.0 },
    { score_id: 'SC18', enrollment_id: 'ENR06', criteria_id: 'CR02', score_obtained: 18.0 },
    { score_id: 'SC19', enrollment_id: 'ENR06', criteria_id: 'CR03', score_obtained: 18.0 },
    { score_id: 'SC20', enrollment_id: 'ENR06', criteria_id: 'CR04', score_obtained: 20.0 },
    { score_id: 'SC21', enrollment_id: 'ENR07', criteria_id: 'CR08', score_obtained: 36.0 },
    { score_id: 'SC22', enrollment_id: 'ENR07', criteria_id: 'CR09', score_obtained: 36.0 },
  ],
  course_evaluations: [
    { eval_id: 'EV01', enrollment_id: 'ENR02', rating_score: 5, comment: 'อาจารย์อธิบายเรื่อง Normalization และ ER Diagram เข้าใจง่ายมากครับ', submitted_at: '2026-11-20 14:30' },
    { eval_id: 'EV02', enrollment_id: 'ENR04', rating_score: 5, comment: 'เนื้อหาทันสมัย ได้ฝึกทำโปรเจกต์จริง สนุกมากค่ะ', submitted_at: '2026-11-21 09:15' },
    { eval_id: 'EV03', enrollment_id: 'ENR05', rating_score: 4, comment: 'แบบฝึกหัดช่วยให้เข้าใจ SQL มากขึ้นค่ะ', submitted_at: '2026-11-21 09:20' },
  ],
  grade_appeals: [
    {
      appeal_id: 'AP01',
      enrollment_id: 'ENR06',
      reason: 'ขอความอนุเคราะห์ตรวจสอบคะแนนสอบกลางภาค (Midterm) ข้อที่ 3 ครับ เนื่องจากผมแสดงวิธีทำครบถ้วนแต่อาจตกหล่นการรวมคะแนนครับ',
      status: 'Pending',
      instructor_note: '',
      created_at: '2026-11-22 16:45'
    }
  ]
};

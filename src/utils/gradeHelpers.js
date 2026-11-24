export const calculateLetterGrade = (score) => {
  if (score >= 80) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'D+';
  if (score >= 50) return 'D';
  return 'F';
};

export const gradeToPoint = (grade) => {
  const map = { 'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0 };
  return map[grade] !== undefined ? map[grade] : null;
};

export const getGradeBadgeStyle = (grade) => {
  switch (grade) {
    case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'B+':
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'C+':
    case 'C': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'D+':
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'F': return 'bg-rose-100 text-rose-800 border-rose-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

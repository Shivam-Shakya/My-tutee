export const COURSE_CATALOG = [
  {
    id: 'sat',
    name: 'SAT',
    description: 'Undergraduate admissions test prep.',
    icon: '🎯',
    subCourses: [
      { id: 'sat-math', name: 'SAT Math', price: 0 },
      { id: 'sat-reading-writing', name: 'SAT Reading & Writing', price: 0 }
    ]
  },
  {
    id: 'ap',
    name: 'AP',
    description: 'Advanced Placement subject preparation.',
    icon: '📘',
    subCourses: [
      { id: 'ap-calculus', name: 'AP Calculus', price: 0 },
      { id: 'ap-physics', name: 'AP Physics', price: 0 },
      { id: 'ap-chemistry', name: 'AP Chemistry', price: 0 },
      { id: 'ap-biology', name: 'AP Biology', price: 0 },
      { id: 'ap-economics', name: 'AP Economics', price: 0 }
    ]
  },
  {
    id: 'ibdp',
    name: 'IBDP',
    description: 'IB Diploma Program curriculum support.',
    icon: '🎓',
    subCourses: [
      { id: 'ibdp-math-aa', name: 'Math AA', price: 0 },
      { id: 'ibdp-math-ai', name: 'Math AI', price: 0 },
      { id: 'ibdp-physics', name: 'Physics', price: 0 },
      { id: 'ibdp-chemistry', name: 'Chemistry', price: 0 },
      { id: 'ibdp-biology', name: 'Biology', price: 0 }
    ]
  },
  {
    id: 'ibmyp',
    name: 'IBMYP',
    description: 'IB Middle Years Program support.',
    icon: '📗',
    subCourses: [
      { id: 'ibmyp-math', name: 'Math', price: 0 },
      { id: 'ibmyp-integrated-science', name: 'Integrated Science', price: 0 },
      { id: 'ibmyp-language', name: 'Language & Literature', price: 0 }
    ]
  },
  {
    id: 'igcse',
    name: 'IGCSE',
    description: 'Cambridge IGCSE subject coaching.',
    icon: '🧪',
    subCourses: [
      { id: 'igcse-math', name: 'IGCSE Math', price: 0 },
      { id: 'igcse-physics', name: 'IGCSE Physics', price: 0 },
      { id: 'igcse-chemistry', name: 'IGCSE Chemistry', price: 0 },
      { id: 'igcse-biology', name: 'IGCSE Biology', price: 0 }
    ]
  },
  {
    id: 'psat',
    name: 'PSAT',
    description: 'PSAT prep for early readiness.',
    icon: '📝',
    subCourses: [
      { id: 'psat-math', name: 'PSAT Math', price: 0 },
      { id: 'psat-reading-writing', name: 'PSAT Reading & Writing', price: 0 }
    ]
  },
  {
    id: 'esat',
    name: 'ESAT',
    description: 'Engineering and science admissions test prep.',
    icon: '⚙️',
    subCourses: [
      { id: 'esat-math', name: 'ESAT Math', price: 0 },
      { id: 'esat-physics', name: 'ESAT Physics', price: 0 },
      { id: 'esat-chemistry', name: 'ESAT Chemistry', price: 0 }
    ]
  },
  {
    id: 'tmua',
    name: 'TMUA',
    description: 'Test of Mathematics for University Admission.',
    icon: '📐',
    subCourses: [
      { id: 'tmua-paper-1', name: 'TMUA Paper 1', price: 0 },
      { id: 'tmua-paper-2', name: 'TMUA Paper 2', price: 0 }
    ]
  },
  {
    id: 'gmat',
    name: 'GMAT',
    description: 'Business school admissions test prep.',
    icon: '💼',
    subCourses: [
      { id: 'gmat-quant', name: 'GMAT Quant', price: 0 },
      { id: 'gmat-verbal', name: 'GMAT Verbal', price: 0 },
      { id: 'gmat-data-insights', name: 'Data Insights', price: 0 }
    ]
  },
  {
    id: 'gre',
    name: 'GRE',
    description: 'Graduate Record Examinations prep.',
    icon: '📊',
    subCourses: [
      { id: 'gre-quant', name: 'GRE Quant', price: 0 },
      { id: 'gre-verbal', name: 'GRE Verbal', price: 0 },
      { id: 'gre-awa', name: 'Analytical Writing', price: 0 }
    ]
  }
];

export const getCourseById = (courseId) => COURSE_CATALOG.find((course) => course.id === courseId);

export const getSubCourseMap = (course) => {
  if (!course?.subCourses) return {};

  return course.subCourses.reduce((accumulator, subCourse) => {
    accumulator[subCourse.id] = subCourse;
    return accumulator;
  }, {});
};

export const calculateSubCoursesTotal = (course, selectedSubCourseIds = []) => {
  const subCourseMap = getSubCourseMap(course);

  return selectedSubCourseIds.reduce((total, subCourseId) => {
    const subCoursePrice = Number(subCourseMap[subCourseId]?.price || 0);
    return total + subCoursePrice;
  }, 0);
};

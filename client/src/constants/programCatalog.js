export const PROGRAM_CATALOG = {
  SAT: [
    {
      id: 'e-Rapid',
      name: 'e-Rapid SAT',
      description: 'Fast-track SAT prep with intensive live classes, focused mock analysis, and personal mentoring.',
      fee: 49999,
      duration: '90 days'
    },
    {
      id: 'e-Compact',
      name: 'e-Compact SAT',
      description: 'Balanced SAT schedule for steady concept build-up, regular testing, and performance feedback.',
      fee: 64999,
      duration: '120 days'
    },
    {
      id: 'e-Comprehensive',
      name: 'e-Comprehensive SAT',
      description: 'In-depth SAT plan with slow-paced reinforcement, extensive practice volume, and long-term mentoring.',
      fee: 84999,
      duration: '180 days'
    },
    {
      id: 'Weekend',
      name: 'Weekend e-SAT',
      description: 'Weekend-focused SAT coaching for students needing flexible timing without losing rigorous prep.',
      fee: 59999,
      duration: '120 days'
    }
  ],
  GMAT: [
    {
      id: 'GMAT-Core',
      name: 'GMAT Core',
      description: 'Core GMAT preparation for concept clarity across Quant, Verbal, and Data Insights.',
      fee: 52999,
      duration: '10 weeks'
    },
    {
      id: 'GMAT-Pro',
      name: 'GMAT Pro',
      description: 'Advanced GMAT strategy track with timed drills, error analytics, and score acceleration.',
      fee: 67999,
      duration: '14 weeks'
    },
    {
      id: 'GMAT-Elite',
      name: 'GMAT Elite',
      description: 'Premium GMAT package with full simulation cycles and one-to-one score optimization.',
      fee: 82999,
      duration: '18 weeks'
    }
  ],
  GRE: [
    {
      id: 'GRE-Foundation',
      name: 'GRE Foundation',
      description: 'Strong GRE fundamentals for vocabulary, quant reasoning, and writing readiness.',
      fee: 48999,
      duration: '10 weeks'
    },
    {
      id: 'GRE-Plus',
      name: 'GRE Plus',
      description: 'Structured GRE growth plan with timed sections, analytics, and mentor-led corrections.',
      fee: 63999,
      duration: '14 weeks'
    },
    {
      id: 'GRE-Advanced',
      name: 'GRE Advanced',
      description: 'Comprehensive GRE high-score pathway with advanced practice and personalized strategy.',
      fee: 78999,
      duration: '18 weeks'
    }
  ]
};

export const PROGRAM_COURSES = ['SAT', 'GMAT', 'GRE'];

export const getProgramById = (courseName, programId) => {
  const coursePrograms = PROGRAM_CATALOG[courseName] || [];
  return coursePrograms.find((program) => program.id === programId || program.name === programId) || null;
};

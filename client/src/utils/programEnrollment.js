export const buildProgramPaymentState = (courseName, program) => ({
  programEnrollment: {
    courseName,
    programId: program.id,
    programName: program.name,
    description: program.description,
    fee: Number(program.fee || 0),
    duration: program.duration || '',
    features: Array.isArray(program.features) ? program.features : []
  }
});

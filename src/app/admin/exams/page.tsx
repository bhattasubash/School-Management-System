import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import AdminExamsClient, {
  ExamTermItem,
  ExamScheduleItem,
  StudentResultPreview,
  GradeScaleItem,
} from '@/components/admin/AdminExamsClient';
import { Role } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminExamsPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  const [tenant, examTermsRaw, examSchedulesRaw, gradeScalesRaw, studentsRaw] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    }),
    prisma.examTerm.findMany({
      where: { tenantId },
      orderBy: { startDate: 'asc' },
    }),
    prisma.examSchedule.findMany({
      where: { tenantId },
      include: {
        examTerm: true,
        classGrade: true,
        subject: true,
        _count: {
          select: { results: true },
        },
      },
      orderBy: { examDate: 'asc' },
    }),
    prisma.gradeScale.findMany({
      where: { tenantId },
      orderBy: { minPercentage: 'desc' },
    }),
    prisma.studentProfile.findMany({
      where: { tenantId, user: { isActive: true } },
      include: {
        user: true,
        section: {
          include: {
            classGrade: true,
          },
        },
        attendances: {
          take: 30,
        },
      },
      take: 6,
    }),
  ]);

  const schoolName = tenant?.name || 'Sunrise Public School';

  // Standard terms fallback if empty
  const terms: ExamTermItem[] =
    examTermsRaw.length > 0
      ? examTermsRaw.map((t) => ({
          id: t.id,
          name: t.name,
          startDate: t.startDate.toISOString().split('T')[0],
          endDate: t.endDate.toISOString().split('T')[0],
          isLocked: t.isLocked,
        }))
      : [
          {
            id: 'term-1',
            name: 'Midterm Examination (Term 1)',
            startDate: '2026-10-12',
            endDate: '2026-10-24',
            isLocked: false,
          },
          {
            id: 'term-2',
            name: 'Annual Board Assessment (Term 2)',
            startDate: '2027-02-15',
            endDate: '2027-03-02',
            isLocked: false,
          },
        ];

  // Standard schedules fallback if empty
  const schedules: ExamScheduleItem[] =
    examSchedulesRaw.length > 0
      ? examSchedulesRaw.map((s) => ({
          id: s.id,
          termId: s.examTermId,
          termName: s.examTerm.name,
          classGradeId: s.classGradeId,
          classGradeName: s.classGrade.name,
          subjectId: s.subjectId,
          subjectName: s.subject.name,
          subjectCode: s.subject.code,
          examDate: s.examDate.toISOString().split('T')[0],
          timeRange: `${s.startTime} - ${s.endTime}`,
          maxMarks: Number(s.maxMarks),
          passingMarks: Number(s.passingMarks),
          resultsCount: s._count.results,
        }))
      : [
          {
            id: 'sch-1',
            termId: terms[0]?.id || 'term-1',
            termName: terms[0]?.name || 'Midterm Examination',
            classGradeId: 'cg-10',
            classGradeName: 'Class 10',
            subjectId: 'sub-math',
            subjectName: 'Mathematics',
            subjectCode: 'MATH-10',
            examDate: '2026-10-12',
            timeRange: '09:00 AM - 12:00 PM',
            maxMarks: 100,
            passingMarks: 33,
            resultsCount: 28,
          },
          {
            id: 'sch-2',
            termId: terms[0]?.id || 'term-1',
            termName: terms[0]?.name || 'Midterm Examination',
            classGradeId: 'cg-10',
            classGradeName: 'Class 10',
            subjectId: 'sub-sci',
            subjectName: 'Science (Physics, Chem, Bio)',
            subjectCode: 'SCI-10',
            examDate: '2026-10-15',
            timeRange: '09:00 AM - 12:00 PM',
            maxMarks: 100,
            passingMarks: 33,
            resultsCount: 28,
          },
          {
            id: 'sch-3',
            termId: terms[0]?.id || 'term-1',
            termName: terms[0]?.name || 'Midterm Examination',
            classGradeId: 'cg-10',
            classGradeName: 'Class 10',
            subjectId: 'sub-eng',
            subjectName: 'English Language & Literature',
            subjectCode: 'ENG-10',
            examDate: '2026-10-18',
            timeRange: '09:00 AM - 12:00 PM',
            maxMarks: 100,
            passingMarks: 33,
            resultsCount: 28,
          },
          {
            id: 'sch-4',
            termId: terms[0]?.id || 'term-1',
            termName: terms[0]?.name || 'Midterm Examination',
            classGradeId: 'cg-10',
            classGradeName: 'Class 10',
            subjectId: 'sub-sst',
            subjectName: 'Social Studies & Civics',
            subjectCode: 'SST-10',
            examDate: '2026-10-21',
            timeRange: '09:00 AM - 12:00 PM',
            maxMarks: 100,
            passingMarks: 33,
            resultsCount: 28,
          },
        ];

  // Standard grade scales fallback if empty
  const gradeScales: GradeScaleItem[] =
    gradeScalesRaw.length > 0
      ? gradeScalesRaw.map((g) => ({
          grade: g.grade,
          minPercent: Number(g.minPercentage),
          maxPercent: Number(g.maxPercentage),
          gradePoint: Number(g.gradePoint),
          description: g.description || 'Scholastic standard',
        }))
      : [
          { grade: 'A1', minPercent: 91, maxPercent: 100, gradePoint: 10.0, description: 'Outstanding / Top 1/8th' },
          { grade: 'A2', minPercent: 81, maxPercent: 90, gradePoint: 9.0, description: 'Excellent / Next 1/8th' },
          { grade: 'B1', minPercent: 71, maxPercent: 80, gradePoint: 8.0, description: 'Very Good' },
          { grade: 'B2', minPercent: 61, maxPercent: 70, gradePoint: 7.0, description: 'Good' },
          { grade: 'C1', minPercent: 51, maxPercent: 60, gradePoint: 6.0, description: 'Above Average' },
          { grade: 'C2', minPercent: 41, maxPercent: 50, gradePoint: 5.0, description: 'Average' },
          { grade: 'D', minPercent: 33, maxPercent: 40, gradePoint: 4.0, description: 'Marginal Pass' },
          { grade: 'E', minPercent: 0, maxPercent: 32, gradePoint: 0.0, description: 'Needs Essential Repeat' },
        ];

  // Generate Report Card samples from active students
  const sampleReportCards: StudentResultPreview[] = studentsRaw.map((s, idx) => {
    const math = 88 - idx * 4;
    const sci = 84 - idx * 3;
    const eng = 92 - idx * 2;
    const sst = 86 - idx * 5;
    const totalMax = 400;
    const totalObtained = math + sci + eng + sst;
    const percentage = Math.round((totalObtained / totalMax) * 100);

    let overallGrade = 'A1';
    if (percentage < 91 && percentage >= 81) overallGrade = 'A2';
    else if (percentage < 81 && percentage >= 71) overallGrade = 'B1';
    else if (percentage < 71 && percentage >= 61) overallGrade = 'B2';
    else if (percentage < 61) overallGrade = 'C1';

    return {
      id: s.id,
      studentName: `${s.user.firstName} ${s.user.lastName}`,
      admissionNumber: s.admissionNumber,
      classSection: `${s.section.classGrade.name}-${s.section.name}`,
      rollNumber: s.rollNumber || idx + 1,
      marks: [
        { subject: 'Mathematics', code: 'MATH-10', max: 100, obtained: math, grade: math >= 91 ? 'A1' : 'A2' },
        { subject: 'Science', code: 'SCI-10', max: 100, obtained: sci, grade: sci >= 81 ? 'A2' : 'B1' },
        { subject: 'English', code: 'ENG-10', max: 100, obtained: eng, grade: eng >= 91 ? 'A1' : 'A2' },
        { subject: 'Social Studies', code: 'SST-10', max: 100, obtained: sst, grade: sst >= 81 ? 'A2' : 'B1' },
      ],
      totalMax,
      totalObtained,
      percentage,
      overallGrade,
      attendancePercent: 94 - idx * 2,
      remarks:
        percentage >= 85
          ? 'Exceptional academic consistency and disciplined classroom contribution.'
          : 'Good effort demonstrated. Recommended to strengthen focus on numerical problem-solving.',
    };
  });

  return (
    <AdminExamsClient
      terms={terms}
      schedules={schedules}
      sampleReportCards={sampleReportCards}
      gradeScales={gradeScales}
      schoolName={schoolName}
    />
  );
}

import { PrismaClient, Role, UserStatus, CourseLevel, CourseStatus, LessonType, EnrollmentStatus, ScoringPolicy, QuestionType, SubmissionStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Seeding database with realistic Dars LMS data...');

  const passwordHash = await argon2.hash('DarsDemo-2026');

  // 1. Demo Accounts
  const student = await prisma.user.upsert({
    where: { email: 'student@dars.test' },
    update: {},
    create: {
      email: 'student@dars.test',
      name: 'Amira Ben Salah',
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@dars.test' },
    update: {},
    create: {
      email: 'instructor@dars.test',
      name: 'Dr. Jlassi',
      role: Role.INSTRUCTOR,
      status: UserStatus.ACTIVE,
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@dars.test' },
    update: {},
    create: {
      email: 'admin@dars.test',
      name: 'System Admin',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  console.info('  ✓ Demo accounts ready');

  // 2. Courses
  // Course 1: Databases and SQL
  const dbCourse = await prisma.course.upsert({
    where: { slug: 'databases-and-sql' },
    update: {},
    create: {
      title: 'Databases and SQL',
      slug: 'databases-and-sql',
      description: 'Master relational data modeling, query optimization, indexing and transactions.',
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      instructorId: instructor.id,
    },
  });

  // Course 2: Web Development with React
  const reactCourse = await prisma.course.upsert({
    where: { slug: 'web-development-with-react' },
    update: {},
    create: {
      title: 'Web Development with React',
      slug: 'web-development-with-react',
      description: 'Build fast, accessible, resilient web applications with modern React 18 and TypeScript.',
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      instructorId: instructor.id,
    },
  });

  // Course 3: Algorithms and Data Structures
  const algoCourse = await prisma.course.upsert({
    where: { slug: 'algorithms-and-data-structures' },
    update: {},
    create: {
      title: 'Algorithms and Data Structures',
      slug: 'algorithms-and-data-structures',
      description: 'Core concepts in complexity analysis, trees, graphs, sorting, and dynamic programming.',
      level: CourseLevel.ADVANCED,
      status: CourseStatus.PUBLISHED,
      instructorId: instructor.id,
    },
  });

  // Course 4: Technical English
  const englishCourse = await prisma.course.upsert({
    where: { slug: 'technical-english' },
    update: {},
    create: {
      title: 'Technical English',
      slug: 'technical-english',
      description: 'Engineering documentation, concise communication, PR descriptions and architectural specs.',
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      instructorId: instructor.id,
    },
  });

  console.info('  ✓ Courses created');

  // 3. Modules and Lessons for Databases and SQL
  // Module 1: Relational Foundations
  const mod1 = await prisma.module.upsert({
    where: { courseId_position: { courseId: dbCourse.id, position: 1 } },
    update: {},
    create: {
      courseId: dbCourse.id,
      title: 'Relational Foundations',
      position: 1,
    },
  });

  // Module 2: Queries and Projections
  const mod2 = await prisma.module.upsert({
    where: { courseId_position: { courseId: dbCourse.id, position: 2 } },
    update: {},
    create: {
      courseId: dbCourse.id,
      title: 'Queries and Projections',
      position: 2,
    },
  });

  // Module 3: Joins & Aggregations
  const mod3 = await prisma.module.upsert({
    where: { courseId_position: { courseId: dbCourse.id, position: 3 } },
    update: {},
    create: {
      courseId: dbCourse.id,
      title: 'Joins and Aggregations',
      position: 3,
    },
  });

  // Lessons inside Module 3
  const lessonJoins = await prisma.lesson.upsert({
    where: { moduleId_position: { moduleId: mod3.id, position: 4 } },
    update: {},
    create: {
      moduleId: mod3.id,
      title: 'Joins in practice',
      slug: 'joins-in-practice',
      type: LessonType.TEXT,
      position: 4,
      durationMin: 12,
      required: true,
      content: `# Joins in Practice\n\nRelational databases express relationships across tables using foreign keys. In this lesson, we examine how PostgreSQL executes inner, left, and full outer joins, and analyze execution plans using \`EXPLAIN ANALYZE\`.\n\n\`\`\`sql\nSELECT students.id, students.name, enrollments.course_id\nFROM students\nINNER JOIN enrollments ON enrollments.user_id = students.id\nWHERE enrollments.status = 'ACTIVE';\n\`\`\`\n\n### Join Types Comparison\n\n- **INNER JOIN**: Produces records only where matching rows exist on both sides.\n- **LEFT OUTER JOIN**: Preserves all records from the left relation, filling unmatched right attributes with NULL.\n- **FULL OUTER JOIN**: Preserves unmatched records from both tables.\n`,
    },
  });

  // Populate total 24 lessons across DB course modules
  const allDbLessons: { id: string }[] = [];
  allDbLessons.push(lessonJoins);

  for (let i = 1; i <= 24; i++) {
    const targetMod = i <= 6 ? mod1 : i <= 14 ? mod2 : mod3;
    const lesson = await prisma.lesson.upsert({
      where: { moduleId_position: { moduleId: targetMod.id, position: i } },
      update: {},
      create: {
        moduleId: targetMod.id,
        title: i === 15 ? 'Joins in practice' : `Database Concept ${i}`,
        slug: i === 15 ? 'joins-in-practice-alt' : `db-concept-${i}`,
        type: i % 4 === 0 ? LessonType.VIDEO : LessonType.TEXT,
        position: i,
        durationMin: 10 + (i % 5),
        required: true,
        videoUrl: i % 4 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
        content: `### Concept ${i}\n\nDetailed walkthrough of relational database structures and queries.`,
      },
    });
    allDbLessons.push(lesson);
  }

  // 4. Enrollments and Student Progress
  // Student enrolled in Databases and SQL (58% completed: 14 of 24 lessons completed)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: dbCourse.id } },
    update: { progressPct: 58 },
    create: {
      userId: student.id,
      courseId: dbCourse.id,
      status: EnrollmentStatus.ACTIVE,
      progressPct: 58,
    },
  });

  // Mark first 14 lessons completed
  for (let i = 0; i < 14 && i < allDbLessons.length; i++) {
    const l = allDbLessons[i];
    if (l) {
      await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: student.id, lessonId: l.id } },
        update: {},
        create: {
          userId: student.id,
          lessonId: l.id,
        },
      });
    }
  }

  // Enroll in React Course (31%)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: reactCourse.id } },
    update: { progressPct: 31 },
    create: {
      userId: student.id,
      courseId: reactCourse.id,
      status: EnrollmentStatus.ACTIVE,
      progressPct: 31,
    },
  });

  // Enroll in Algorithms Course (12%)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: algoCourse.id } },
    update: { progressPct: 12 },
    create: {
      userId: student.id,
      courseId: algoCourse.id,
      status: EnrollmentStatus.ACTIVE,
      progressPct: 12,
    },
  });

  // Enroll in Technical English (100% - Passed)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: englishCourse.id } },
    update: { progressPct: 100, status: EnrollmentStatus.COMPLETED, completedAt: new Date() },
    create: {
      userId: student.id,
      courseId: englishCourse.id,
      status: EnrollmentStatus.COMPLETED,
      progressPct: 100,
      completedAt: new Date(),
    },
  });

  console.info('  ✓ Enrollments and lesson progress seeded');

  // 5. Quizzes & Questions
  const now = Date.now();
  const wedDate = new Date(now + 4 * 24 * 60 * 60 * 1000); // 4 days ahead
  wedDate.setHours(18, 0, 0, 0);

  await prisma.quiz.create({
    data: {
      courseId: reactCourse.id,
      title: 'React state and effects',
      description: 'Assessment on hooks, closures, render cycles, and useEffect dependencies.',
      timeLimitSec: 1200, // 20 min
      maxAttempts: 3,
      passPct: 75,
      scoringPolicy: ScoringPolicy.BEST,
      questions: {
        create: [
          {
            prompt: 'Which hook should be used to run side effects after paint in React?',
            type: QuestionType.SINGLE_CHOICE,
            points: 1,
            position: 1,
            explanation: 'useEffect runs asynchronously after paint, avoiding blocking browser render.',
            options: {
              create: [
                { text: 'useEffect', isCorrect: true, position: 1 },
                { text: 'useLayoutEffect', isCorrect: false, position: 2 },
                { text: 'useMemo', isCorrect: false, position: 3 },
                { text: 'useRef', isCorrect: false, position: 4 },
              ],
            },
          },
          {
            prompt: 'State updates scheduled with setState are always synchronous.',
            type: QuestionType.TRUE_FALSE,
            points: 1,
            position: 2,
            explanation: 'React batches state updates and executes them asynchronously.',
            options: {
              create: [
                { text: 'True', isCorrect: false, position: 1 },
                { text: 'False', isCorrect: true, position: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // 6. Assignments
  // Due in 2 days
  const twoDays = new Date(now + 2 * 24 * 60 * 60 * 1000);
  twoDays.setHours(23, 59, 0, 0);

  await prisma.assignment.create({
    data: {
      courseId: dbCourse.id,
      title: 'SQL joins worksheet',
      description: 'Complete the query worksheet demonstrating INNER, LEFT and self-joins on the e-commerce schema.',
      dueAt: twoDays,
      maxPoints: 100,
      allowLate: true,
      latePenaltyPct: 10,
    },
  });

  // Due in 6 days
  const sixDays = new Date(now + 6 * 24 * 60 * 60 * 1000);
  sixDays.setHours(12, 0, 0, 0);

  await prisma.assignment.create({
    data: {
      courseId: algoCourse.id,
      title: 'Big-O problem set',
      description: 'Analyze time and space complexity for recursive algorithms and graph traversals.',
      dueAt: sixDays,
      maxPoints: 100,
      allowLate: false,
    },
  });

  // Past assignment with submissions and grades (for Average Grade 86.4 / 100, 12 submitted, 2 awaiting feedback)
  const pastAssignment = await prisma.assignment.create({
    data: {
      courseId: dbCourse.id,
      title: 'Schema Normalization Exercise',
      description: 'Normalize an unnormalized schema up to BCNF with functional dependencies.',
      dueAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
      maxPoints: 100,
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: pastAssignment.id,
      userId: student.id,
      status: SubmissionStatus.GRADED,
      content: 'Here is my complete BCNF breakdown...',
      submittedAt: new Date(now - 8 * 24 * 60 * 60 * 1000),
      rawPoints: 86.4,
      points: 86.4,
      feedback: 'Excellent breakdown of functional dependencies. Clean decomposition.',
      gradedById: instructor.id,
      gradedAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
    },
  });

  console.info('  ✓ Quizzes, questions, assignments and graded submissions seeded');
  console.info('🚀 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

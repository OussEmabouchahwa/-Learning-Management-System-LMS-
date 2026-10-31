import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'apps/web/dist');
const outDir = path.resolve(rootDir, 'docs/screenshots');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

// Simple static SPA server
function createServer() {
  return http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url.split('?')[0]);
    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        filePath = path.join(distDir, 'index.html');
      }
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
  });
}

const mockStudent = {
  id: 'usr-student-1',
  name: 'Amira Ben Salah',
  email: 'student@dars.test',
  role: 'STUDENT',
  status: 'ACTIVE',
};

const mockDashboard = {
  data: {
    dateFormatted: 'Saturday 31 October',
    resume: {
      courseId: 'c-1',
      courseSlug: 'databases-sql',
      courseTitle: 'Databases and SQL',
      instructorName: 'Dr. Jlassi',
      moduleId: 'mod-3',
      moduleTitle: 'Relational Joins',
      modulePosition: 3,
      lessonId: 'lesson-4',
      lessonTitle: 'Joins in practice',
      lessonPosition: 4,
      lessonDurationMin: 12,
      completedLessonsCount: 14,
      totalLessonsCount: 24,
      nextMilestoneText: 'Quiz 3 unlocks after lesson 17',
    },
    stats: {
      averageGradePct: 86.4,
      submittedAssignmentsCount: 12,
      totalAssignmentsCount: 14,
      awaitingFeedbackCount: 2,
      oldestFeedbackDays: 3,
    },
    dueSoon: [
      {
        id: 'asg-1',
        title: 'SQL joins worksheet',
        type: 'ASSIGNMENT',
        courseTitle: 'Databases and SQL',
        dueAt: 'Mon 2 Nov, 23:59',
        badgeText: 'In 2 days',
        badgeVariant: 'soon',
      },
      {
        id: 'quiz-1',
        title: 'React state and effects',
        type: 'QUIZ',
        courseTitle: 'Web Development with React',
        dueAt: 'Wed 4 Nov, 18:00',
        badgeText: 'Wed',
        badgeVariant: 'default',
        durationMinutes: 20,
      },
      {
        id: 'asg-2',
        title: 'Big-O problem set',
        type: 'ASSIGNMENT',
        courseTitle: 'Algorithms and Data Structures',
        dueAt: 'Fri 6 Nov, 12:00',
        badgeText: 'Fri',
        badgeVariant: 'default',
      },
    ],
    courses: [
      {
        id: 'c-1',
        slug: 'databases-sql',
        title: 'Databases and SQL',
        nextLessonTitle: 'Joins in practice',
        progressPct: 58,
        totalLessons: 24,
        completedLessons: 14,
      },
      {
        id: 'c-2',
        slug: 'react-dev',
        title: 'Web Development with React',
        nextLessonTitle: 'Controlled forms',
        progressPct: 31,
        totalLessons: 26,
        completedLessons: 8,
      },
      {
        id: 'c-3',
        slug: 'algo-ds',
        title: 'Algorithms and Data Structures',
        nextLessonTitle: 'Recursion',
        progressPct: 12,
        totalLessons: 32,
        completedLessons: 4,
      },
      {
        id: 'c-4',
        slug: 'tech-english',
        title: 'Technical English',
        nextLessonTitle: null,
        progressPct: 100,
        statusBadge: 'Passed',
        totalLessons: 16,
        completedLessons: 16,
      },
    ],
  },
};

const mockCourses = {
  data: [
    {
      id: 'c-1',
      slug: 'databases-sql',
      title: 'Databases and SQL',
      description: 'Master relational schema design, indexing, transactions, and high-performance SQL queries.',
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      instructorId: 'ins-1',
      instructorName: 'Dr. Jlassi',
      totalLessons: 24,
      totalDurationMin: 280,
      enrolledStudentsCount: 38,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-31T00:00:00Z',
    },
    {
      id: 'c-2',
      slug: 'react-dev',
      title: 'Web Development with React',
      description: 'Component architecture, state management with hooks, concurrent rendering, and clean UI.',
      level: 'BEGINNER',
      status: 'PUBLISHED',
      instructorId: 'ins-1',
      instructorName: 'Dr. Jlassi',
      totalLessons: 26,
      totalDurationMin: 320,
      enrolledStudentsCount: 42,
      createdAt: '2026-10-05T00:00:00Z',
      updatedAt: '2026-10-31T00:00:00Z',
    },
    {
      id: 'c-3',
      slug: 'algo-ds',
      title: 'Algorithms and Data Structures',
      description: 'Sorting, trees, graphs, dynamic programming, and complexity analysis from first principles.',
      level: 'ADVANCED',
      status: 'PUBLISHED',
      instructorId: 'ins-2',
      instructorName: 'Prof. Trabelsi',
      totalLessons: 32,
      totalDurationMin: 450,
      enrolledStudentsCount: 29,
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-31T00:00:00Z',
    },
  ],
};

const mockLesson = {
  data: {
    id: 'lesson-4',
    moduleId: 'mod-3',
    courseId: 'c-1',
    title: 'Joins in practice',
    slug: 'joins-in-practice',
    type: 'TEXT',
    position: 3,
    durationMin: 12,
    required: true,
    completed: true,
    content: `When working with normalized relational tables, queries often need to combine columns from two or more entities. The **INNER JOIN** keyword selects records that have matching values in both tables.

\`\`\`sql
SELECT 
  students.id, 
  students.name, 
  courses.title 
FROM students
INNER JOIN enrollments ON students.id = enrollments.student_id
INNER JOIN courses ON enrollments.course_id = courses.id
WHERE courses.status = 'PUBLISHED';
\`\`\`

### Execution Strategy

PostgreSQL evaluates joins using several physical strategies depending on table size and existing indexes:
1. **Nested Loop**: optimal when one table is very small and the join column on the inner table is indexed.
2. **Hash Join**: hashes the smaller dataset in memory and streams the larger table against the hash table.
3. **Merge Join**: sorts both inputs on the join keys and advances pointers simultaneously.

Always run \`EXPLAIN ANALYZE\` on join queries with large datasets to inspect the chosen scan and join algorithms.`,
  },
};

const mockQuizAttempt = {
  data: {
    id: 'att-1',
    quizId: 'quiz-1',
    quizTitle: 'React state and effects',
    timeLimitSec: 1200,
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 1150 * 1000).toISOString(),
    questions: [
      {
        id: 'q-1',
        prompt: 'Which Hook should you use to run a side effect after the component has finished rendering?',
        type: 'SINGLE_CHOICE',
        points: 2,
        position: 0,
        options: [
          { id: 'opt-1', text: 'useState', position: 0 },
          { id: 'opt-2', text: 'useEffect', position: 1 },
          { id: 'opt-3', text: 'useMemo', position: 2 },
          { id: 'opt-4', text: 'useRef', position: 3 },
        ],
      },
      {
        id: 'q-2',
        prompt: 'What happens when you pass an empty dependency array [] to useEffect?',
        type: 'SINGLE_CHOICE',
        points: 2,
        position: 1,
        options: [
          { id: 'opt-5', text: 'The effect runs on every re-render', position: 0 },
          { id: 'opt-6', text: 'The effect only runs once after the initial mount', position: 1 },
          { id: 'opt-7', text: 'The effect never executes', position: 2 },
        ],
      },
      {
        id: 'q-3',
        prompt: 'True or False: Updating state directly without the setter triggers a re-render.',
        type: 'SINGLE_CHOICE',
        points: 1,
        position: 2,
        options: [
          { id: 'opt-8', text: 'True', position: 0 },
          { id: 'opt-9', text: 'False', position: 1 },
        ],
      },
    ],
    savedAnswers: {
      'q-1': ['opt-2'],
    },
  },
};

async function main() {
  const server = createServer();
  await new Promise((resolve) => server.listen(4173, resolve));
  console.log('Static preview server listening on http://localhost:4173');

  const browser = await chromium.launch({ headless: true });

  // 1. Unauthenticated context for Login Page
  const unauthContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const unauthPage = await unauthContext.newPage();
  console.log('Capturing: 1. Login Page...');
  await unauthPage.goto('http://localhost:4173/login', { waitUntil: 'networkidle' });
  await unauthPage.waitForTimeout(400);
  await unauthPage.screenshot({ path: path.join(outDir, 'login.png'), fullPage: false });
  await unauthContext.close();

  // 2. Authenticated context with injected session
  const authContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await authContext.addInitScript((student) => {
    window.__INITIAL_AUTH__ = {
      user: student,
      token: 'mock-jwt-access-token',
    };
  }, mockStudent);

  const page = await authContext.newPage();

  // Intercept all API routes
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/me/dashboard')) {
      return route.fulfill({ json: mockDashboard });
    }
    if (url.includes('/courses/c-1/lessons/lesson-4')) {
      return route.fulfill({ json: mockLesson });
    }
    if (url.includes('/courses')) {
      return route.fulfill({ json: mockCourses });
    }
    if (url.includes('/quizzes/quiz-1/attempts')) {
      return route.fulfill({ json: mockQuizAttempt });
    }
    return route.fulfill({ json: { data: {} } });
  });

  console.log('Capturing: 2. Dashboard Desktop (1440px)...');
  await page.goto('http://localhost:4173/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'dashboard.png'), fullPage: false });

  console.log('Capturing: 3. Dashboard Mobile (390px)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'dashboard-mobile.png'), fullPage: false });

  // Back to desktop
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Capturing: 4. Lesson Viewer (Plex Serif Prose)...');
  await page.goto('http://localhost:4173/courses/c-1/lessons/lesson-4', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'lesson-viewer.png'), fullPage: false });

  console.log('Capturing: 5. Quiz Player (Timer & Navigator)...');
  await page.goto('http://localhost:4173/courses/c-1/quizzes/quiz-1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'quiz-player.png'), fullPage: false });

  console.log('Capturing: 6. Course Catalog...');
  await page.goto('http://localhost:4173/courses', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'course-catalog.png'), fullPage: false });

  await browser.close();
  server.close();
  console.log('All screenshots captured successfully into docs/screenshots/!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

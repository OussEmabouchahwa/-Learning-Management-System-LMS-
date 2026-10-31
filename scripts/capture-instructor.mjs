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

const mockInstructor = {
  id: 'usr-instructor-1',
  name: 'Dr. Jlassi',
  email: 'instructor@dars.test',
  role: 'INSTRUCTOR',
  status: 'ACTIVE',
};

const mockQueue = {
  data: [
    {
      id: 'sub-1',
      assignmentId: 'asg-1',
      assignmentTitle: 'SQL joins worksheet',
      userId: 'usr-student-1',
      studentName: 'Amira Ben Salah',
      status: 'SUBMITTED',
      submittedAt: '2026-10-31T14:30:00Z',
      content: 'SELECT students.id, students.name FROM students JOIN enrollments ON students.id = enrollments.student_id;',
      fileName: 'joins-worksheet.sql',
    },
    {
      id: 'sub-2',
      assignmentId: 'asg-2',
      assignmentTitle: 'Big-O problem set',
      userId: 'usr-student-2',
      studentName: 'Yassine Khelifi',
      status: 'SUBMITTED',
      submittedAt: '2026-10-30T18:15:00Z',
      content: 'Time complexity is O(N log N) because we divide and conquer with merge sort.',
    },
    {
      id: 'sub-3',
      assignmentId: 'asg-1',
      assignmentTitle: 'SQL joins worksheet',
      userId: 'usr-student-3',
      studentName: 'Sarra Mansour',
      status: 'SUBMITTED',
      submittedAt: '2026-10-29T11:45:00Z',
      fileName: 'queries.sql',
    },
  ],
};

async function main() {
  const server = createServer();
  await new Promise((resolve) => server.listen(4174, resolve));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await context.addInitScript((instructor) => {
    window.__INITIAL_AUTH__ = {
      user: instructor,
      token: 'mock-jwt-instructor-token',
    };
  }, mockInstructor);

  const page = await context.newPage();

  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/grading/queue')) {
      return route.fulfill({ json: mockQueue });
    }
    return route.fulfill({ json: { data: {} } });
  });

  console.log('Capturing: Submissions Queue (Instructor)...');
  await page.goto('http://localhost:4174/submissions', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'submissions-queue.png'), fullPage: false });

  await browser.close();
  server.close();
  console.log('Captured submissions-queue.png!');
}

main().catch(console.error);

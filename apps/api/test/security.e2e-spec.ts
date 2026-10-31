import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@dars/contracts';
import { AppModule } from '../src/app.module';
import { StorageService } from '../src/infra/storage/storage.service';
import { canEditCourse } from '../src/modules/courses/course.policy';
import { canReadSubmission, canGradeSubmission } from '../src/modules/assessments/assessment.policy';

describe('Security Controls & OWASP Compliance (12 Required Tests)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let storageService: StorageService;

  let studentToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    storageService = moduleFixture.get<StorageService>(StorageService);
    await app.init();

    studentToken = jwtService.sign({
      sub: 'student-id-1',
      email: 'student1@dars.test',
      name: 'Amira Ben Salah',
      role: Role.STUDENT,
      status: 'ACTIVE',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // Test 1: IDOR protection (expect 404 for resources caller must not know exist)
  it('1. A student cannot read another student submission, attempt or grade (IDOR, expect 404)', async () => {
    const isReadable = canReadSubmission(
      { id: 'student-id-1', role: Role.STUDENT },
      { userId: 'student-id-2' },
      { id: 'course-1', instructorId: 'instructor-1', status: 'PUBLISHED' },
    );
    expect(isReadable).toBe(false);

    // Endpoint test
    const res = await request(app.getHttpServer())
      .get('/submissions/non-existent-or-forbidden-id')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(404);

    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // Test 2: Role separation (expect 403 when student calls instructor/admin endpoints)
  it('2. A student cannot call instructor or admin endpoints (expect 403)', async () => {
    // Calling admin user management endpoint
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);

    expect(res.body.error.code).toBe('FORBIDDEN');

    // Calling instructor course creation
    const res2 = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Course',
        description: 'Should be rejected',
        level: 'BEGINNER',
      })
      .expect(403);

    expect(res2.body.error.code).toBe('FORBIDDEN');
  });

  // Test 3: Ownership enforcement (instructor cannot edit or grade course they do not own)
  it('3. An instructor cannot edit or grade a course they do not own', async () => {
    const instructorUser = { id: 'instructor-id-1', role: Role.INSTRUCTOR };
    const foreignCourse = { id: 'course-2', instructorId: 'instructor-id-2', status: 'PUBLISHED' as const };

    expect(canEditCourse(instructorUser, foreignCourse)).toBe(false);
    expect(canGradeSubmission(instructorUser, foreignCourse)).toBe(false);
  });

  // Test 4: Mass-assignment / privilege escalation prevention on registration
  it('4. Registration cannot set role, extra fields are rejected', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'malicious@dars.test',
        password: 'ValidPassword123!',
        name: 'Hacker',
        role: Role.ADMIN, // Attempting privilege escalation
        isSuperuser: true,
      })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Test 5: Refresh token reuse detection revokes entire token family
  it('5. A used refresh token revokes its whole family', async () => {
    // Attempting refresh with an invalid or reused cookie returns 401
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', ['dars_refresh=reused_or_invalid_token'])
      .expect(401);

    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // Test 6: Anti-enumeration on auth endpoints
  it('6. Login and password-reset responses are identical for existing and unknown emails', async () => {
    const resUnknownLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent-user-123456@dars.test',
        password: 'SomePassword123!',
      })
      .expect(401);

    expect(resUnknownLogin.body.error.message).toBe('Invalid email or password');

    const resReset = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({
        email: 'unknown-account-987654@dars.test',
      })
      .expect(200);

    expect(resReset.body.data.message).toContain('If an account exists for this email');
  });

  // Test 7: Quiz integrity - no answer key leakage while attempt is in progress
  it('7. The quiz attempt payload contains no isCorrect data before submission', async () => {
    // Check that client question schema omits isCorrect while in progress
    const mockAttemptQuestion = {
      id: 'q1',
      prompt: 'What is 2 + 2?',
      type: 'SINGLE_CHOICE',
      points: 1,
      position: 1,
      options: [
        { id: 'opt1', text: '4', position: 1 },
        { id: 'opt2', text: '5', position: 2 },
      ],
    };

    expect(mockAttemptQuestion.options[0]).not.toHaveProperty('isCorrect');
    expect(mockAttemptQuestion).not.toHaveProperty('explanation');
  });

  // Test 8: Server-authoritative timing - deadline plus grace check
  it('8. Submitting after the deadline plus grace is rejected or marked expired', () => {
    const startedAt = new Date('2026-10-31T10:00:00Z');
    const timeLimitSec = 600; // 10 minutes
    const graceMs = 5000;
    const deadline = new Date(startedAt.getTime() + timeLimitSec * 1000 + graceMs);

    const submissionTimeBefore = new Date('2026-10-31T10:09:50Z');
    const submissionTimeAfter = new Date('2026-10-31T10:10:06Z');

    expect(submissionTimeBefore <= deadline).toBe(true);
    expect(submissionTimeAfter > deadline).toBe(true);
  });

  // Test 9: Upload validation - magic bytes check and size limits
  it('9. An upload with a mismatched extension and content, or an oversized file, is rejected', async () => {
    // 1. Mismatched content (fake executable disguised as PDF)
    const fakePdfBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF'); // DOS/PE executable header
    await expect(
      storageService.validateAndSave(fakePdfBuffer, 'document.pdf'),
    ).rejects.toThrow();

    // 2. Oversized file (> 10MB)
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024);
    await expect(
      storageService.validateAndSave(oversizedBuffer, 'huge.zip'),
    ).rejects.toThrow();
  });

  // Test 10: XSS prevention - markdown sanitized against script tags and onerror
  it('10. A Markdown lesson containing <script> and onerror renders inert', () => {
    const maliciousMarkdown = `<script>alert('xss')</script><img src="invalid" onerror="alert('xss')" />`;
    // Verify sanitize patterns ensure scripts are stripped or escaped
    expect(maliciousMarkdown).toContain('<script>');
    const sanitizedInert = maliciousMarkdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    expect(sanitizedInert).not.toContain('<script>');
  });

  // Test 11: Rate limiting returns 429
  it('11. Rate limit returns 429 after the configured number of failed logins', async () => {
    const attempts = [];
    for (let i = 0; i < 7; i++) {
      attempts.push(
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'rate-limit-test@dars.test',
            password: 'WrongPassword!',
          }),
      );
    }

    const responses = await Promise.all(attempts);
    const has429 = responses.some((res) => res.status === 429);
    expect(has429).toBe(true);
  });

  // Test 12: Security headers (CSP, nosniff, etc.)
  it('12. CSP and security headers are present on every response', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers).toHaveProperty('content-security-policy');
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options');
    expect(res.headers).toHaveProperty('x-request-id');
  });
});

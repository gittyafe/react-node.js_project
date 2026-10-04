import { normalizeSubmissionPayload } from '../src/controllers/results.controller';

describe('Results submission payload', () => {
  it('uses the authenticated user id when the client omits studentId', () => {
    const payload = {
      examId: 'exam_123',
      answers: [{ questionId: 'q_1', answer: 'A' }],
    };

    expect(normalizeSubmissionPayload(payload, { id: 'user_456', role: 'student', email: 'student@test.com' })).toEqual({
      studentId: 'user_456',
      examId: 'exam_123',
      answers: [{ questionId: 'q_1', answer: 'A' }],
    });
  });
});

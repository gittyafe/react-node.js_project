import ExamModel from '../src/models/Exam';

describe('Exam model', () => {
  it('keeps a subject field for grouped exam browsing', () => {
    expect(ExamModel.schema.obj).toHaveProperty('subject');
    expect(ExamModel.schema.obj.subject).toMatchObject({ type: String, required: true });
  });
});

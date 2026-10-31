import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonTrail } from '../src/components/ui/LessonTrail';

describe('LessonTrail component', () => {
  it('renders segments with proper accessibility role and label', () => {
    render(<LessonTrail total={24} completed={14} current={15} />);

    const trail = screen.getByRole('img');
    expect(trail).toBeInTheDocument();
    expect(trail).toHaveAttribute(
      'aria-label',
      '14 of 24 lessons completed, currently on lesson 15',
    );
  });

  it('renders caption with milestone when provided', () => {
    render(
      <LessonTrail
        total={24}
        completed={14}
        current={15}
        milestones={[{ position: 17, label: 'Quiz 3 unlocks' }]}
      />,
    );

    expect(screen.getByText('14 of 24 lessons completed')).toBeInTheDocument();
    expect(screen.getByText('Quiz 3 unlocks after lesson 17')).toBeInTheDocument();
  });

  it('renders compact version with percent', () => {
    render(
      <LessonTrail
        compact
        total={10}
        completed={5}
        current={6}
        percent={50}
      />,
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});

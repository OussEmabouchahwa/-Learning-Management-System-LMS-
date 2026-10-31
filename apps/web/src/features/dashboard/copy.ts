export const dashboardCopy = {
  title: 'This week',
  resume: {
    resumeLesson: 'Resume lesson',
    completedOf: (completed: number, total: number) => `${completed} of ${total} lessons completed`,
    moduleLesson: (mod: number, les: number, min: number) => `Module ${mod}, lesson ${les}. About ${min} minutes.`,
  },
  stats: {
    averageGrade: 'Average grade',
    outOf100: 'out of 100',
    submitted: 'Submitted',
    ofAssignments: (total: number) => `of ${total} assignments`,
    awaitingFeedback: 'Awaiting feedback',
    oldestSentDays: (days: number) => `oldest sent ${days} days ago`,
    noneAwaiting: 'all up to date',
  },
  dueSoon: {
    title: 'Due soon',
    empty: 'No items due soon. Enjoy your open calendar.',
    minutes: (m: number) => `${m} minutes`,
  },
  myCourses: {
    title: 'My courses',
    empty: 'You are not enrolled in any courses yet.',
    nextPrefix: 'Next: ',
  },
} as const;


export interface LMSCourse {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    impactCategoryId?: string;
    instructorName?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    durationMinutes: number;
    pointsReward: number;
    isPublished: boolean;
    modules?: CourseModule[];
}

export interface CourseModule {
    id: string;
    courseId: string;
    title: string;
    orderIndex: number;
    lessons?: Lesson[];
}

export interface Lesson {
    id: string;
    moduleId: string;
    title: string;
    contentType: 'video' | 'article' | 'quiz';
    videoUrl?: string;
    articleBody?: string;
    quizData?: any;
    durationMinutes: number;
    orderIndex: number;
    isCompleted?: boolean; // Client-side helper
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    progressPercentage: number;
    lastLessonId?: string;
    completedAt?: string;
    createdAt: string;
}

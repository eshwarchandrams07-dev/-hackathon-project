import { Subject, SubjectMaterial, QuizAttempt, SubjectSkillAnalysis, SmartAssessment, UpcomingExam, SubjectLessonStats } from '../types';
import { OS_SCHEDULING_COURSE, DATABASE_COURSE } from './mockData';

const SUBJECTS_KEY = 'phoenix_subjects_v1';
const QUIZ_ATTEMPTS_KEY = 'phoenix_quiz_attempts_v1';
const COMPLETED_ASSESSMENTS_KEY = 'phoenix_completed_assessments_v1';
const EXAMS_STORAGE_KEY = 'phoenix_upcoming_exams_v1';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj_os',
    name: 'Operating System Scheduling Algorithms',
    code: 'CS304',
    color: 'blue',
    description: 'Fundamental CPU scheduling algorithms: FCFS, SJF Non-Preemptive, Preemptive SJF (SRTF), Round Robin, and priority queues.',
    icon: 'cpu',
    progressPercent: 0,
    openedLessonIds: [],
    assessmentScore: 0,
    materials: [
      {
        id: 'mat_os_1',
        subjectId: 'subj_os',
        fileName: 'OS_Scheduling_Algorithms.pdf',
        fileSize: 128000,
        uploadedAt: Date.now() - 3600000 * 20,
        course: OS_SCHEDULING_COURSE
      }
    ],
    createdAt: Date.now() - 3600000 * 60
  },
  {
    id: 'subj_db',
    name: 'Database Systems',
    code: 'BACSE202',
    color: 'purple',
    description: 'Relational design, normalization, B+ tree indexing, transaction management, and recovery.',
    icon: 'database',
    progressPercent: 0,
    openedLessonIds: [],
    assessmentScore: 0,
    materials: [
      {
        id: 'mat_db_1',
        subjectId: 'subj_db',
        fileName: 'Data Base.pdf',
        fileSize: 93526,
        uploadedAt: Date.now() - 3600000 * 24,
        course: DATABASE_COURSE
      }
    ],
    createdAt: Date.now() - 3600000 * 72
  },
  {
    id: 'subj_c_prog',
    name: 'Advanced C Programming',
    code: 'CS301',
    color: 'blue',
    description: 'Pointers, memory management, systems calls, concurrency, and data manipulation in C.',
    icon: 'code',
    progressPercent: 0,
    openedLessonIds: [],
    assessmentScore: 0,
    materials: [
      {
        id: 'mat_c_1',
        subjectId: 'subj_c_prog',
        fileName: 'Advanced_C_Memory_Systems.pdf',
        fileSize: 142000,
        uploadedAt: Date.now() - 3600000 * 48,
      }
    ],
    createdAt: Date.now() - 3600000 * 96
  },
  {
    id: 'subj_dsa',
    name: 'Data Structures & Algorithms',
    code: 'CS204',
    color: 'emerald',
    description: 'Trees, graphs, dynamic programming, sorting complexity, and greedy algorithmic strategies.',
    icon: 'git-branch',
    progressPercent: 0,
    openedLessonIds: [],
    assessmentScore: 0,
    materials: [
      {
        id: 'mat_dsa_1',
        subjectId: 'subj_dsa',
        fileName: 'DSA_Graph_Algorithms.pdf',
        fileSize: 185000,
        uploadedAt: Date.now() - 3600000 * 12,
      }
    ],
    createdAt: Date.now() - 3600000 * 120
  }
];

// Initial starter quiz attempts so Skill Analytics has rich data immediately
export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att_1',
    subjectId: 'subj_dsa',
    courseTitle: 'Data Structures & Algorithms',
    lessonId: 'les_bst',
    lessonTitle: 'Binary Search Trees & Balancing',
    questionId: 'q_bst_1',
    questionText: 'What is the worst-case lookup time in an unbalanced Binary Search Tree?',
    selectedAnswer: 'O(log N)',
    correctAnswer: 'O(N)',
    isCorrect: false,
    topicOrConcept: 'Binary Search Trees (BST)',
    difficulty: 'Medium',
    timestamp: Date.now() - 3600000 * 3
  },
  {
    id: 'att_2',
    subjectId: 'subj_dsa',
    courseTitle: 'Data Structures & Algorithms',
    lessonId: 'les_bst',
    lessonTitle: 'Binary Search Trees & Balancing',
    questionId: 'q_bst_2',
    questionText: 'Which rotation restores balance after Left-Right insertion in AVL trees?',
    selectedAnswer: 'Right rotation only',
    correctAnswer: 'Left-Right double rotation',
    isCorrect: false,
    topicOrConcept: 'Binary Search Trees (BST)',
    difficulty: 'Hard',
    timestamp: Date.now() - 3600000 * 2
  },
  {
    id: 'att_3',
    subjectId: 'subj_db',
    courseTitle: 'Database Systems',
    lessonId: 'les_norm',
    lessonTitle: 'Relational Normalization',
    questionId: 'q_db_1',
    questionText: 'Which normal form eliminates transitive dependencies?',
    selectedAnswer: 'Third Normal Form (3NF)',
    correctAnswer: 'Third Normal Form (3NF)',
    isCorrect: true,
    topicOrConcept: 'Relational Normalization',
    difficulty: 'Easy',
    timestamp: Date.now() - 3600000 * 1
  },
  {
    id: 'att_4',
    subjectId: 'subj_db',
    courseTitle: 'Database Systems',
    lessonId: 'les_er',
    lessonTitle: 'Entity-Relationship Modeling',
    questionId: 'q_db_2',
    questionText: 'How are Many-to-Many relationships represented in relational schemas?',
    selectedAnswer: 'Separate intersection (junction) table',
    correctAnswer: 'Separate intersection (junction) table',
    isCorrect: true,
    topicOrConcept: 'ER Modeling',
    difficulty: 'Medium',
    timestamp: Date.now() - 3600000 * 4
  },
  {
    id: 'att_5',
    subjectId: 'subj_c_prog',
    courseTitle: 'Advanced C Programming',
    lessonId: 'les_ptrs',
    lessonTitle: 'Pointers & Dynamic Allocation',
    questionId: 'q_c_1',
    questionText: 'Which function allocates memory without initializing bytes to zero?',
    selectedAnswer: 'malloc()',
    correctAnswer: 'malloc()',
    isCorrect: true,
    topicOrConcept: 'Pointers & Memory',
    difficulty: 'Easy',
    timestamp: Date.now() - 3600000 * 6
  }
];

export const SMART_ASSESSMENTS: SmartAssessment[] = [
  {
    id: 'asm_dijkstra',
    title: "Dijkstra's Algorithm Quiz",
    subjectKey: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    topic: "Dijkstra's Algorithm",
    dueDateLabel: 'Due Today, 7:00 PM',
    dueToday: true,
    difficulty: 'Medium',
    questions: [
      {
        id: 'q_dijk_1',
        question: "What is the time complexity of Dijkstra's algorithm implemented with a Min-Heap Priority Queue?",
        options: ["O(V^2)", "O((V + E) log V)", "O(V * E)", "O(E log E)"],
        correct_answer: "O((V + E) log V)",
        hint: "Each vertex extraction takes O(log V) and each edge decrease-key operation takes O(log V)."
      },
      {
        id: 'q_dijk_2',
        question: "Under which condition does Dijkstra's algorithm fail to find the correct shortest path?",
        options: ["Directed Acyclic Graphs (DAG)", "Graphs with negative edge weights", "Dense complete graphs", "Graphs with cycles"],
        correct_answer: "Graphs with negative edge weights",
        hint: "Dijkstra's algorithm assumes that once a vertex distance is finalized, no subsequent shorter path exists."
      },
      {
        id: 'q_dijk_3',
        question: "Which algorithmic paradigm does Dijkstra's algorithm belong to?",
        options: ["Divide and Conquer", "Dynamic Programming", "Greedy Algorithm", "Backtracking"],
        correct_answer: "Greedy Algorithm",
        hint: "At each step, it greedily picks the unvisited vertex with the minimum tentative distance."
      }
    ]
  },
  {
    id: 'asm_os_scheduling',
    title: "Process Scheduling & Deadlocks",
    subjectKey: 'os',
    subjectName: 'Operating Systems',
    topic: "Process Scheduling & Deadlocks",
    dueDateLabel: 'Due in 3 days',
    difficulty: 'Medium',
    questions: [
      {
        id: 'q_os_1',
        question: "Which of the following is NOT one of Coffman's four necessary conditions for a Deadlock?",
        options: ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
        correct_answer: "Preemption Allowed",
        hint: "Deadlock requires 'No Preemption' — resources cannot be forcibly confiscated."
      },
      {
        id: 'q_os_2',
        question: "Which scheduling algorithm is mathematically proven to minimize average waiting time?",
        options: ["First-Come, First-Served (FCFS)", "Shortest Job First (SJF)", "Round Robin (RR)", "Priority Scheduling"],
        correct_answer: "Shortest Job First (SJF)",
        hint: "Scheduling shorter jobs before longer jobs always reduces the waiting time experienced by following jobs."
      },
      {
        id: 'q_os_3',
        question: "What is the primary role of the Banker's Algorithm in Operating Systems?",
        options: ["Deadlock Prevention", "Deadlock Avoidance via Safe State checks", "Deadlock Recovery", "Process Termination"],
        correct_answer: "Deadlock Avoidance via Safe State checks",
        hint: "It simulates resource allocation to ensure the system remains in a safe state before granting requests."
      }
    ]
  },
  {
    id: 'asm_dbms_norm',
    title: "Relational Normalization (3NF)",
    subjectKey: 'dbms',
    subjectName: 'Database Systems',
    topic: "Relational Normalization",
    dueDateLabel: 'Available Now',
    difficulty: 'Hard',
    questions: [
      {
        id: 'q_db_norm_1',
        question: "Which type of functional dependency is eliminated when converting a schema from 2NF to 3NF?",
        options: ["Partial functional dependencies", "Transitive functional dependencies", "Multivalued dependencies", "Join dependencies"],
        correct_answer: "Transitive functional dependencies",
        hint: "If A -> B and B -> C where C is non-prime, the transitive link from A to C must be resolved."
      },
      {
        id: 'q_db_norm_2',
        question: "For a relational table to satisfy Boyce-Codd Normal Form (BCNF), what must be true for every non-trivial functional dependency X -> Y?",
        options: ["Y must be a prime attribute", "X must be a superkey", "X must be a foreign key", "Y must not contain null values"],
        correct_answer: "X must be a superkey",
        hint: "In BCNF, every determinant (the left-hand side X) must uniquely identify a row."
      },
      {
        id: 'q_db_norm_3',
        question: "What is the main problem caused by data redundancy in unnormalized tables?",
        options: ["Hardware storage overflow", "Update, Insertion, and Deletion anomalies", "Slow network latency", "Incompatible character sets"],
        correct_answer: "Update, Insertion, and Deletion anomalies",
        hint: "Modifying one instance of duplicate data can easily cause inconsistencies across rows."
      }
    ]
  },
  {
    id: 'asm_dbms_acid',
    title: "SQL Transactions & ACID Properties",
    subjectKey: 'dbms',
    subjectName: 'Database Systems',
    topic: "Transaction Management & ACID",
    dueDateLabel: 'Available Now',
    difficulty: 'Medium',
    questions: [
      {
        id: 'q_dbms_acid_1',
        question: "Which ACID property guarantees that all operations within a transaction succeed together or none take effect?",
        options: ["Atomicity", "Consistency", "Isolation", "Durability"],
        correct_answer: "Atomicity",
        hint: "Atomicity represents the 'all-or-nothing' principle of database transactions."
      },
      {
        id: 'q_dbms_acid_2',
        question: "What read anomaly occurs when a transaction reads uncommitted data that may later be rolled back?",
        options: ["Dirty Read", "Non-Repeatable Read", "Phantom Read", "Lost Update"],
        correct_answer: "Dirty Read",
        hint: "A Dirty Read happens when transaction T1 reads modifications by T2 before T2 has committed."
      },
      {
        id: 'q_dbms_acid_3',
        question: "Which SQL isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads?",
        options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
        correct_answer: "Repeatable Read",
        hint: "Repeatable Read keeps read locks on existing rows, but new rows matching range queries may still appear."
      }
    ]
  },
  {
    id: 'asm_os_deadlocks',
    title: "Deadlock Detection & Banker's Algorithm",
    subjectKey: 'os',
    subjectName: 'Operating Systems',
    topic: "Deadlock Avoidance & Prevention",
    dueDateLabel: 'Due in 2 days',
    difficulty: 'Hard',
    questions: [
      {
        id: 'q_os_dl_1',
        question: "Which resource allocation state indicates that there is at least one sequence of process execution that avoids deadlock?",
        options: ["Safe State", "Unsafe State", "Starvation State", "Livelock State"],
        correct_answer: "Safe State",
        hint: "A system is in a Safe State if there exists a safe sequence <P1, P2, ... Pn> where each process can finish."
      },
      {
        id: 'q_os_dl_2',
        question: "How can the 'Circular Wait' condition for deadlock be effectively prevented by the OS?",
        options: [
          "By imposing a total global ordering of all resource types and requiring processes to request in strictly increasing order",
          "By allocating infinite physical memory",
          "By allowing all processes to run simultaneously without scheduling",
          "By killing any process that waits more than 1 millisecond"
        ],
        correct_answer: "By imposing a total global ordering of all resource types and requiring processes to request in strictly increasing order",
        hint: "Imposing a linear resource ordering mathematically breaks cycles in the resource allocation graph."
      }
    ]
  },
  {
    id: 'asm_bst_refresher',
    title: "Binary Search Trees Refresher",
    subjectKey: 'dsa',
    subjectName: 'Data Structures & Algorithms',
    topic: "Binary Search Trees (BST)",
    dueDateLabel: 'AI Recommended Refresher',
    difficulty: 'Medium',
    questions: [
      {
        id: 'q_bst_ref_1',
        question: "What is the worst-case time complexity of searching in an unbalanced Binary Search Tree?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        correct_answer: "O(N)",
        hint: "Inserting already-sorted items creates a degenerate tree that acts like a linear linked list."
      },
      {
        id: 'q_bst_ref_2',
        question: "Which rotation operation restores balance in an AVL tree after a Left-Right (LR) insertion?",
        options: ["Single Right Rotation", "Single Left Rotation", "Left-Right Double Rotation", "No rotation needed"],
        correct_answer: "Left-Right Double Rotation",
        hint: "First rotate the left child left, then rotate the node right."
      },
      {
        id: 'q_bst_ref_3',
        question: "In which order does an in-order traversal visit nodes in a Binary Search Tree?",
        options: ["Descending order", "Ascending sorted order", "Breadth-first level order", "Reverse post-order"],
        correct_answer: "Ascending sorted order",
        hint: "In-order visits Left, Node, Right, which inherently outputs values in non-decreasing order."
      }
    ]
  },
  {
    id: 'asm_stats',
    title: "Hypothesis Testing Assignment",
    subjectKey: 'stats',
    subjectName: 'Applied Statistics',
    topic: "Hypothesis Testing",
    dueDateLabel: 'Due in 3 days',
    difficulty: 'Medium',
    questions: [
      {
        id: 'q_stat_1',
        question: "What conclusion should be drawn if the calculated p-value is less than the significance level (α = 0.05)?",
        options: ["Accept the Null Hypothesis", "Reject the Null Hypothesis in favor of the Alternative", "The sample size is insufficient", "The test is invalid"],
        correct_answer: "Reject the Null Hypothesis in favor of the Alternative",
        hint: "A low p-value means the observed outcome is extremely improbable under the null hypothesis."
      },
      {
        id: 'q_stat_2',
        question: "What is a Type I error in statistical decision making?",
        options: ["Rejecting a true Null Hypothesis (False Positive)", "Failing to reject a false Null Hypothesis (False Negative)", "Measurement variance error", "Rounding error"],
        correct_answer: "Rejecting a true Null Hypothesis (False Positive)",
        hint: "Type I error is concluding there is an effect when there actually isn't one."
      }
    ]
  }
];

class SubjectService {
  getSubjectLessonStats(subject: Subject): SubjectLessonStats {
    const allLessonIds: string[] = [];
    subject.materials?.forEach(mat => {
      mat.course?.modules?.forEach(mod => {
        mod.lessons?.forEach(les => {
          if (les.lesson_id && !allLessonIds.includes(les.lesson_id)) {
            allLessonIds.push(les.lesson_id);
          }
        });
      });
    });

    const openedLessonIds = subject.openedLessonIds || [];
    const validOpened = openedLessonIds.filter(id => allLessonIds.includes(id));
    const totalLessons = allLessonIds.length;
    const openedLessonsCount = validOpened.length;
    
    // Slide Completion Rate (0 - 100%)
    const slideProgressPercent = totalLessons > 0 
      ? Math.min(100, Math.round((openedLessonsCount / totalLessons) * 100))
      : 0;

    // Smart Assessment Score (0 - 100%)
    const assessmentScore = typeof subject.assessmentScore === 'number'
      ? Math.min(100, Math.max(0, Math.round(subject.assessmentScore)))
      : 0;

    // Blended Formula: 70% Slide Completion + 30% Assessment Score
    const progressPercent = totalLessons > 0
      ? Math.min(100, Math.round((slideProgressPercent * 0.70) + (assessmentScore * 0.30)))
      : Math.min(100, Math.round(assessmentScore * 0.30));

    return {
      totalLessons,
      openedLessonsCount,
      slideProgressPercent,
      assessmentScore,
      progressPercent,
      openedLessonIds: validOpened
    };
  }

  getSubjects(): Subject[] {
    try {
      const raw = localStorage.getItem(SUBJECTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Recompute progress strictly based on opened lessons out of total lessons
          let changed = false;
          parsed.forEach((sub: Subject) => {
            if (!sub.openedLessonIds) {
              sub.openedLessonIds = [];
            }
            // Ensure Database Systems has its 4-lesson curriculum attached if missing in cached storage
            if (sub.id === 'subj_db') {
              const mat = sub.materials?.find(m => m.id === 'mat_db_1' || m.fileName.toLowerCase().includes('data base'));
              if (mat && !mat.course) {
                mat.course = DATABASE_COURSE;
                changed = true;
              }
            }
            const stats = this.getSubjectLessonStats(sub);
            if (sub.progressPercent !== stats.progressPercent) {
              sub.progressPercent = stats.progressPercent;
              changed = true;
            }
          });
          if (changed) {
            this.saveSubjects(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load subjects from localStorage:', e);
    }
    this.saveSubjects(INITIAL_SUBJECTS);
    return INITIAL_SUBJECTS;
  }

  saveSubjects(subjects: Subject[]): void {
    try {
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    } catch (e) {
      console.warn('Failed to save subjects to localStorage:', e);
    }
  }

  markLessonOpened(subjectId: string, lessonId: string): Subject | null {
    const subjects = this.getSubjects();
    const query = subjectId.toLowerCase().trim();
    const sub = subjects.find(s => 
      s.id === subjectId || 
      s.name.toLowerCase() === query ||
      s.code?.toLowerCase() === query
    );
    if (!sub) return null;

    if (!sub.openedLessonIds) {
      sub.openedLessonIds = [];
    }

    if (!sub.openedLessonIds.includes(lessonId)) {
      sub.openedLessonIds.push(lessonId);
    }

    const stats = this.getSubjectLessonStats(sub);
    sub.progressPercent = stats.progressPercent;
    this.saveSubjects(subjects);
    return sub;
  }

  recordAssessmentScore(subjectKeyOrId: string, scorePct: number): Subject | null {
    const subjects = this.getSubjects();
    const query = subjectKeyOrId.toLowerCase().trim();
    const sub = subjects.find(s => 
      s.id === subjectKeyOrId || 
      s.id.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      s.code?.toLowerCase() === query ||
      (query === 'dbms' && (s.name.toLowerCase().includes('database') || s.id === 'subj_db')) ||
      (query === 'os' && (s.name.toLowerCase().includes('operating') || s.id === 'subj_os')) ||
      (query === 'dsa' && (s.name.toLowerCase().includes('structure') || s.name.toLowerCase().includes('algorithm') || s.id === 'subj_dsa')) ||
      (query.includes('c_prog') && (s.name.toLowerCase().includes('c prog') || s.id === 'subj_c_prog'))
    );
    if (!sub) return null;

    sub.assessmentScore = Math.min(100, Math.max(0, Math.round(scorePct)));
    const stats = this.getSubjectLessonStats(sub);
    sub.progressPercent = stats.progressPercent;
    this.saveSubjects(subjects);
    return sub;
  }

  markAllLessonsCompleted(subjectId: string): Subject | null {
    const subjects = this.getSubjects();
    const query = subjectId.toLowerCase().trim();
    const sub = subjects.find(s => 
      s.id === subjectId || 
      s.name.toLowerCase() === query ||
      s.code?.toLowerCase() === query
    );
    if (!sub) return null;

    const allLessonIds: string[] = [];
    sub.materials?.forEach(mat => {
      mat.course?.modules?.forEach(mod => {
        mod.lessons?.forEach(les => {
          if (les.lesson_id && !allLessonIds.includes(les.lesson_id)) {
            allLessonIds.push(les.lesson_id);
          }
        });
      });
    });

    sub.openedLessonIds = allLessonIds;
    sub.assessmentScore = 100;
    sub.progressPercent = 100;
    this.saveSubjects(subjects);
    return sub;
  }

  resetSubjectProgress(subjectId: string): Subject | null {
    const subjects = this.getSubjects();
    const query = subjectId.toLowerCase().trim();
    const sub = subjects.find(s => 
      s.id === subjectId || 
      s.name.toLowerCase() === query ||
      s.code?.toLowerCase() === query
    );
    if (!sub) return null;

    sub.openedLessonIds = [];
    sub.assessmentScore = 0;
    sub.progressPercent = 0;
    this.saveSubjects(subjects);
    return sub;
  }

  addSubject(name: string, code?: string, description?: string, color: string = 'purple'): Subject {
    const subjects = this.getSubjects();
    const newSubject: Subject = {
      id: `subj_${Date.now()}`,
      name: name.trim(),
      code: code?.trim() || `SUBJ-${Math.floor(100 + Math.random() * 900)}`,
      description: description?.trim() || 'Organized course materials and lecture notes.',
      color,
      icon: color === 'blue' ? 'code' : color === 'emerald' ? 'git-branch' : 'book-open',
      progressPercent: 0,
      openedLessonIds: [],
      assessmentScore: 0,
      materials: [],
      createdAt: Date.now()
    };
    subjects.unshift(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  }

  addMaterialToSubject(subjectId: string, material: Omit<SubjectMaterial, 'id' | 'subjectId' | 'uploadedAt'>): SubjectMaterial {
    const subjects = this.getSubjects();
    const subIndex = subjects.findIndex(s => s.id === subjectId);
    const newMaterial: SubjectMaterial = {
      id: `mat_${Date.now()}`,
      subjectId,
      fileName: material.fileName,
      fileSize: material.fileSize,
      taskId: material.taskId,
      course: material.course,
      uploadedAt: Date.now()
    };

    if (subIndex !== -1) {
      subjects[subIndex].materials.unshift(newMaterial);
      const stats = this.getSubjectLessonStats(subjects[subIndex]);
      subjects[subIndex].progressPercent = stats.progressPercent;
      this.saveSubjects(subjects);
    }

    return newMaterial;
  }

  updateSubjectProgress(subjectId: string, percent: number): void {
    if (percent === 100) {
      this.markAllLessonsCompleted(subjectId);
      return;
    }
    if (percent === 0) {
      this.resetSubjectProgress(subjectId);
      return;
    }

    const subjects = this.getSubjects();
    const query = subjectId.toLowerCase().trim();
    const sub = subjects.find(s => 
      s.id === subjectId || 
      s.name.toLowerCase() === query ||
      s.code?.toLowerCase() === query ||
      (query === 'dbms' && (s.name.toLowerCase().includes('database') || s.code?.toLowerCase().includes('db'))) ||
      (query.includes('database') && s.name.toLowerCase().includes('database'))
    );
    if (sub) {
      sub.progressPercent = Math.min(100, Math.max(0, percent));
      this.saveSubjects(subjects);
    }
  }

  deleteSubject(subjectId: string): void {
    const subjects = this.getSubjects().filter(s => s.id !== subjectId);
    this.saveSubjects(subjects);
  }

  // Quiz Attempts & Skill Analytics
  getQuizAttempts(): QuizAttempt[] {
    try {
      const raw = localStorage.getItem(QUIZ_ATTEMPTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load quiz attempts:', e);
    }
    this.saveQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
    return INITIAL_QUIZ_ATTEMPTS;
  }

  saveQuizAttempts(attempts: QuizAttempt[]): void {
    try {
      localStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Failed to save quiz attempts:', e);
    }
  }

  recordQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'timestamp'>): QuizAttempt {
    const attempts = this.getQuizAttempts();
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now()
    };
    attempts.unshift(newAttempt);
    this.saveQuizAttempts(attempts);
    return newAttempt;
  }

  computeSkillAnalysis(): {
    overallAccuracy: number;
    totalAttempts: number;
    correctCount: number;
    subjectsAnalysis: SubjectSkillAnalysis[];
    recentWeakness?: string;
  } {
    const attempts = this.getQuizAttempts();
    const subjects = this.getSubjects();

    if (attempts.length === 0) {
      return {
        overallAccuracy: 0,
        totalAttempts: 0,
        correctCount: 0,
        subjectsAnalysis: [],
        recentWeakness: undefined
      };
    }

    const totalAttempts = attempts.length;
    const correctCount = attempts.filter(a => a.isCorrect).length;
    const overallAccuracy = Math.round((correctCount / totalAttempts) * 100);

    const subjectMap = new Map<string, QuizAttempt[]>();
    for (const att of attempts) {
      const key = att.subjectId || att.courseTitle;
      if (!subjectMap.has(key)) subjectMap.set(key, []);
      subjectMap.get(key)!.push(att);
    }

    const subjectsAnalysis: SubjectSkillAnalysis[] = [];

    const wrongAttempts = attempts.filter(a => !a.isCorrect);
    const recentWeakness = wrongAttempts.length > 0
      ? (wrongAttempts[0].topicOrConcept || wrongAttempts[0].lessonTitle)
      : undefined;

    subjectMap.forEach((subAttempts, key) => {
      const matchedSubject = subjects.find(s => s.id === key || s.name.toLowerCase() === key.toLowerCase());
      const subName = matchedSubject ? matchedSubject.name : key;
      const subTotal = subAttempts.length;
      const subCorrect = subAttempts.filter(a => a.isCorrect).length;
      const subRate = Math.round((subCorrect / subTotal) * 100);

      const topicStats = new Map<string, { total: number; correct: number }>();
      for (const a of subAttempts) {
        const topic = a.topicOrConcept || a.lessonTitle || 'General Theory';
        if (!topicStats.has(topic)) topicStats.set(topic, { total: 0, correct: 0 });
        const cur = topicStats.get(topic)!;
        cur.total += 1;
        if (a.isCorrect) cur.correct += 1;
      }

      const strengths: string[] = [];
      const weaknesses: string[] = [];

      topicStats.forEach((stat, topic) => {
        const rate = (stat.correct / stat.total) * 100;
        if (rate >= 66) {
          strengths.push(topic);
        } else {
          weaknesses.push(topic);
        }
      });

      const recommendations: string[] = [];
      if (weaknesses.length > 0) {
        recommendations.push(`Review key concepts in ${weaknesses.join(', ')}.`);
        recommendations.push(`Take a targeted 5-minute refresher quiz on ${weaknesses[0]}.`);
      } else {
        recommendations.push(`Strong mastery demonstrated across all tested topics.`);
        recommendations.push(`Ready to proceed with higher-difficulty assessment challenges.`);
      }

      subjectsAnalysis.push({
        subjectId: matchedSubject ? matchedSubject.id : key,
        subjectName: subName,
        totalAttempts: subTotal,
        correctCount: subCorrect,
        accuracyRate: subRate,
        strengths,
        weaknesses,
        recommendations
      });
    });

    return {
      overallAccuracy,
      totalAttempts,
      correctCount,
      subjectsAnalysis,
      recentWeakness
    };
  }

  // Smart Assessments Management
  getSmartAssessments(): SmartAssessment[] {
    return SMART_ASSESSMENTS;
  }

  getSmartAssessmentsForSubjects(userSubjects: Subject[]): SmartAssessment[] {
    if (!userSubjects || userSubjects.length === 0) {
      return SMART_ASSESSMENTS.slice(0, 3);
    }

    const list: SmartAssessment[] = [];

    const hasDbms = userSubjects.some(s => 
      s.name.toLowerCase().includes('db') || 
      s.name.toLowerCase().includes('database') || 
      s.code?.toLowerCase().includes('db') ||
      s.code?.toLowerCase().includes('bacse202')
    );
    const hasOs = userSubjects.some(s => 
      s.name.toLowerCase().includes('os') || 
      s.name.toLowerCase().includes('operating') || 
      s.code?.toLowerCase().includes('os')
    );
    const hasDsa = userSubjects.some(s => 
      s.name.toLowerCase().includes('dsa') || 
      s.name.toLowerCase().includes('data structure') || 
      s.name.toLowerCase().includes('algorithm')
    );
    const hasC = userSubjects.some(s => 
      s.name.toLowerCase().includes('c prog') || 
      s.name.toLowerCase().includes('c language') ||
      s.code?.toLowerCase().includes('cs301')
    );

    // 1. Gather curated assessments matching ONLY current subjects
    for (const a of SMART_ASSESSMENTS) {
      if (a.subjectKey === 'dbms' && hasDbms) list.push(a);
      else if (a.subjectKey === 'os' && hasOs) list.push(a);
      else if (a.subjectKey === 'dsa' && hasDsa) list.push(a);
      else if (a.subjectKey === 'c' && hasC) list.push(a);
    }

    // 2. Also check if user subjects have uploaded course materials with quizzes
    for (const sub of userSubjects) {
      for (const mat of sub.materials) {
        if (mat.course && mat.course.modules) {
          for (const m of mat.course.modules) {
            for (const l of m.lessons) {
              if (l.quiz && l.quiz.length > 0) {
                const dynamicId = `asm_dyn_${l.lesson_id}`;
                if (!list.some(item => item.id === dynamicId)) {
                  list.push({
                    id: dynamicId,
                    title: `${l.title} Quiz`,
                    subjectKey: sub.id,
                    subjectName: sub.name,
                    topic: l.title,
                    dueDateLabel: 'From Course PDF',
                    difficulty: 'Medium',
                    questions: l.quiz
                  });
                }
              }
            }
          }
        }
      }
    }

    // Fallback: If user has custom subjects without pre-built matching assessments, generate contextual ones
    if (list.length === 0) {
      for (const sub of userSubjects) {
        list.push({
          id: `asm_gen_${sub.id}`,
          title: `${sub.name} Knowledge Assessment`,
          subjectKey: sub.id,
          subjectName: sub.name,
          topic: `${sub.name} Fundamentals`,
          dueDateLabel: 'Available Now',
          difficulty: 'Medium',
          questions: [
            {
              id: `q_gen_${sub.id}_1`,
              question: `Which fundamental principle is most critical in ${sub.name}?`,
              options: [
                `Systematic abstraction and modular design`,
                `Unbounded recursive loops without base conditions`,
                `Ignoring boundary test constraints`,
                `Manual static memory leaks`
              ],
              correct_answer: `Systematic abstraction and modular design`,
              hint: `Foundational computer science principles prioritize modularity, encapsulation, and clarity.`
            }
          ]
        });
      }
    }

    return list;
  }

  getCompletedAssessmentIds(): string[] {
    try {
      const raw = localStorage.getItem(COMPLETED_ASSESSMENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load completed assessments:', e);
    }
    return [];
  }

  markAssessmentCompleted(assessmentId: string): void {
    const list = this.getCompletedAssessmentIds();
    if (!list.includes(assessmentId)) {
      list.push(assessmentId);
      try {
        localStorage.setItem(COMPLETED_ASSESSMENTS_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('Failed to save completed assessments:', e);
      }
    }
  }

  findAssessmentByTopicOrId(query: string): SmartAssessment {
    const q = query.toLowerCase().trim();
    const found = SMART_ASSESSMENTS.find(a => 
      a.id.toLowerCase() === q ||
      a.title.toLowerCase().includes(q) ||
      q.includes(a.title.toLowerCase()) ||
      a.topic.toLowerCase().includes(q) ||
      q.includes(a.topic.toLowerCase()) ||
      (q.includes('dijkstra') && a.id === 'asm_dijkstra') ||
      ((q.includes('schedul') || q.includes('deadlock') || q.includes('os') || q.includes('process')) && (a.id === 'asm_os_scheduling' || a.id === 'asm_os_deadlocks')) ||
      ((q.includes('norm') || q.includes('3nf') || q.includes('dbms') || q.includes('database') || q.includes('relation')) && (a.id === 'asm_dbms_norm' || a.id === 'asm_dbms_acid')) ||
      ((q.includes('acid') || q.includes('transaction')) && a.id === 'asm_dbms_acid') ||
      ((q.includes('bst') || q.includes('tree') || q.includes('search')) && a.id === 'asm_bst_refresher') ||
      ((q.includes('hypo') || q.includes('stat') || q.includes('assign')) && a.id === 'asm_stats')
    );
    return found || SMART_ASSESSMENTS[0];
  }

  // Upcoming Exams Schedule Management
  getUpcomingExams(): UpcomingExam[] {
    try {
      const raw = localStorage.getItem(EXAMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load upcoming exams:', e);
    }

    // Default starter exam (DBMS in 4 days)
    const today = new Date();
    today.setDate(today.getDate() + 4);
    const initialExams: UpcomingExam[] = [
      {
        id: 'exam_init_dbms',
        subjectId: 'subj_db',
        subjectName: 'DBMS',
        subjectCode: 'BACSE202',
        examDate: today.toISOString().split('T')[0],
        examTitle: 'Midterm Examination',
        createdAt: Date.now()
      }
    ];
    this.saveUpcomingExams(initialExams);
    return initialExams;
  }

  saveUpcomingExams(exams: UpcomingExam[]): void {
    try {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    } catch (e) {
      console.warn('Failed to save upcoming exams:', e);
    }
  }

  addUpcomingExam(subjectId: string, subjectName: string, examDate: string, examTitle?: string, subjectCode?: string): UpcomingExam {
    const exams = this.getUpcomingExams();
    const newExam: UpcomingExam = {
      id: `exam_${Date.now()}`,
      subjectId,
      subjectName: subjectName.trim(),
      subjectCode: subjectCode?.trim(),
      examDate: examDate.trim(),
      examTitle: examTitle?.trim() || 'Course Exam',
      createdAt: Date.now()
    };
    exams.push(newExam);
    this.saveUpcomingExams(exams);
    return newExam;
  }

  deleteUpcomingExam(examId: string): void {
    const exams = this.getUpcomingExams().filter(e => e.id !== examId);
    this.saveUpcomingExams(exams);
  }
}

export const subjectService = new SubjectService();

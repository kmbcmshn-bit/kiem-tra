import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';
import { ClassRoom, Student, Exam, Submission, ExamComplaint, TeacherProfile } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Authenticate anonymously so every client device has an active session
signInAnonymously(auth).catch((err) => {
  console.warn('Anonymous auth fallback:', err);
});

// Validate Connection to Firestore (Skill Requirement)
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Skill-required Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------- FIRESTORE REAL-TIME SYNC HELPERS -----------------

// Clean undefined fields before writing to Firestore
function sanitizeData<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = sanitizeData(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// 1. Classes
export function subscribeClasses(callback: (classes: ClassRoom[]) => void) {
  const path = 'classes';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ClassRoom[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ClassRoom);
      });
      callback(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export async function syncSaveClass(classItem: ClassRoom) {
  const path = `classes/${classItem.id}`;
  try {
    await setDoc(doc(db, 'classes', classItem.id), sanitizeData(classItem), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteClass(classId: string) {
  const path = `classes/${classId}`;
  try {
    await deleteDoc(doc(db, 'classes', classId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 2. Students
export function subscribeStudents(callback: (students: Student[]) => void) {
  const path = 'students';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Student[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Student);
      });
      callback(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export async function syncSaveStudent(student: Student) {
  const path = `students/${student.id}`;
  try {
    await setDoc(doc(db, 'students', student.id), sanitizeData(student), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncBatchSaveStudents(studentList: Student[]) {
  if (studentList.length === 0) return;
  const path = 'students';
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < studentList.length; i += CHUNK_SIZE) {
      const chunk = studentList.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((st) => {
        const ref = doc(db, 'students', st.id);
        batch.set(ref, sanitizeData(st), { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncBatchReplaceStudents(oldStudentIds: string[], newStudents: Student[]) {
  const path = 'students';
  try {
    const CHUNK_SIZE = 400;
    // Step 1: Delete old students in chunks of 400
    for (let i = 0; i < oldStudentIds.length; i += CHUNK_SIZE) {
      const chunk = oldStudentIds.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((id) => {
        const ref = doc(db, 'students', id);
        batch.delete(ref);
      });
      await batch.commit();
    }
    // Step 2: Add new students in chunks of 400
    for (let i = 0; i < newStudents.length; i += CHUNK_SIZE) {
      const chunk = newStudents.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((st) => {
        const ref = doc(db, 'students', st.id);
        batch.set(ref, sanitizeData(st), { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteStudent(studentId: string) {
  const path = `students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 3. Exams
export function subscribeExams(callback: (exams: Exam[]) => void) {
  const path = 'exams';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Exam[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Exam);
      });
      callback(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export async function syncSaveExam(exam: Exam) {
  const path = `exams/${exam.id}`;
  try {
    await setDoc(doc(db, 'exams', exam.id), sanitizeData(exam), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteExam(examId: string) {
  const path = `exams/${examId}`;
  try {
    await deleteDoc(doc(db, 'exams', examId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 4. Submissions
export function subscribeSubmissions(callback: (submissions: Submission[]) => void) {
  const path = 'submissions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Submission[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Submission);
      });
      callback(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export async function syncSaveSubmission(sub: Submission) {
  const path = `submissions/${sub.id}`;
  try {
    await setDoc(doc(db, 'submissions', sub.id), sanitizeData(sub), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteSubmission(subId: string) {
  const path = `submissions/${subId}`;
  try {
    await deleteDoc(doc(db, 'submissions', subId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncUpdateSubmissionScore(
  subId: string,
  newScore: number,
  newPercentage: number,
  notes?: string
) {
  const path = `submissions/${subId}`;
  try {
    const payload: Record<string, any> = {
      score: newScore,
      percentage: newPercentage,
    };
    if (notes !== undefined) {
      payload.teacherReviewNotes = notes;
    }
    await updateDoc(doc(db, 'submissions', subId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// 5. Complaints
export function subscribeComplaints(callback: (complaints: ExamComplaint[]) => void) {
  const path = 'complaints';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ExamComplaint[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ExamComplaint);
      });
      callback(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export async function syncSaveComplaint(comp: ExamComplaint) {
  const path = `complaints/${comp.id}`;
  try {
    await setDoc(doc(db, 'complaints', comp.id), sanitizeData(comp), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncUpdateComplaintStatus(
  compId: string,
  status: 'accepted' | 'rejected',
  teacherResponse: string
) {
  const path = `complaints/${compId}`;
  try {
    await updateDoc(doc(db, 'complaints', compId), {
      status,
      teacherResponse,
      resolvedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// 6. Teacher Profile
export function subscribeTeacherProfile(callback: (profile: TeacherProfile) => void) {
  const path = 'teacherProfiles/main_profile';
  return onSnapshot(
    doc(db, 'teacherProfiles', 'main_profile'),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as TeacherProfile);
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, path)
  );
}

export async function syncSaveTeacherProfile(profile: TeacherProfile) {
  const path = 'teacherProfiles/main_profile';
  try {
    await setDoc(doc(db, 'teacherProfiles', 'main_profile'), sanitizeData(profile), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

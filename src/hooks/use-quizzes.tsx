
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { LucideIcon, BrainCircuit, TestTube2, Trophy, Film, BookCheck } from 'lucide-react';

export type QuizCategory = 'general' | 'jee-neet' | 'sports-gk' | 'movies-anime' | 'exam-mcq';

export const categoryDetails: Record<QuizCategory, {
    Icon: LucideIcon;
    title: string;
    description: string;
    gradient: string;
    shadow: string;
}> = {
    'general': {
        Icon: BrainCircuit,
        title: "General",
        description: "A mix of topics to challenge your wits.",
        gradient: "bg-gradient-to-br from-purple-500 to-indigo-600",
        shadow: "shadow-lg shadow-purple-500/20"
    },
    'jee-neet': {
        Icon: TestTube2,
        title: "JEE/NEET Level",
        description: "Advanced concepts for engineering & medical aspirants.",
        gradient: "bg-gradient-to-br from-sky-500 to-cyan-600",
        shadow: "shadow-lg shadow-sky-500/20"
    },
    'sports-gk': {
        Icon: Trophy,
        title: "Sports & GK",
        description: "Test your knowledge of sports and general awareness.",
        gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
        shadow: "shadow-lg shadow-amber-500/20"
    },
    'movies-anime': {
        Icon: Film,
        title: "Movies, Webseries & Anime",
        description: "For the ultimate binge-watchers and anime fans.",
        gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
        shadow: "shadow-lg shadow-rose-500/20"
    },
    'exam-mcq': {
        Icon: BookCheck,
        title: "Exam Top MCQ (10th/12th)",
        description: "Practice key multiple-choice questions for boards.",
        gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
        shadow: "shadow-lg shadow-green-500/20"
    }
};

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: QuizCategory;
  timeLimit: number;
  entryFee: number;
  reward: number;
  questions: QuizQuestion[];
  createdAt: string; // Ensure createdAt is part of the type
}

export const useQuizzes = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const quizzesColRef = collection(db, 'quizzes');
        const q = query(quizzesColRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedQuizzes = snapshot.docs.map(doc => {
                const data = doc.data() as DocumentData;
                const questionsWithIds = data.questions.map((q: any, index: number) => ({
                    ...q,
                    id: q.id || `q_${index}`
                }));
                return { 
                    id: doc.id, 
                    ...data,
                    questions: questionsWithIds,
                    createdAt: data.createdAt || new Date(0).toISOString(),
                    entryFee: data.entryFee ?? 0,
                    reward: data.reward ?? 5
                } as Quiz;
            });
            setQuizzes(fetchedQuizzes);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching quizzes: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const deleteQuiz = async (quizId: string) => {
        const quizDocRef = doc(db, 'quizzes', quizId);
        await deleteDoc(quizDocRef);
    }
    
    return { quizzes, loading, deleteQuiz };
}

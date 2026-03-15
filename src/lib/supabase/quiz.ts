import { supabase } from "./client";

export interface QuizResultRow {
  id?: string;
  user_id: string;
  lesson_id: string;
  score: number;
  total: number;
  answers: Record<string, string>;
  created_at?: string;
}

/** Save a quiz attempt */
export async function saveQuizResult(
  userId: string,
  lessonId: string,
  score: number,
  total: number,
  answers: Record<string, string>
) {
  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      score,
      total,
      answers,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as QuizResultRow;
}

/** Fetch quiz history for a user */
export async function getQuizResults(userId: string) {
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as QuizResultRow[];
}

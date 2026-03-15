import { supabase } from "./client";

export interface ProgressRow {
  id?: string;
  user_id: string;
  lesson_id: string;
  percent_complete: number;
  updated_at?: string;
}

/** Upsert lesson progress for a user */
export async function saveProgress(
  userId: string,
  lessonId: string,
  percent: number
) {
  const { data, error } = await supabase
    .from("progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        percent_complete: percent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as ProgressRow;
}

/** Fetch all progress rows for a user */
export async function getProgress(userId: string) {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as ProgressRow[];
}

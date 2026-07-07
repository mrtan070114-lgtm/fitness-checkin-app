import type { SupabaseClient } from "@supabase/supabase-js";
import { PROFILE_SELECT } from "@/lib/profiles";
import type { CheckinComment, Database, Profile } from "@/types/database";

export type InteractionCounts = Record<string, { likeCount: number; commentCount: number }>;

export type CommentWithAuthor = CheckinComment & {
  author: Pick<Profile, "id" | "username" | "email" | "avatar_url"> | null;
};

type AppSupabaseClient = SupabaseClient<Database>;

function createEmptyCounts(ids: string[]) {
  return ids.reduce<InteractionCounts>((result, id) => {
    result[id] = { likeCount: 0, commentCount: 0 };
    return result;
  }, {});
}

export async function fetchInteractionCounts(supabase: AppSupabaseClient, checkinIds: string[]) {
  const counts = createEmptyCounts(checkinIds);
  if (!checkinIds.length) return counts;

  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("checkin_likes").select("checkin_id").in("checkin_id", checkinIds),
    supabase.from("checkin_comments").select("checkin_id").in("checkin_id", checkinIds)
  ]);

  for (const like of likes || []) {
    counts[like.checkin_id].likeCount += 1;
  }

  for (const comment of comments || []) {
    counts[comment.checkin_id].commentCount += 1;
  }

  return counts;
}

export async function fetchRecordInteractions(supabase: AppSupabaseClient, checkinId: string, currentUserId: string) {
  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("checkin_likes").select("user_id").eq("checkin_id", checkinId),
    supabase.from("checkin_comments").select("*").eq("checkin_id", checkinId).order("created_at", { ascending: true })
  ]);

  const commentRows = (comments || []) as CheckinComment[];
  const authorIds = Array.from(new Set(commentRows.map((comment) => comment.user_id)));
  const { data: authors } = authorIds.length
    ? await supabase.from("profiles").select(PROFILE_SELECT).in("id", authorIds)
    : { data: [] as Profile[] };
  const authorMap = new Map((authors || []).map((author) => [author.id, author as Profile]));

  return {
    likeCount: likes?.length || 0,
    likedByMe: Boolean(likes?.some((like) => like.user_id === currentUserId)),
    comments: commentRows.map((comment) => ({
      ...comment,
      author: authorMap.get(comment.user_id) || null
    })) as CommentWithAuthor[]
  };
}

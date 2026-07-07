import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { addCheckinComment, deleteCheckinComment, toggleCheckinLike } from "@/app/records/actions";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { SubmitButton } from "@/components/SubmitButton";
import type { CommentWithAuthor } from "@/lib/interactions";
import type { Profile } from "@/types/database";

type CheckinInteractionsProps = {
  checkinId: string;
  currentUserId: string;
  returnPath: string;
  likeCount: number;
  likedByMe: boolean;
  comments: CommentWithAuthor[];
  allowNewInteractions?: boolean;
  allowDeleteAll?: boolean;
};

export function CheckinInteractions({
  checkinId,
  currentUserId,
  returnPath,
  likeCount,
  likedByMe,
  comments,
  allowNewInteractions = true,
  allowDeleteAll = false
}: CheckinInteractionsProps) {
  return (
    <section className="info-card rich-card">
      <div className="interaction-header">
        <div>
          <p className="eyebrow">监督互动</p>
          <h2>点赞和留言</h2>
        </div>
        <div className="interaction-counts">
          <span>
            <Heart size={15} aria-hidden="true" /> {likeCount}
          </span>
          <span>
            <MessageCircle size={15} aria-hidden="true" /> {comments.length}
          </span>
        </div>
      </div>

      {allowNewInteractions ? (
        <>
          <form action={toggleCheckinLike}>
            <input name="checkin_id" type="hidden" value={checkinId} />
            <input name="return_path" type="hidden" value={returnPath} />
            <SubmitButton className={likedByMe ? "secondary-button" : "primary-button"} pendingText="处理中...">
              {likedByMe ? "取消点赞" : "点赞"}
            </SubmitButton>
          </form>

          <form action={addCheckinComment} className="comment-form">
            <input name="checkin_id" type="hidden" value={checkinId} />
            <input name="return_path" type="hidden" value={returnPath} />
            <label>
              留言
              <textarea maxLength={200} name="content" placeholder="写一句监督或鼓励的话" rows={3} required />
            </label>
            <SubmitButton pendingText="发送中...">发送留言</SubmitButton>
          </form>
        </>
      ) : null}

      <div className="comment-list">
        {comments.length ? (
          comments.map((comment) => {
            const author = comment.author || ({ id: comment.user_id, username: "用户", email: "", avatar_url: null } as Pick<Profile, "id" | "username" | "email" | "avatar_url">);
            return (
              <article className="comment-item" key={comment.id}>
                <ProfileAvatar profile={author} size="sm" />
                <div>
                  <div className="comment-title-row">
                    <strong>{author.username}</strong>
                    <span>{new Date(comment.created_at).toLocaleString("zh-CN")}</span>
                  </div>
                  <p>{comment.content}</p>
                  {allowDeleteAll || comment.user_id === currentUserId ? (
                    <form action={deleteCheckinComment}>
                      <input name="checkin_id" type="hidden" value={checkinId} />
                      <input name="comment_id" type="hidden" value={comment.id} />
                      <input name="return_path" type="hidden" value={returnPath} />
                      <SubmitButton className="text-link danger-link" pendingText="删除中...">
                        <Trash2 size={14} aria-hidden="true" />
                        删除
                      </SubmitButton>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <p className="muted">还没有留言，写下第一句监督反馈。</p>
        )}
      </div>
    </section>
  );
}

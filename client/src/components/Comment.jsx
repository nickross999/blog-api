import { useState } from "react";
import axios from "axios";
import "../assets/css/Comment.css";

function Comment({ comments, postId, user }) {
  const [newComment, setNewComment] = useState("");
  const [commentArray, setCommentArray] = useState(comments);

  async function submitComment(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/posts/${postId}/comments`,
        {
          content: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      if (response.status === 201) {
        setNewComment("");
        //refresh comments
        const updatedComments = await axios.get(
          `http://localhost:3000/posts/${postId}/comments`
        );
        setCommentArray(updatedComments.data.comments);
      }
    } catch (err) {
      console.log(err);
    }
  }

  //TODO:
  //handle reply to comment
  //handle view replies

  return (
    <>
      {commentArray.length > 0 ? (
        commentArray.map((comment) => {
          return (
            <div key={comment.id} className="comment">
              <p className="comment-author">{comment.author.name}</p>
              <p className="comment-post-date">{comment.createdAt}</p>
              <p className="comment-updated-date">
                {comment.createdAt.localeCompare(comment.updatedAt) !== 0
                  ? "Last updated: " + comment.updatedAt
                  : null}
              </p>
              <p className="comment-content">{comment.content}</p>
              <button className="reply-button">Reply</button>
              <div className="reply-form-container hidden">
                {user ? (
                  <form className="comment-form" onSubmit={submitComment}>
                    <textarea
                      className="comment-input"
                      rows={4}
                      cols={50}
                      placeholder="Add a comment..."
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit">Add comment</button>
                  </form>
                ) : (
                  "Log in to comment"
                )}
              </div>
              {comment._count.children > 0 ? (
                <button className="view-replies-button">
                  View {comment._count.children} replies
                </button>
              ) : null}
            </div>
          );
        })
      ) : (
        <p>No comments yet...</p>
      )}
      {user ? (
        <form className="comment-form" onSubmit={submitComment}>
          <textarea
            className="comment-input"
            rows={4}
            cols={50}
            placeholder="Add a comment..."
            required
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Add comment</button>
        </form>
      ) : (
        "Log in to comment"
      )}
    </>
  );
}

export default Comment;

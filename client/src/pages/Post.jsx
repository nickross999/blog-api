import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/Post.css";

function Post({ user }) {
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");

  const { id } = useParams();

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/posts/${id}`);
      setPost({
        title: response.data.post.title,
        content: response.data.post.content,
        author: response.data.post.author,
        comments: response.data.post.comments,
        createdAt: formatDate(response.data.post.createdAt),
        updatedAt: formatDate(response.data.post.updatedAt),
      });
    } catch (err) {
      setPost({
        title: "Error",
        content: "Failed to fetch post data." + err.message,
      });
    }
  };

  async function submitComment(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/posts/${id}/comments`,
        {
          content: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );
      if (response.status === 201) {
        setComment("");
        fetchPost();
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchPost();
  }, []);

  return (
    <>
      <div className="post-container">
        <h1 className="post-title">{post ? post.title : "Loading..."}</h1>
        <p className="post-author">{post ? post.author.name : null}</p>
        <p className="post-date">Posted: {post ? post.createdAt : null}</p>
        <p className="updated-date">
          {post && post.createdAt.localeCompare(post.updatedAt) !== 0
            ? "Last updated: " + post.updatedAt
            : null}
        </p>
        <p className="post-content">
          {post ? post.content : "Loading post..."}
        </p>
      </div>
      <div className="comments-container">
        {post && post.comments.length > 0 ? (
          post.comments.map((comment) => {
            return (
              <div key={comment.id} className="comment">
                <p className="comment-author">{comment.author.name}</p>
                <p className="comment-content">{comment.content}</p>
              </div>
            );
          })
        ) : (
          <p>No comments yet...</p>
        )}
        <form className="comment-form" onSubmit={submitComment}>
          <textarea
            className="comment-input"
            rows={4}
            cols={50}
            placeholder="Add a comment..."
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit">Add comment</button>
        </form>
      </div>
    </>
  );
}

export default Post;

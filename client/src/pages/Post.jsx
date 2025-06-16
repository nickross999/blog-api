import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/Post.css";
import Comment from "../components/Comment";

function Post({ user }) {
  const [post, setPost] = useState(null);

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

  useEffect(() => {
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
    fetchPost();
  }, [id]);

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
        {post ? (
          <Comment comments={post.comments} postId={id} user={user} />
        ) : (
          "Loading comments..."
        )}
      </div>
    </>
  );
}

export default Post;

import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Login from "./pages/Login";
import Logout from "./pages/Logout";

function App() {
  const [posts, setPosts] = useState([]);
  const [signedIn, setSignedIn] = useState(
    localStorage.getItem("jwt") !== null
  );
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const response = await axios.get("http://localhost:3000/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      setUserInfo(response.data.user);
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/posts");
        setPosts(response.data.posts);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <>
      <div className="header">
        <a href="/">Home</a>
        <a href="/post/1">Test page</a>
        <p>
          {signedIn && userInfo
            ? `Signed in as ${userInfo.name}`
            : "not signed in"}
        </p>
        {!signedIn ? (
          <a href="/login">Sign in</a>
        ) : (
          <a href="/logout">Sign out</a>
        )}
      </div>
      <div className="sidebar">
        <ul className="post-list">
          {posts.map((post) => {
            return (
              <li key={post.id}>
                <span className="sidebar-post-date">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
                <a href={`/post/${post.id}`}>{post.title}</a>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="content">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/post/:id"
              element={
                <Post
                  user={
                    userInfo
                      ? {
                          name: userInfo.name,
                          id: userInfo.id,
                          email: userInfo.email,
                        }
                      : null
                  }
                />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;

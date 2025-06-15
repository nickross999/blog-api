import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Login from "./pages/Login";

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
  }),
    [];

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
      <div className="sidebar"></div>
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
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;

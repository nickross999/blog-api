const express = require("express");
const app = express();
require("dotenv").config();
const { passport, prisma, bcrypt, jwt, optionalAuth } = require("./passport");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cors());

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await prisma.user
      .create({
        data: {
          email,
          password: await bcrypt.hash(password, 10),
          name,
        },
      })
      .then((user) => {
        jwt.sign(
          { user },
          process.env.JWT_SECRET,
          { expiresIn: "1d" },
          (err, token) => {
            if (err) {
              return res.status(500).json({ message: "Error signing token" });
            } else {
              return res.json({
                token,
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                },
              });
            }
          }
        );
      });
  } catch (err) {
    return res.status(500).json({ message: "Error" });
  }
});

app.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    jwt.sign(
      {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: "Error signing token" });
        } else {
          return res.json({ token });
        }
      }
    );
  }
);

app.get("/", async function (req, res) {
  const posts = await prisma.post.findMany({
    take: 10,
  });
  return res.json({
    posts: posts,
  });
});

app.get("/user",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      user: user
    })
  }
)

app.get("/posts/:id", optionalAuth, async (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
        },
      },
      comments: {
        where: {
          parentId: null,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              name: true
            }
          }
        }
      },
    },
  });
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  return res.json({
    post: post,
    user: req.user || null,
  });
});

app.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    } else {
      try {
        await prisma.post
          .create({
            data: {
              title,
              content,
              authorId: req.user.id,
            },
          })
          .then((post) => {
            return res.status(201).json({
              message: "Post created successfully",
              post: {
                post: post.id,
                title: post.title,
                content: post.content,
              },
            });
          });
      } catch (err) {
        return res.status(500).json({ message: "Error creating post" });
      }
    }
  }
);

app.post(
  "/posts/:id/comments",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    try {
      const postExists = await prisma.post.findUnique({
        where: { id: postId },
      });
      if (!postExists) {
        return res.status(404).json({ message: "Post not found" });
      }
      console.log("post exists");
      const comment = {
        content: req.body.content,
        parentId: req.body.parentId || null,
        authorId: req.user.id,
        postId: postId,
      };
      if (!comment.content) {
        return res.status(400).json({ message: "Content is required" });
      }

      await prisma.comment
        .create({
          data: comment,
        })
        .then((newComment) => {
          return res.status(201).json({
            message: "Comment created successfully",
            comment: newComment,
          });
        });
    } catch (err) {
      return res.status(500).json({ message: "Error creating comment" });
    }
  }
);

app.listen(process.env.PORT, () =>
  console.log(`Server is listening on port ${process.env.PORT}`)
);

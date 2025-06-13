const express = require("express");
const app = express();
require("dotenv").config();
const { passport, prisma, bcrypt, jwt, optionalAuth } = require("./passport");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

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

app.get("/posts/:id", optionalAuth, async (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
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

app.listen(process.env.PORT, () =>
  console.log(`Server is listening on port ${process.env.PORT}`)
);

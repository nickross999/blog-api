const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  //fake user
  const user = {
    id: 1,
    username: "test",
    email: "test@test.com",
  }

  jwt.sign({ user }, process.env.JWT_SECRET, (err, token) => {
    if (err) {
        return res.status(500).json({ message: "Error signing token" });
    } else {
        return res.json({ token });
    }
  })
});

app.post("/", verifyToken, (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            return res.status(403).json({ message: "Access denied" });
        } else {
            return res.json({
                message: "Authenticated",
                authData
            })
        }
    })
})

function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({ message: "Access denied" });
    }

    req.token = token.split(" ")[1];
    next();
}

app.listen(process.env.PORT, () =>
  console.log(`Server is listening on port ${process.env.PORT}`)
);

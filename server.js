import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import GridFsStorage from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import bodyParser from "body-parser";
import path from "path";
import Pusher from "pusher";

import mongoPosts from "./postModel";

Grid.mongo = mongoose.mongo;
// app config
const app = express();
const port = process.env.PORT || 9000;

// middleware
app.use(bodyParser.json());
app.use(cors());

// db config
const mongoURI =
  "mongodb+srv://fbclient:FvE4BMgvFLS9jSR@cluster0.hvdbe.mongodb.net/facebook-clone-db?retryWrites=true&w=majority";

// For GridFS
const connection = mongoose.createConnection(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;

connection.once("open", () => {
  console.log("db connection");
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("images");
});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((res, rej) => {
      const filename = `image-${Date.now()}${path.extname(file.originalname)}`;

      const fileInfo = {
        filename: filename,
        bucketName: "images",
      };

      res(fileInfo);
    });
  },
});

const upload = multer({ storage });

// For posts
mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.post("/upload/image", upload.single("file"), (req, res) => {
  res.status(201).send(req.file);
});

app.post("/upload/post", (req, res) => {
  const dbPost = req.body;

  mongoPosts.create(dbPost, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// listen port
app.listen(port, () => console.log(`listening on localhost:${port}`));

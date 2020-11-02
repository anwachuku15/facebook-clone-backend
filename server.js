import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import GridFsStorage from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import bodyParser from "body-parser";
import path from "path";
import Pusher from "pusher";
import { mongoURI as mURI } from "./secrets.js";
import { getPosts, createPost } from "./handlers/posts.js";

Grid.mongo = mongoose.mongo;
// app config
const app = express();
const port = process.env.PORT || 9000;

// middleware
app.use(bodyParser.json());
app.use(cors());

// db config
const mongoURI = mURI;

// For GridFS (images/videos)
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

// For Posts
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

app.post("/upload/post", createPost);

app.get("/retrieve/posts", getPosts);

app.get("/retrieve/images/single", (req, res) => {
  gfs.files.findOne({ filename: req.query.name }, (err, file) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!file || file.length === 0) {
        res.status(404).json({ err: "file not found" });
      } else {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      }
    }
  });
});

// listen port
app.listen(port, () => console.log(`listening on localhost:${port}`));

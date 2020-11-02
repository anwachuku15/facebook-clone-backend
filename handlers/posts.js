import mongoPosts from "../postModel.js";

export const createPost = (req, res) => {
  const dbPost = req.body;

  mongoPosts.create(dbPost, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
};

export const getPosts = (req, res) => {
  mongoPosts.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      data.sort((b, a) => {
        return a.timestamp - b.timestamp;
      });

      res.status(200).send(data);
    }
  });
};

const User = require("../schema/user.schema");
const Post = require("../schema/post.schema");

module.exports.getUsersWithPostCount = async (req, res) => {

  const data = {};
  let pageSize = (req.query && req.query.limit) ? parseInt(req.query.limit) : 10;
  let pageNumber = (req.query && req.query.page) ? parseInt(req.query.page) : 1;

  try {
    //DB Queries
    const posts = await Post.find();
    const userLength = await User.find().count();
    const users = await User.find()
      .select(['_id', 'name'])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ name: 1 });

    users.forEach((e) => {
      var postNo = posts.filter(p => p['userId'].equals(e['_id']));
      e['_doc']['posts'] = postNo.length;
    });
    data.users = users;

    // pagination
    const pagination = {
      totalDocs: userLength,
      limit: pageSize,
      page: pageNumber,
      totalPages: Math.ceil(userLength / pageSize),
      pagingCounter: ((pageNumber - 1) * pageSize) + 1,
      hasPrevPage: pageNumber > 1
    };

    pagination['hasNextPage'] = pagination['page'] < pagination['totalPages'];
    pagination['prevPage'] = pagination['hasPrevPage'] ? (pagination['page'] - 1) : null;
    pagination['nextPage'] = pagination['hasNextPage'] ? (pagination['page'] + 1) : null;
    data.pagination = pagination;

    res.status(200).json({ data });
  } catch (error) {
    res.send({ error: error.message });
  }
};

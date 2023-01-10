const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {

  const data = {};
  let pageSize = (req.query && req.query.limit) ? parseInt(req.query.limit) : 10;
  let pageNumber = (req.query && req.query.page) ? parseInt(req.query.page) : 1;

  try {
    //Aggregate implementation
    var pipeline = [
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      { $sort: { name: 1 } },
      {
        $lookup: {
          from: 'posts',    //coll to join
          localField: '_id',
          foreignField: 'userId',
          as: 'posts'       //field name for joined doc
        }
      },
      {
        $project: {
          name: '$name',
          posts: { $size: "$posts" }
        }
      }
    ]

    //DB Queries
    const users = await User.aggregate(pipeline);
    const userLength = await User.find().count();

    data.users = users;

    //Pagination
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

const users = {};
const userInfos = {};

exports.create = async (socket, userData) => {
  if (userData) {
    users[userData._id] = socket;
    userInfos[userData._id] = userData
  }
  return userData._id;
};

exports.get = (id) => users[id];
exports.getInfo = (id) => userInfos[id];

exports.remove = (id) => {
  delete users[id]
  delete userInfos[id]
};

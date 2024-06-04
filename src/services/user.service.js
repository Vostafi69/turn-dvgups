const users = require("../../__MOCKS__/users.js");

exports.getRole = async (userId) => {
  const user = await users.find((user) => userId === user.id);
  return user.role;
};

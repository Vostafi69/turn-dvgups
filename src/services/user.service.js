const users = require("../../__MOCKS__/users.js");

exports.getRole = async (userId) => {
  const user = await users.find((user) => userId === user.id);
  return user.role;
};

exports.getUserFullName = async (userId) => {
  const user = await users.find((user) => userId === user.id);
  const userFullName = `${user.surname} ${user.name.slice(0, 1)}.${user.lastname.slice(0, 1)}.`;
  return userFullName;
};

const users = require("../../__MOCKS__/users.js");

exports.getRole = async (userId) => {
  const user = await users.find((user) => userId === user.id);
  return user.role;
};

exports.getUserGroup = async (userId) => {
  const user = await users.find((user) => userId === user.id);
  const userGroup = user.group;
  return userGroup;
};

exports.getUserName = async (userId) => {
  const user = await users.find((user) => userId === user.id);
  const userName = `${user.surname} ${user.name.slice(0, 1)}.${user.lastname.slice(0, 1)}.`;
  return userName;
};

exports.getUserFullName = async (userId) => {
  const user = await users.find((user) => userId === user.id);
  const userFullName = `${user.surname} ${user.name} ${user.lastname}`;
  return userFullName;
};

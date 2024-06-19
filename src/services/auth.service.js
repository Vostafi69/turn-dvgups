const users = require("../../__MOCKS__/users.js");
const { SESSION_NAME } = require("../utils/constants.js");

exports.login = (req, res) => {
  const { login, password } = req.body;

  if (login && password) {
    const user = users.find((user) => login === user.login && user.password === password);

    if (!user) {
      res.status(400);
      res.setHeader("Content-Type", "application/json");
      return res.json({ message: "Неверный логин или пароль" });
    }

    req.session.userId = user.id;
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.json({ userId: user.id });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(400);
      res.setHeader("Content-Type", "application/json");
      return res.json({ message: "Не удалось выйти" });
    }

    res.clearCookie(SESSION_NAME);
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.json();
  });
};

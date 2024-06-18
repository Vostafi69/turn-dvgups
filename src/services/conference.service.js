const blackList = require("../../__MOCKS__/blackList.js");
// const client = require("../db/db.client");

// /**
//  * Заносит информацию о новой конференции
//  *
//  * @param {string} conferenceId - Идентификатор трансляции.
//  * @param {string} name - Название трансляции.
//  * @param {boolean} isPrivate - Закрытая ли трансляция.
//  * @param {string} ownerId - Идентификатор организатора.
//  * @param {string} chatId - Идентификатор чата трансляции.
//  *
//  * @returns {Promise<ResultSetHeader>} - Результат запроса
//  */
// exports.openConference = async (conferenceId, name, isPrivate, ownerId, chatId) => {
//   const result = await client.query(`INSERT INTO conference(conference_id, name, chat_id, is_private, owner_id) VALUES ($1, $2, $3, $4, $5)`, [
//     `${conferenceId}`,
//     `${name}`,
//     `${chatId}`,
//     `${isPrivate}`,
//     `${ownerId}`,
//   ]);
//   return result;
// };

// exports.closeConference = async (closeAt, conferenceId) => {
//   const result = await client.query("UPDATE conference SET close_at=$1 WHERE conference_id=$2", [`${closeAt}`, `${conferenceId}`]);
//   return result;
// };

exports.blockUser = (req, res) => {
  const { userId } = req.body;
  if (!blackList.includes(userId)) {
    blackList.push(userId);
  }

  res.json({ userId: userId });
};

exports.checkUserIsBlocked = (req, res) => {
  const { userId } = req.body;
  if (blackList.includes(userId)) {
    res.json({ userIsBlocked: true });
  } else {
    res.json({ userIsBlocked: false });
  }
};

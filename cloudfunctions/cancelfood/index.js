const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  await db.collection('food').where({
    userID:event.userInfo.openId
  }).remove();
}
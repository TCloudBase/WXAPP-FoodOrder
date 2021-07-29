const cloud = require('wx-server-sdk');
const doneSID = '';

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    let now = new Date(new Date().getTime()+28800000);
    console.log(now)
    const messages = await db.collection('food').where({
        state : 1,
        donetime: _.lt(now)
      }).get();

    const sendPromises = messages.data.map(async message => {
      try {
        if(message.doneMess==true){
          await cloud.openapi.subscribeMessage.send({
            touser: message.userID,
            page: 'index',
            data: message.doneContent,
            templateId: doneSID,
          });
        }
        return db.collection('food').doc(message._id).update({
            data: {
              state: 2
            },
          });
      } catch (e) {
        return e;
      }
    });
    return Promise.all(sendPromises);
  } catch (err) {
    console.log(err);
    return err;
  }
};
const cloud = require('wx-server-sdk')
const stateSID = ''

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    const now = new Date(new Date().getTime() + 28800000)
    console.log(now)
    const messages = await db.collection('food').where({
      state: 0,
      statetime: _.lt(now)
    }).get()

    const sendPromises = messages.data.map(async message => {
      try {
        if (message.stateMess === true) {
          console.log(message.stateContent)
          await cloud.openapi.subscribeMessage.send({
            touser: message.userID,
            page: 'index',
            data: message.stateContent,
            templateId: stateSID
          })
        }
        return db.collection('food').doc(message._id).update({
          data: {
            state: 1
          }
        })
      } catch (e) {
        return e
      }
    })
    return Promise.all(sendPromises)
  } catch (err) {
    console.log(err)
    return err
  }
}

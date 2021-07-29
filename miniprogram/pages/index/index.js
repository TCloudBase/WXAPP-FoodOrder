const app = getApp()
let that = null
const doneSID = ''
const stateSID = ''

Page({
  data: {
    sale: false,
    model: 0
  },
  onLoad () {
    that = this
    that.init()
  },
  init () {
    wx.cloud.callFunction({
      name: 'initfood',
      success (res) {
        console.log(res.result)
        const mess = {}
        if (res.result == -1) mess.model = 3// 加载失败
        else if (res.result == 1) mess.model = 4// 被禁止
        else {
          if (res.result.state == null) {
            mess.model = 1
            mess.desc = '早餐价格：' + res.result.Food.price + '元'
            mess.tips = res.result.Food.tips
            mess.fooddes = res.result.Food.food
            mess.foodimg = res.result.Food.img
          } else {
            mess.model = 2
            mess.state = res.result.state
            mess.submittime = res.result.submittime
            mess.SID = res.result.SID
            mess.statetime = res.result.statetime
            mess.donetime = res.result.donetime
            mess.tel = res.result.Food.tel
          }
        }
        that.setData(mess)
      },
      fail (e) {
        console.log(e)
      }
    })
  },
  select (e) {
    this.setData({
      sale: true
    })
  },
  submit (e) {
    if (e.detail.errMsg == 'getUserInfo:ok') {
      this.uInfo = e.detail.userInfo
      wx.chooseAddress({
        success (res) {
          that.uAddress = res
          console.log(res)
          const name = res.userName
          const tel = res.telNumber

          if (res.cityName == '广州市' && res.countyName == '海珠区') {
            const address = res.provinceName + res.cityName + res.countyName + res.detailInfo

            that.setData({
              taddress: address,
              tname: name,
              ttel: tel,
              sale: false,
              conf: true,
              nosubmit: false
            })
          } else {
            that.setData({
              taddress: '当前地址不在配送范围内，只限广州市海珠区，感谢理解！',
              tname: name,
              ttel: tel,
              sale: false,
              conf: true,
              nosubmit: true
            })
          }
        }
      })
    }
  },
  cancel () {
    wx.showLoading({
      title: '取消中'
    })
    wx.cloud.callFunction({
      name: 'cancelfood',
      success () {
        that.init()
        wx.showToast({
          title: '取消成功'
        })
      }
    })
  },
  reset () {
    that.setData({
      sale: true,
      conf: false
    })
  },
  confirm () {
    wx.requestSubscribeMessage({
      tmplIds: [stateSID, doneSID],
      success (res) {
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          console.log(res)
          that.setData({ conf: false })
          wx.showLoading({
            title: '订餐中',
            mask: true
          })
          const doneMess = (res[doneSID] == 'accept')
          const stateMess = (res[stateSID] == 'accept')
          wx.cloud.callFunction({
            name: 'submitfood',
            data: {
              Info: that.uInfo,
              Address: that.uAddress,
              stateMess: stateMess,
              doneMess: doneMess
            },
            success (res) {
              wx.hideLoading()
              that.init()
              wx.showToast({
                title: '订餐成功'
              })
            },
            fail (e) {
              wx.hideLoading()
              wx.showModal({
                title: '网络错误',
                content: '订餐请求发起失败，请检查网络后重新尝试！',
                showCancel: false
              })
            }
          })
        }
      },
      fail(e){
        console.log(e)
      }
    })
  },
  handleContact (e) {
    console.log(e)
  }
})

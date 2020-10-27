// pages/det/index.js
const {api} = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detList:[]
  },
  //请求题库列表
  async requestDetList(){
    let res = await api.requestDetList();
    let resData = res.data;
    this.setData({
      detList:resData
    })
  },
  //跳转到详情页面
  navigateToDetail(e){
    let dataset = e.target.dataset
    wx.navigateTo({
      url: '../detail/index?testpaperid='+dataset.testaperid,
      success(res){
        // 跳转成功后传递试卷名称
        res.eventChannel.emit("acceptDataFromDetList",{
          testpapername:dataset.testpapername
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.requestDetList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
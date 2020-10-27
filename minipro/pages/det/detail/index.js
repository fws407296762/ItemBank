// pages/det/detail/index.js
const {api} = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detsDetail:[]
  },
  //请求详情
  async requestDetDetailByTestPaperId(options){
    let res = await api.requestDetDetailByTestPaperId(options);
    let resData = res.data;
    this.setData({
      detsDetail:resData.topiclist
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //执行请求试卷详情
    this.requestDetDetailByTestPaperId({
      data:{
        testPaperId:options.testpaperid
      }
    });
    //获取传递的数据
    const eventChanner = this.getOpenerEventChannel();
    eventChanner.on("acceptDataFromDetList",function(data){
      wx.setNavigationBarTitle({
        title: data.testpapername,
      })
    })
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
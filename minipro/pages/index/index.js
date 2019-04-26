//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    sujectTypeList:[],
    sujectList:[],
    sujectListScrollTop:0
  },
  onLoad: function () {
    this.requestSujectType();
    this.requestSujectList(1);
  },
  //请求类别
  requestSujectType(){
    wx.request({
      url:"http://localhost:9002/sujecttypes",
      method:"GET",
      success:(xhr)=>{
        let res = xhr.data;
        let sujectTypeList = res.data.map(item=>{
          item.active = false;
          return item;
        });
        sujectTypeList[0].active = true;
        this.setData({
          sujectTypeList
        })
      }
    })
  },
  //请求题目
  requestSujectList(typeid){
    wx.request({
      url:"http://localhost:9002/getsujectbytypeid",
      data:{
        typeid: typeid
      },
      success:(xhr)=>{
        let res = xhr.data;
        let sujectList = res.data;
        sujectList = sujectList.map(item=>{
          let subjectoption = JSON.parse(item.Subjectoption);
          let subjectoptionAry = [];
          for (let i in subjectoption){
            subjectoptionAry.push({
              optionname:i,
              optioncontent: subjectoption[i]
            })
          }
          item.Subjectoption = subjectoptionAry;
          item.selectAnswer = "";
          return item;
        });
        this.setData({
          sujectList
        })
      }
    })
  },
  //选择栏目
  selectSujectType(e){
    let dataset = e.currentTarget.dataset;
    let typeid = dataset.typeid;
    let index = parseInt(dataset.index);
    this.requestSujectList(typeid);
    let sujectTypeList = this.data.sujectTypeList;
    sujectTypeList.forEach(item=>{
      item.active = false;
    })
    sujectTypeList[index].active = true;
    this.setData({
      sujectListScrollTop:0,
      sujectTypeList
    })
  },
  //选择选项
  selectOptionChange(e){
    let dataset = e.currentTarget.dataset;
    let index = dataset.index;
    let answer = dataset.answer;
    let selectValue = e.detail.value;
    let sujectList = this.data.sujectList;
    sujectList[index].selectAnswer = selectValue;
    this.setData({
      sujectList
    })
  }
})

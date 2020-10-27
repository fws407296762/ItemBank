const http =  require("./http");
const api = {
  //请求试卷列表
  requestDetList(options){
    return http.get("/testpaper/list")
  }
  //请求试卷详情
  ,requestDetDetailByTestPaperId(options){
    console.log("options:",options)
    return http.get("/testpaper/detail",options)
  }
}

module.exports = api;

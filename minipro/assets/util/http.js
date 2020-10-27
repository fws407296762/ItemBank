let baseUrl = "http://localhost:22599";
let methods = ["get","post"];
let http = {};
methods.forEach(method=>{
  http[method] = (url,options)=>{
    let requestOptions = Object.assign({
      url:baseUrl + url,
      method:method
    },options);
    return request(requestOptions)
  }
})

//请求函数
function request(options){
  return new Promise((resolve,reject)=>{
    options = Object.assign({
      success(res){
        resolve(res.data);
      },
      fail(){
        reject()
      }
    },options);
    wx.request(options)
  })
}

module.exports = http;
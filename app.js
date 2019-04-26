/*
*  @描述：文件作用
*  @作者：付文松
*  @创建时间：2019/4/26
*/

const express = require("express");
const app = express();
const DB = require("./db/config");
let SqliteDB = new DB.SqliteDB("./db/database.db");

//获取题目分类接口
app.get("/sujecttypes",(req,res)=>{
  SqliteDB.queryData("select * from tb_Subjecttype",(row)=>{
    console.log(row);
    res.send({
      code:0,
      message:"",
      data:row
    })
  })
});

//根据类型获取题目
app.get("/getsujectbytypeid",(req,res)=>{
  let query = req.query,
      typeid = query.typeid;
  SqliteDB.queryData("select * from tb_Subject where Subjecttype="+typeid,(row)=>{
    res.send({
      code:0,
      message:"",
      data:row
    })
  })
})

app.listen(9002);
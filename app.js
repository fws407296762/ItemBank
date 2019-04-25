const express = require("express");
const app = express();
const https = require("https");
const puppeteer = require("puppeteer");
const DB = require("./db/config");
let SqliteDB = new DB.SqliteDB("./db/database.db");
;(async ()=>{
  let url = "https://www.koolearn.com/shiti/list-1-3-104935-1.html"; //合成
  let sujects = await getSubjects(url);
  let sujectsAnwers = await getSubjectAnswer(sujects);
  // console.log(sujectsAnwers)
  let newSujectsAnwers = sujectsAnwers.map(item=>{
    let options = item.options;
    return [item.title,JSON.stringify(options),1,item.answer,true,"新东方"]
  });
  console.log(newSujectsAnwers);

  SqliteDB.insertData("insert into tb_Subject(Subjectname,Subjectoption,Subjecttype,Subjectanswer,Subjectstatus,Subjectfrom) values(?,?,?,?,?,?)",newSujectsAnwers)
})()


//获取页面中题目
async function getSubjects(url){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  let $pResults = await page.$$eval(".i-timu>.content",async (nodes,abc)=>{
    let newresults = [];
    for(let i = 0;i<nodes.length;i++){
      let node = nodes[i];
      let href = "https://www.koolearn.com" + node.nextSibling.nextSibling.childNodes[7].getAttribute("href");
      let text = node.innerText;
      let textAry = text.split("\n");
      let tmData = {
        title:"",
        options:{},
        answerhref:href
      };
      textAry.forEach(el=>{
        if(/^[A-Z]\./.test(el)){
          tmData.options[el.substring(0,1)] = el.substring(2,);
        }else{
          tmData.title +=el;
        }
      })
      newresults.push(tmData)
    }
    return newresults
  });
  await browser.close();
  return $pResults;
}

//获取题目中的答案
async function getSubjectAnswer(subjectList){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let index = 0;
  let newSubjectList = JSON.parse(JSON.stringify(subjectList));
  return new Promise((resolve,reject)=>{
    (async function recursionGetAnswer(index) {
      if(index === newSubjectList.length){
        await browser.close();
        resolve(newSubjectList)
        return false;
      }
      await page.goto(newSubjectList[index].answerhref);
      let $anResult = await page.$eval("#i-tab-content",async (node)=>{
        return node.innerText
      })
      newSubjectList[index].answer = $anResult;
      index++;
      recursionGetAnswer(index);
    })(index);
  })

  console.log(newSubjectList)
}

// app.listen(8080)
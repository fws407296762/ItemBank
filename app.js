const express = require("express");
const app = express();
const https = require("https");
const puppeteer = require("puppeteer");


(async ()=>{
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.koolearn.com/shiti/list-1-3-104935-1.html");
  let result = await page.evaluate(async ()=>{
    let $parts = $(".i-tree>.content>.part");

    let partData = [];
    for(let i = 0;i<$parts.length;i++){
      let item = $($parts[i]);
      let $jiChapter = item.find(".ji-chapter");
      let $partA = item.find(".title>a");
      let part = {};
      let title = $partA.text();
      part.title = title;
      part.href = "https://www.koolearn.com" + $partA.attr("href");
      if($jiChapter.length > 0){
        part.children = [];

      }
      partData.push(part);
    }
    return partData;
  })
  // let knowledgepoints = await page.$$eval(".i-tree>.content>.part",(nodes)=>{
  //
  //   let childrenList = nodes[0].children;
  //   let partTree = {
  //     title:"",
  //     href:""
  //   }
  //   for(let i = 0;i<childrenList.length;i++){
  //     let item = childrenList[i];
  //     let itemClassName = item.className;
  //     if(itemClassName === "title"){
  //       partTree.title = item.innerText;
  //       let itemChildren = item.children;
  //
  //     }
  //   }
  //   return window;
  // })
  console.log(result);
  await browser.close();
})()

//获取页面中题目
async function getSubjects(){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.koolearn.com/shiti/list-1-3-27589-1.html");
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
}

//获取题目中的答案
async function getSubjectAnswer(subjectList){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let index = 0;
  (async function recursionGetAnswer(index) {
    if(index === subjectList.length){
      await browser.close();
      console.log("$anResult:",subjectList);
      return false;
    }
    console.log("index:",index);
    await page.goto(subjectList[index].answerhref);
    let $anResult = await page.$eval("#i-tab-content",async (node)=>{
      return node.innerText
    })
    subjectList[index].answer = $anResult;
    index++;
    recursionGetAnswer(index);
  })(index)
}

// app.listen(8080)
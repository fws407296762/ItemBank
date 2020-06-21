const express = require("express");
const crawler = express();
const https = require("https");
const puppeteer = require("puppeteer");
const path = require("path");
const koolearn = require("./config/koolearn");
const sqlite3 = require("sqlite3");
const Sequelize = require("sequelize");
const Model = Sequelize.Model;

const sequelize = new Sequelize({
  dialect:"sqlite",
  storage:path.join(__dirname,"./db/database.db")
})

sequelize.authenticate().then(() => {
  console.log('数据库连接成功');
}).catch(err => {
  console.error('无法连接到数据库:', err);
});

//知识点模型
class KnowLedgePoint extends Model{}
KnowLedgePoint.init({
    point_id:{
      type: Sequelize.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    point_name:{
      type:Sequelize.TEXT,
      allowNull:false
    },
    point_href:{
      type:Sequelize.TEXT,
      allowNull:false
    },
    parent_id:{
      type:Sequelize.INTEGER,
      allowNull:true
    }
  },
  {
    sequelize,
    modelName:"knowledgepoint",
    freezeTableName:true,
    timestamps: false
  });

//题型模型
class TopicType extends Model{}
TopicType.init({
  type_name:{
    type:Sequelize.TEXT,
    allowNull:false
  },
  type_value:{
    type:Sequelize.TEXT,
    allowNull:false,
    primaryKey:true
  }
},
  {
    sequelize,
    modelName:"topic_type",
    freezeTableName:true,
    timestamps: false
  })

//难度模型
class TopicDiff extends Model{}
TopicDiff.init({
  diff_name:{
    type:Sequelize.TEXT,
    allowNull:false
  },
  diff_value:{
    type:Sequelize.TEXT,
    allowNull:false,
    primaryKey:true
  }
},
  {
    sequelize,
    modelName:"topic_diff",
    freezeTableName:true,
    timestamps: false
  })

//题目
class Topic extends Model{}
Topic.init({
  topic_id:{
    type: Sequelize.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  topic_title:{
    type:Sequelize.TEXT,
    allowNull:false
  },
  topic_options:{
    type:Sequelize.TEXT,
    allowNull:false
  },
  topic_type:{
    type:Sequelize.TEXT,
    allowNull:false
  },
  topic_diff:{
    type:Sequelize.TEXT,
    allowNull:false
  },
  topic_answer:{
    type:Sequelize.TEXT,
    allowNull:false
  },
  point_id:{
    type:Sequelize.INTEGER,
    allowNull:false
  },
  topic_analyze:{
    type:Sequelize.TEXT,
    allowNull:false
  }
},
  {
    sequelize,
    modelName:"topic",
    freezeTableName:true,
    timestamps: false
  })


//获取页面中题目
async function getSubjects(url){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  let $ajax_total = await page.$eval("#ajax_total",(node)=>{
    return node.innerText;
  });
  let $pResults = await page.$$eval(".i-timu>.content",async (nodes)=>{
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
}

//获取页面中知识点
async function getKnowledgePoint(){
  console.log("开始执行...")
  const brower = await puppeteer.launch();
  const page = await brower.newPage();
  //获取初中英语知识点
  let pageRes = await page.goto(koolearn.route.juniorhigh);
  console.log("开始获取分类...")
  let trees = await page.$eval(".i-left .i-card .i-tree div.content",async (el)=>{
    let itrees = [];
    let $jiParts = el.querySelectorAll(".ji-part");
    let index = 0;
    async function eachParts(i){
      console.log("i:",i)
      if(i === $jiParts.length){return false;}
      let $title = $jiParts[i].querySelector(".title");
      let $a = $title.querySelector("a");
      let $jiChapter = $jiParts[i].querySelector(".ji-chapter");
      let treeNode = {
        title:$a.textContent,
        route:$a.href,
        children:null
      }
      let treeChildrenNode = (function getchapters(chapter){
        let chapterNodes = [];
        let $jiChapterPiece = chapter.querySelectorAll(":scope>.ji-chapter-piece");
        for(let j = 0;j<$jiChapterPiece.length;j++){
          let $jiChapterPieceItem = $jiChapterPiece[j];
          let $a = $jiChapterPieceItem.querySelector("a");
          let $jiChapter = $jiChapterPieceItem.querySelector(".ji-chapter");
          let chapterNodeItem = {
            title:$a.textContent,
            route:$a.href
          }
          if($jiChapter){
            chapterNodeItem.children = getchapters($jiChapter);
          }
          chapterNodes.push(chapterNodeItem)
        }
        return chapterNodes;
      })($jiChapter);
      if(treeChildrenNode.length){
        treeNode.children = treeChildrenNode
      }
      itrees.push(treeNode)
      i++;
      await eachParts(i);
    }
    await eachParts(index);
    return itrees;
  });
  if(trees.length){
    console.log("分类获取成功")
  }
  console.log("分类获取结束");
  // console.log("打印trees:",JSON.stringify(trees,null,2))
  return trees;

}

//获取最后一级知识点的URL
async function getLastPoint(){
  let knowledgePoint = await getKnowledgePoint();
  let index = 0;
  let lastPoints = [];
  function getLast(i,tree) {
    if(i === tree.length)return false;
    let point = tree[i];
    let children = point.children;
    if(children && children.length){
      getLast(index,children);
    }else{
      lastPoints.push(point)
    }
    i++;
    getLast(i,tree);
  }
  getLast(index,knowledgePoint)
  return lastPoints;
}

//将数据库里面数据改为 tree
async function knowledgePointToTree(){
  let KnowLedgePointCount = await KnowLedgePoint.findAndCountAll();
  let pointRows = KnowLedgePointCount.rows;
  let pointTree = [];
  let index = 0;
  for(let i = 0;i<pointRows.length;i++){
    let point = pointRows[i];
    let parentId = point.parent_id;
    if(!parentId){
      pointTree.push({
        id:point.point_id,
        name:point.point_name,
        href:point.point_href,
        parentid:point.parent_id
      })
    }else{

    }
  }
  console.log(pointTree);
}



//插入知识点到数据库
async function insertKnowLedgePoint(){
  let index = 0;
  let knowledgePointTree = await getKnowledgePoint();
  async function insert(i,tree,parent_id){
    if(i === tree.length){return false;}
    let point = tree[i];
    let title = point.title,
      href = point.route,
      children = point.children;
    let createStse = {
      point_name:title,
      point_href:href
    }
    parent_id && (createStse.parent_id = parent_id);
    let klpoint = await KnowLedgePoint.create(createStse)
    let parentId = klpoint.point_id;
    if(children && children.length){
      await insert(index,children,parentId)
    }
    i++;
    await insert(i,tree,parent_id)
  }
  await insert(index,knowledgePointTree);
}

//获取题型类型
async function getTopicType(){
  const brower = await puppeteer.launch();
  const page = await brower.newPage();
  //获取初中英语知识点
  let pageRes = await page.goto(koolearn.route.juniorhigh);
  console.log("开始获取题型类型...")
  let types = await page.$eval(".p-selector1 ul",async (el)=>{
    let types = [];
    let $li = el.querySelectorAll("li");
    for(let i = 0;i<$li.length;i++){
      let li = $li[i];
      let type_value = li.getAttribute("type_id");
      let type_name = li.innerText;
      types.push({
        type_value:type_value,
        type_name:type_name
      })
    }
    return types;
  });
  if(types.length){
    console.log("题型获取成功")
  }
  console.log("题型获取结束");
  return types;
}

//插入题型类型到数据库
async function insertTopType(){
  let topictype = await getTopicType();
  let index = 0
  async function insert(i){
    if(i === topictype.length)return false;
    let types = topictype[i];
    let type_name = types.type_name,
        type_value = types.type_value;

    try{
      let topic_types = await TopicType.create({
        type_name,
        type_value
      })
    }catch(e){
      console.log(new Error(e));
    }

    i++;
    await insert(i);
  }
  await insert(index)
}

//获取难度类型
async function getTopicDiff() {
  const brower = await puppeteer.launch();
  const page = await brower.newPage();
  //获取初中英语知识点
  let pageRes = await page.goto(koolearn.route.juniorhigh);
  console.log("开始获取难度数据...")
  let diffs = await page.$eval(".p-selector2 ul",async (el)=>{
    let diffs = [];
    let $li = el.querySelectorAll("li");
    for(let i = 0;i<$li.length;i++){
      let li = $li[i];
      let diff_value = li.getAttribute("diff_id");
      let diff_name = li.innerText;
      diffs.push({
        diff_value:diff_value,
        diff_name:diff_name
      })
    }
    return diffs;
  });
  if(diffs.length){
    console.log("难度获取成功")
  }
  console.log("难度获取结束");
  return diffs;
}

//插入难度类型到数据库
async function insertTopicDiff(){
  let topicdiff = await getTopicDiff();
  let index = 0
  async function insert(i){
    if(i === topicdiff.length)return false;
    let diff = topicdiff[i];
    let diff_name = diff.diff_name,
      diff_value = diff.diff_value;

    try{
      let topic_diff = await TopicDiff.create({
        diff_name,
        diff_value
      })
    }catch(e){
      console.log(new Error(e));
    }

    i++;
    await insert(i);
  }
  await insert(index)
}

(async ()=>{
  //判断是否有知识点，如果没有就插入数据
  let KnowLedgePointCount = await KnowLedgePoint.findAndCountAll();
  if(!KnowLedgePointCount.count){
    insertKnowLedgePoint();
  }

  //判断是否有题型数据，如果没有就插入数据
  let TopicTypeCount = await TopicType.findAndCountAll();
  if(!TopicTypeCount.count){
    await insertTopType();
  }
  
  //判断是否有难度数据，如果没有就插入数据
  let TopicDiffCount = await TopicDiff.findAndCountAll();
  if(!TopicDiffCount.count){
    await insertTopicDiff();
  }

  await knowledgePointToTree();
})()



// app.listen(8080)





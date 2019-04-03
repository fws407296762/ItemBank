const express = require("express");
const app = express();
const https = require("https");
const puppeteer = require("puppeteer");



(async ()=>{
    
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
    await page.goto($pResults[0].answerhref);
        let $anResult = await page.$eval("#i-tab-content>div",async (node)=>{
            return node.innerText 
        })
        console.log($anResult);
    await browser.close();
})()



// app.listen(8080)
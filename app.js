//app.js
//package settings
const express = require('express');
const path = require('path')
const PORT = process.env.PORT || 8000
const app = express();


const siteData={
    title : "Men's 전당대부",
    address : "논현 8-9 엔타시아빌딩 4층"
}

// Specific folder example
app.use(express.static(path.join(__dirname,'public')));

//app setting
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(require('express-ejs-layouts'));
app.set('layout','layout/layout');

//listening
app.listen(PORT, () => console.log('Listening on http://localhost:${ '+PORT+' }'))


express().use(require('express-ejs-layouts'))
//route randering
//home
app.get('/', (req,res) => {
    app.locals.styleNo=0;
    res.render('index.ejs',{title:"HOME | " + siteData.title})
});
//회사소개
app.get('/int', (req, res) => {
    app.locals.styleNo=1;
    res.render(__dirname + '/views/int.ejs',{title:"회사소개 | "+siteData.title, 
    address: siteData.address
    });
})

//담보리스트
app.get('/dambolist', (req, res) => {
    app.locals.styleNo=2;
    res.render(__dirname + '/views/dambolist.ejs',{title:"담보목록 | "+siteData.title, 
    address: siteData.address
    })
 })
 //담보인정
 app.get('/dambo', (req, res) => {
    app.locals.styleNo=3;
    res.render(__dirname + '/views/dambo.ejs',{title:"담보인정 | "+siteData.title, 
    address: siteData.address
    })
  })
 //대출받기
  app.get('/loan', (req, res) => {
    app.locals.styleNo=4;
    res.render(__dirname + '/views/loan.ejs',{title:"대출받기 | "+siteData.title, 
    address: siteData.address
    })
  })


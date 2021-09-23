//app.js
//package settings
const express = require('express');
const path = require('path')
const PORT = process.env.PORT || 8000
const app = express();


const siteData = {
    title: "방구석 전당♡",
    address: "논현로 149길 엔타시아빌딩 4층"
}

// Specific folder example
app.use(express.static(path.join(__dirname, 'public')));

//app setting
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(require('express-ejs-layouts'));
app.set('layout', 'layout/layout');

//listening
app.listen(PORT, () => console.log('Listening on http://localhost:${ ' + PORT + ' }'))


express().use(require('express-ejs-layouts'))
//route randering
//home
app.get('/', (req, res) => {
    app.locals.styleNo = 0;
    res.render('index.ejs', {
        title: "HOME | " + siteData.title,
        address: siteData.address
    })
});

//담보리스트
app.get('/dambolist', (req, res) => {
    app.locals.styleNo = 1;
    res.render(__dirname + '/views/dambolist.ejs', {
        title: "취급품목 | " + siteData.title
        
    });
});
//대출받기;
app.get('/loan', (req, res) => {
    app.locals.styleNo = 2;
    res.render(__dirname + '/views/loan.ejs', {
        title: "대출받기 | " + siteData.title
    });
});
//담보인정
app.get('/dambo', (req, res) => {
    app.locals.styleNo = 2;
    res.render(__dirname + '/views/dambo.ejs', {
        title: "대출이력 | " + siteData.title
    });
});

//회원가입
app.get('/sign_up', (req, res) => {
    app.locals.styleNo = 4;
    res.render(__dirname + '/views/signup.ejs', {
        title: "회원가입 | " + siteData.title
    });
});

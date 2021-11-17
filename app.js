//app.js
//package settings
const {
    Router
} = require('express');
const express = require('express');
const path = require('path')
const PORT = process.env.PORT || 8000
const app = express();
const bodyParser = require('body-parser');
const { POINT_CONVERSION_UNCOMPRESSED } = require('constants');
const db_config = require(__dirname + '/public/js/db.js');
const conn = db_config.init();
db_config.connect(conn);

const siteData = {
    title: "방구석 전당♡",
    address: "논현로 149길 엔타시아빌딩 4층"
}

// Specific folder example
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));

//app setting
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(require('express-ejs-layouts'));
app.set('layout', 'layout/layout');

//listening
app.listen(PORT, () => console.log('Listening on http://localhost:${ ' + PORT + ' }'))
var loginsession = 0;

express().use(require('express-ejs-layouts'))
//route randering
//home
app.get('/', (req, res) => {
    app.locals.styleNo = 0;
    app.locals.login = loginsession;
    res.render('index.ejs', {
        title: "HOME | " + siteData.title,
        address: siteData.address
    })
});

//대출받기;
app.get('/loan', (req, res) => {
    app.locals.styleNo = 1;
    app.locals.login = loginsession;
    res.render(__dirname + '/views/loan.ejs', {
        title: "대출받기 | " + siteData.title
    });
});
//택배
app.get('/post', (req, res) => {
    app.locals.styleNo = 2;
    app.locals.login = loginsession;
    res.render(__dirname + '/views/post.ejs', {
        title: "배송안내 | " + siteData.title

    });
});
//한도문의

app.get('/dambo/:page', (req, res) => {
    app.locals.styleNo = 3;
    var page = req.params.page;
    var sql = "SELECT POST_NO, TITLE, date_format(WRITE_DATE,' %Y-%m-%d ')WRITE_DATE FROM MANSPAWNSHOP.LIMIT_SEARCH_POST ORDER BY POST_NO DESC";
    var serchPost = 'SELECT * FROM MANSPAWNSHOP.LIMIT_SEARCH_POST WHERE POST_NO = ?';
    conn.query(sql, function (err, rows) {
        if (err) console.error("err : " + err);
        else {
            app.locals.login = loginsession;
            res.render(__dirname + '/views/dambo.ejs', {
                title: "한도문의 | " + siteData.title,
                rows: rows, 
                page:page, 
                length:rows.length-1, 
                page_num:10, 
                pass:true

            });
        }
    });
});
//대출이력
app.get('/dambolist', (req, res) => {
    app.locals.styleNo = 4;
    app.locals.login = loginsession;
    res.render(__dirname + '/views/dambolist.ejs', {
        title: "대출이력 | " + siteData.title

    });
});
//마이페이지
app.get('/mypage', (req, res) => {
    app.locals.styleNo = 5;
    app.locals.login = loginsession;
    res.render(__dirname + '/views/mypage.ejs', {
        title: "마이페이지 | " + siteData.title

    });
});
//회원가입
app.get('/sign_up', (req, res) => {
    app.locals.styleNo = 6;
    app.locals.login = loginsession;
    res.render(__dirname + '/views/signup.ejs', {
        title: "로그인 | " + siteData.title
    });
});

app.post('/login_check', function(req,res){
    var name = req.body.id;
    var phoneNo = req.body.pn;
    if (name == '') {
        // 이름을 입력해주세요(팝업(?))
        console.log("이름을 입력해주세요.");
        res.redirect('/sign_up');
        return;
    } else if (phoneNo == '') {
        console.log("전화번호를 입력해주세요.");
        res.redirect('/sign_up');
        return;
    }
    var verNo = req.body.lang;

    var loginPN = [phoneNo];
    var loginData = [name, phoneNo];
    
    const sql = 'SELECT NAME FROM MANSPAWNSHOP.USER WHERE CALL_NO = ?';
    const insql = 'INSERT INTO MANSPAWNSHOP.USER(NAME, CALL_NO) VALUES(?, ?)';

    conn.query(sql, loginPN, function(err, result) {
        //if (인증번호 맞았는지) {
            if (err) {
                console.log('query is not excuted. insert fail...\n' + err);
                res.redirect('/sign_up');
                return;
            } else {
                if (result[0] == null) {
                    conn.query(insql, loginData, function(err) {
                        console.log(err);
                        if (err) {
                            // 서버 문제 DB 삽입 실패
                            console.log('query is not excuted. insert fail...\n' + err);
                            res.redirect('/sign_up');
                            return;
                        } else {
                            console.log("신규 회원 로그인 성공");
                            res.redirect('/');
                            loginsession = 1;
                        }
                    });
                } else {
                    if (result[0].NAME == name) {
                        console.log('기존 회원 로그인 성공')
                        res.redirect('/');
                        loginsession = 1;
                    } else {
                        // 로그인 실패
                        console.log("기존 회원 로그인 실패");
                        res.redirect('/sign_up');
                        return;
                    }
                }
        //} else {
            // 로그인 실패
            // res.redirect('/sign_up');
            //return;
        //}
    }});
});


app.get('/log_out', (req, res) => {
    loginsession = 0;
    res.redirect('/');
});
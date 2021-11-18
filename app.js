//app.js
//package settings
const express = require('express');
const router = express.Router();
const path = require('path')
const PORT = process.env.PORT || 8000
const app = express();
const bodyParser = require('body-parser');
const {
    POINT_CONVERSION_UNCOMPRESSED
} = require('constants');
const db_config = require(__dirname + '/public/js/db.js');
const conn = db_config.init();
db_config.connect(conn);
const fs = require('fs');
const multer = require('multer');
const { url } = require('inspector');


var loginsession = 0;
var localUserID = '';
var posttitle ='';
app.locals.login = loginsession;
var postno = [];
var postinfo = [];

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
app.listen(PORT, () => {
    var dir = './uploadedFiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    console.log('Listening on http://localhost:${ ' + PORT + ' }')
});

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
    res.render(__dirname + '/views/post.ejs', {
        title: "배송안내 | " + siteData.title

    });
});
//한도문의

app.get('/dambo?:page', (req, res) => {
    app.locals.styleNo = 3;
    app.locals.login = loginsession;
    var page = req.params.page;
    var sql = "SELECT POST_NO, TITLE, date_format(WRITE_DATE,' %Y-%m-%d ')WRITE_DATE,PASSWORD,CONTENT FROM MANSPAWNSHOP.LIMIT_SEARCH_POST ORDER BY POST_NO DESC";
    conn.query(sql, function (err, rows) {
        if (err) console.error("err : " + err);
        else {
            res.render(__dirname + '/views/dambo.ejs', {
                title: "한도문의 | " + siteData.title,
                rows: rows,
                page: page,
                length: rows.length - 1,
                page_num: 10,
                pass: true,
                postno:postno
            });
        }
        postinfo = rows;
    });

});
//대출이력
app.get('/loanlist', (req, res) => {
    app.locals.styleNo = 4;
    app.locals.login = loginsession;
    res.render(__dirname + '/views/loanlist.ejs', {
        title: "대출이력 | " + siteData.title

    });
});
//마이페이지
app.get('/mypage', (req, res) => {
    app.locals.styleNo = 5;
    res.render(__dirname + '/views/mypage.ejs', {
        title: "마이페이지 | " + siteData.title

    });
});
//로그인화면
app.get('/sign_up', (req, res) => {
    app.locals.styleNo = 6;
    res.render(__dirname + '/views/signup.ejs', {
        title: "로그인 | " + siteData.title
    });
});
//글싸기
app.get('/write', (req, res) => {
    app.locals.styleNo = 7;
    res.render(__dirname + '/views/write.ejs', {
        title: "글싸기 | " + siteData.title
    });
});
//글상세
app.get('/board?:postno', (req, res) => {
    var sex = req.params.postno;
    console.log(sex);
    app.locals.styleNo = 8;
    console.log(postinfo[sex]);
    var realsex = postinfo[sex];
    res.render(__dirname + '/views/board.ejs', {
        title: "한도 문의 본문 | "+ sex + siteData.title,
        realsex:realsex
    });
});
    


//로그아웃
app.get('/log_out', (req, res) => {
    localUserID = '';
    loginsession = 0;
    app.locals.login = loginsession;
    res.redirect('/');
});
//로그인체크
app.post('/login_check', function (req, res) {
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

    conn.query(sql, loginPN, function (err, result) {
        //if (인증번호 맞았는지) {
        if (err) {
            console.log('query is not excuted. insert fail...\n' + err);
            res.redirect('/sign_up');
            return;
        } else {
            if (result[0] == null) {
                conn.query(insql, loginData, function (err) {
                    console.log(err);
                    if (err) {
                        // 서버 문제 DB 삽입 실패
                        console.log('query is not excuted. insert fail...\n' + err);
                        res.redirect('/sign_up');
                        return;
                    } else {
                        console.log("신규 회원 로그인 성공");
                        localUserID = phoneNo;
                        loginsession = 1;
                        app.locals.login = loginsession;
                        res.redirect('/');
                    }
                });
            } else {
                if (result[0].NAME == name) {
                    console.log('기존 회원 로그인 성공');
                    localUserID = phoneNo;
                    loginsession = 1;
                    app.locals.login = loginsession;
                    res.redirect('/');
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
        }
    });
});

var storage = multer.diskStorage({ //  파일이름을 유지하기 위해 사용할 변수(중복방지를 위하여 시간을 넣어줫음)
    destination(req, file, cb) {
        cb(null, 'uploadedFiles/');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}__${file.originalname}`);
    },
});
var upload = multer({
    dest: 'uploadedFiles/'
}); // multer로 파일이 저장될 위치만을 설정
var uploadWithOriginalFilename = multer({
    storage: storage
}); // storage를 넣어 파일의 이름을 유지하는 미들웨어


app.post('/writesubmit', uploadWithOriginalFilename.array('FileName'), (req, res) => {
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;

    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var date = today.getDate();
    var write_date = String(year) + String(month) + String(date);

    var lastpostno = '';
    var subpostno = '';
    var postno = '';

    var datas = [];

    var sql = "SELECT POST_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM manspawnshop.limit_search_post B ORDER BY B.POST_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1';"

    conn.query(sql, async function (err, rows) {
        if (err) console.error("err : " + err);
        lastpostno = rows[0].POST_NO;
        subpostno = lastpostno.substr(0, 8);
        if (write_date == subpostno) {
            lastpostno = Number(lastpostno) + 1;
            lastpostno = String(lastpostno);
            postno = lastpostno;
        } else {
            postno = write_date + String('00001');
        }
        datas = [postno, title, write_date, content, localUserID, passwd];
        sql = "INSERT INTO MANSPAWNSHOP.LIMIT_SEARCH_POST(POST_NO, TITLE, WRITE_DATE, CONTENT, CALL_NO, PASSWORD) VALUES(?, ?, ?, ?, ?, ?)";
        conn.query(sql, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            res.redirect('/dambo1');
        });
    });
});
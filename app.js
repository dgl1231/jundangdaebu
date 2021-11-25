//app.js
//package settings
const express = require('express');
const router = express.Router();
const path = require('path');
const PORT = process.env.PORT || 8000;
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
const {
    url
} = require('inspector');
var mime = require('mime');
var iconvLite = require('iconv-lite');
const {
    exit
} = require('process');




var loginsession = 0;
var localUserID = '';
var posttitle = '';
app.locals.login = loginsession;
var postno = [];
var postinfo = [];
var datapostno;


app.locals.login = loginsession;

const siteData = {
    title: "방구석 전당♡",
    address: "논현로 149길 엔타시아빌딩 4층"
}



// Specific folder example
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: false
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

express().use(require('express-ejs-layouts'));
//route randering
//home
app.get('/', (req, res) => {
    app.locals.styleNo = 0;
    res.render('index.ejs', {
        title: "HOME | " + siteData.title,
        address: siteData.address
    });
});

//대출받기;
app.get('/loan', (req, res) => {
    app.locals.styleNo = 1;
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
    var sql = "SELECT POST_NO, TITLE, date_format(WRITE_DATE,' %Y-%m-%d ')WRITE_DATE,PASSWORD,CONTENT,CALL_NO FROM MANSPAWNSHOP.LIMIT_SEARCH_POST ORDER BY POST_NO DESC";
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
                postno: postno
            });
        }
        postinfo = rows;
        datapostno = rows.length;
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

    var loanState = ['LoanStatement01', 'LoanStatement02', 'LoanStatement03'];
    var loanStateDatas = new Array(3);
    var dbValues = new Array(2);
    var l = 1;

    localUserID = '123123';

    const loanStateSql = 'SELECT count(LOAN_NO) AS A FROM MANSPAWNSHOP.LOAN A WHERE A.CALL_NO = ? AND A.STATEMENT = ?';


    loanState.forEach(function (item, index, arr) {
        dbValues = [localUserID, item];

        conn.query(loanStateSql, dbValues, function (err, result) {
            if (err) {
                console.log('#!!#query is not excuted. insert fail...\n' + err);
                res.redirect('/mypage');
                return;
            } else {
                if (result == null) {} else {
                    loanStateDatas[index] = result[0].A;
                    console.log(loanStateDatas[index]);
                }
            }
        });
        l = 0;
    });

    while (l == 1) {}

    console.log('%%%%%%%%%%%');
    console.log(loanStateDatas);

    var loanInfoDatas = [
        ['Rolex', '50,000,000원', '2021.11.22', '대출 진행중'],
        ['1', '1'],
        ['11', '22']
    ];

    app.locals.styleNo = 5;
    var sql = "SELECT count(LOAN_NO) MANSPAWNSHOP.FROM LOAN A WHERE A.CALL_NO = ? AND STATEMENT = ? AND LOAN_DATE = ?";
    res.render(__dirname + '/views/mypage.ejs', {
        title: "마이페이지 | " + siteData.title,
        loanState: loanStateDatas,
        loanInfo: loanInfoDatas
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
var attached_P_N = [];
var realsex
var nowpn = 0;
app.get('/board?:postno', (req, res) => {
    var comment_content = [];
    var sex = req.params.postno;
    nowpn = sex;
    console.log("#1", postinfo[sex].CALL_NO);
    if (loginsession != 0) {
        console.log("#2", postinfo[sex].CALL_NO);
        if (postinfo[sex].CALL_NO == localUserID || loginsession == 5) {
            app.locals.styleNo = 8;
            realsex = postinfo[sex];
            var commentsql = "SELECT CONTENT FROM MANSPAWNSHOP.COMMENT WHERE POST_NO = ?";
            conn.query(commentsql, realsex.POST_NO, function (err, rows) {
                if (rows[0] == null) {
                    comment_content[0] = null;
                } else {
                    for (var i = 0; i < rows.length; i++) {
                        comment_content[i] = rows[i];
                        console.log("#i", i);
                    }
                }

            });

            var sql = 'SELECT * FROM ATTACHED_FILE WHERE ATTACHED_POST_NO = ?';
            var i;
            conn.query(sql, realsex.POST_NO, function (err, rows) {
                if (err) console.log(err);
                for (i = 0; i < rows.length; i++) {
                    attached_P_N[i] = rows[i];
                }
                res.render(__dirname + '/views/board.ejs', {
                    title: "한도 문의 본문 | " + sex + siteData.title,
                    comment_content: comment_content,
                    realsex: realsex,
                    attached_P_N: attached_P_N
                });
            });
        } else {
            res.send('<script type="text/javascript">alert("내 글만 볼 수 있어요!!");document.location.href="/";</script>');
        }

    } else if (loginsession == 0) {
        res.send('<script type="text/javascript">alert("내 글만 볼 수 있어요!!");document.location.href="/sign_up";</script>');
    }
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

const makeFolder = (dir) => {
    if (!fs.existsSync(dir)) {
        console.log(dir);
        fs.mkdirSync(dir, {
            recursive: true
        });
        console.log(dir);
    }
}
var filepath = '';
var storage = multer.diskStorage({ //  파일이름을 유지하기 위해 사용할 변수(중복방지를 위하여 시간을 넣어줫음)
    destination(req, file, cb) {
        makeFolder('uploadedFiles/' + localUserID + '/' + datapostno);
        filepath = 'uploadedFiles/' + localUserID + '/' + datapostno;
        cb(null, 'uploadedFiles/' + localUserID + '/' + datapostno);
    },
    filename(req, file, cb) {
        var today = new Date();
        changefilename = `${today.getFullYear()}${today.getMonth()+1}${today.getDate()}${today.getSeconds()}__${file.originalname}`;
        cb(null, `${today.getFullYear()}${today.getMonth()+1}${today.getDate()}${today.getSeconds()}__${file.originalname}`);
    },
});
var uploadWithOriginalFilename = multer({
    storage: storage,
    limits: {
        file: 10,
        fileSize: 1024 * 1024 * 1024
    }
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


    var files = req.files;

    var originalname = '',
        filename = '',
        mimetype = '',
        size = 0;

    var lastpostno = '';
    var subpostno = '';
    var postno = '';

    var datas = [];
    var attacheddatas = [];
    var filenokey = [];

    var sql = "SELECT POST_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM manspawnshop.limit_search_post B ORDER BY B.POST_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1';";
    conn.query(sql, function (err, rows) {
        if (err) console.error("err : " + err);
        if (rows[0] != null) {
            lastpostno = rows[0].POST_NO;
            subpostno = lastpostno.substr(0, 8);
            if (write_date == subpostno) {
                lastpostno = Number(lastpostno) + 1;
                lastpostno = String(lastpostno);
                postno = lastpostno;

            } else {
                postno = write_date + String('00001');
            }

        }
        if (rows[0] == null) {
            postno = write_date + String('00001');
        }

        datas = [postno, title, write_date, content, localUserID, passwd];


        sql = "INSERT INTO MANSPAWNSHOP.LIMIT_SEARCH_POST(POST_NO, TITLE, WRITE_DATE, CONTENT, CALL_NO, PASSWORD) VALUES(?, ?, ?, ?, ?, ?);";
        conn.query(sql, datas, async function (err, rows) {
            if (err) console.error("err : " + err);
            var attno = '';
            var attno2 = '';
            var subpostno = '';

            console.log('fuck2');
            var filesch = "SELECT ATTACHED_FILE_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM manspawnshop.attached_file B ORDER BY B.ATTACHED_FILE_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1'";
            await conn.query(filesch, function (err, rows) {
                if (err) console.error("err :" + err);
                console.log(rows);
                if (rows[0] != null) {
                    attno = rows[0].ATTACHED_FILE_NO;
                    subpostno = attno.substr(1, 8);
                    attno2 = attno.substr(1, 16);
                    if (write_date == subpostno) {
                        console.log("#있을때", attno2);
                        attno2 = Number(attno2) + 1;
                    } else {
                        attno2 = write_date + String('00000001');
                    }
                } else if (rows[0] == null) {
                    attno2 = write_date + String('00000001');
                    console.log("#없을때", attno2);
                }

                console.log("#시작", attno2);
                if (Array.isArray(files)) {
                    console.log('배열에 들어있는 파일 갯수 : %d', files.length);
                    for (var index = 0; index < files.length; index++) {
                        originalname = files[index].originalname;
                        filename = files[index].filename;
                        mimetype = files[index].mimetype;
                        size = files[index].size;
                        var filenumber = 'P' + String((Number(attno2) + index));
                        console.log('현재 파일 정보 : ' + originalname + ',  ' + filename + ',  ' + mimetype + ',  ' + size + ', ' + filenumber);
                        attacheddatas[index] = [filenumber, filepath, originalname, filename, size, mimetype, write_date, localUserID, postno];

                        sql = "INSERT INTO manspawnshop.attached_file(ATTACHED_FILE_NO, FILE_PATH, DEFAULT_FILE_NAME, STORED_FILE_NAME, FILE_SIZE, FILE_EXTENSION, REGI_DATE, CALL_NO, ATTACHED_POST_NO) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
                        conn.query(sql, attacheddatas[index], async function (err, rows) {
                            if (err) console.error("err : " + err);
                        });
                    }
                } else {
                    var index = 0;
                    console.log('파일 갯수 : 1');
                    originalname = files[index].originalname;
                    filename = files[index].filename;
                    mimetype = files[index].mimetype;
                    size = files[index].size;

                    var filenokey = filenoch(write_date);
                    attacheddatas[index] = [filenokey, filepath, originalname, filename, size, mimetype, write_date, localUserID, postno];
                    sql = "INSERT INTO manspawnshop.attached_file(ATTACHED_FILE_NO, FILE_PATH, DEFAULT_FILE_NAME, STORED_FILE_NAME, FILE_SIZE, FILE_EXTENSION, REGI_DATE, CALL_NO, ATTACHED_POST_NO) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
                    conn.query(sql, attacheddatas[index], async function (err, rows) {
                        if (err) console.error("err : " + err);
                    });
                }
            });


            res.redirect('/dambo1');
        });

    });

});

app.get('/download/:i', function (req, res, next) {
    console.log(req.params.i)
    var file_No = req.params.i;
    console.log(attached_P_N[file_No]);

    var file = attached_P_N[file_No].FILE_PATH + '/' + attached_P_N[file_No].STORED_FILE_NAME;

    try {
        if (fs.existsSync(file)) { // 파일이 존재하는지 체크
            var filename = path.basename(file); // 파일 경로에서 파일명(확장자포함)만 추출
            var mimetype = mime.getType(file); // 파일의 타입(형식)을 가져옴

            res.setHeader('Content-disposition', 'attachment; filename=' + getDownloadFilename(req, filename)); // 다운받아질 파일명 설정
            res.setHeader('Content-type', mimetype); // 파일 형식 지정

            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        } else {
            res.send('해당 파일이 없습니다.');
            return;
        }
    } catch (e) { // 에러 발생시
        console.log(e);
        res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.');
        return;
    }
});

function getDownloadFilename(req, filename) {
    var header = req.headers['user-agent'];

    if (header.includes("MSIE") || header.includes("Trident")) {
        return encodeURIComponent(filename).replace(/\\+/gi, "%20");
    } else if (header.includes("Chrome")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    } else if (header.includes("Opera")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    } else if (header.includes("Firefox")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    }
    return filename;
}


app.post('/commentsave', function (req, res, next) {
    var content = req.body.content;
    var contentNO = 0;
    var c_postno = realsex.POST_NO;
    console.log(realsex);
    var sql = "SELECT COMMENT_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM manspawnshop.comment B WHERE POST_NO = ? ORDER BY B.COMMENT_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1'; ";
    conn.query(sql, c_postno, function (err, rows) {
        if (err) console.error("err : " + err);
        if (rows[0] == null) {
            contentNO = 0;
        } else {
            contentNO = Number(rows[0].COMMENT_NO);
        }
        var commentdata = [contentNO + 1, c_postno, content];
        sql = 'INSERT INTO MANSPAWNSHOP.COMMENT(COMMENT_NO, POST_NO, CONTENT) VALUES(?, ?, ?);'
        conn.query(sql, commentdata, function (err, rows) {
            if (err) console.error("err : " + err);

        });
    });
    console.log(nowpn);
    res.redirect("/board" + nowpn);

});


app.get('/deliver', function (req, res, next) {
    app.locals.styleNo = 9;
    app.locals.login = loginsession;
    res.render(__dirname + '/views/deliver.ejs', {
        title: "대출이력 | " + siteData.title
    });

});

var lastloan_no = "";
var lastsec_no = "";
app.get('/menage', function (req, res, next) {
    app.locals.styleNo = 10;
    app.locals.login = loginsession;

    var sql = 'SELECT LOAN_NO FROM MANSPAWNSHOP.LOAN;';
    conn.query(sql, function (err, a_rows) {
        if (err) console.error("err : " + err);
        if (a_rows[0].LOAN_NO == null) {} else {
            sql = 'SELECT LOAN_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM manspawnshop.LOAN B ORDER BY B.LOAN_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE ROWNUM = 1;';
            conn.query(sql, function (err, a_rows) {
                if (err) console.error("err : " + err);
                lastloan_no = a_rows[0].LOAN_NO;
            });

            sql = 'SELECT SEC_NO FROM MANSPAWNSHOP.SECURITY;'
            conn.query(sql, function (err, b_rows) {
                if (err) console.error("err : " + err);
                if (b_rows[0].SEC_NO == null) {} else {
                    sql = 'SELECT SEC_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM manspawnshop.security B ORDER BY B.SEC_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE ROWNUM = 1;';
                    conn.query(sql, function (err, b_rows) {
                        if (err) console.error("err : " + err);
                        lastsec_no = b_rows[0].SEC_NO;
                    });
                }
            });

        }
    });
    res.render(__dirname + '/views/menage.ejs', {
        title: "관리페이지 | " + siteData.title,
        lastloan_no:lastloan_no,
        lastsec_no:lastsec_no
    });

});

var loan_date = '';
var give_date = '';
var filepath = '';
var storage = multer.diskStorage({ //  파일이름을 유지하기 위해 사용할 변수(중복방지를 위하여 시간을 넣어줫음)
    destination(req, file, cb) {
        makeFolder('uploadedFiles/' + 'loan' + '/' + loan_date + '/' + give_date);
        filepath = 'uploadedFiles/' + 'loan' + '/' + loan_date + '/' + give_date;
        cb(null, 'uploadedFiles/' + 'loan' + '/' + loan_date + '/' + give_date);
    },
    filename(req, file, cb) {
        var today = new Date();
        changefilename = `${give_date}__${file.originalname}`;
        cb(null, `${give_date}__${file.originalname}`);
    },
});
var upload = multer({
    storage: storage,
    limits: {
        file: 10,
        fileSize: 1024 * 1024 * 1024
    }
});

app.post('/loanwrite', upload.array('FileName'), function (req, res, next) {

    var total_loan = req.body.total_loan;
    var principal = req.body.principal;
    var repayment = req.body.repayment;
    loan_date = req.body.loan_date;
    var expirationed = req.body.expirationed;
    var expenses = req.body.expenses;
    var day_loan = req.body.day_loan;
    var interest = req.body.interest;
    var state = req.body.state;
    give_date = req.body.give_date;
    var brand = req.body.brand;
    var price = req.body.price;
    var get_date = req.body.get_date;
    var product = req.body.product;
    
    

    var phone = req.body.phone;

    var loan_no = '';
    var sec_no = '';

    var loan_data = [];
    var sec_data = [];

    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var date = today.getDate();
    var today_date = String(year) + String(month) + String(date);

    console.log("#1 lastloan_no",lastloan_no);
    if (lastloan_no != null) {
        var loandt = lastloan_no.substr(1, 8);
        if (loandt == today_date) {
            loandt = lastloan_no.substr(1, 16);
            loan_no = Number(loandt) + 1;
            loan_no = String(loan_no);
            loan_no = 'L' + loan_no;
            console.log("#1 loan_no",loan_no);
        }
    } else {
        loan_no = 'L' + today_date + String('00000001');
        console.log("#2 loan_no",loan_no);
    }
    
    loan_data = [loan_no, total_loan, principal, repayment, loan_date, expirationed, expenses, day_loan, interest, phone]
    var sql = 'INSERT INTO MANSPAWNSHOP.LOAN VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    conn.query(sql,loan_data, function (err, rows) {
        if (err) console.error("err : " + err);

    });

    if (lastsec_no != null) {
        var loandt = lastsec_no.substr(0, 7);
        if (loandt == today_date) {
            loandt = lastsec_no.substr(11,15);
            sec_no = today_date+product+loandt;
            sec_no = String(sec_no);
            console.log("#3 sec_no",sec_no);

        }
    } else {
        sec_no = today_date +product+ String('00001');
        console.log("#4 sec_no",sec_no);
    }
    
    sec_data = [sec_no, give_date, brand, price, get_date, , phone, loan_no];
    sql = 'INSERT INTO MANSPAWNSHOP.SECURITY VALUES (?, ?, ?, ?, ?, ?, ?)';
    conn.query(sql,sec_data, function (err, rows) {
        if (err) console.error("err : " + err);

    });
    res.redirect('/menage');
});
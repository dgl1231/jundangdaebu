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
const { query } = require('express');




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
app.get('/mypage?', (req, res) => {

    localUserID = '123123';

    var url = req.url.split('?');
    var queryData = new Array();

    app.locals.styleNo = 5;

    var loanStateDatas = new Array(3);
    var loanInfoDatas = new Array();
    var loanDateDatas = new Array();
    var searchDate = new Array();

    if(url[1] != null) { 
        var params = new URLSearchParams(url[1]);
        queryData = [localUserID, params.get('date1'), params.get('date2')];
        searchDate = [params.get('date1'), params.get('date2')];
    } else {
        var today = new Date();

        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var day = today.getDate();

        var _today = year + "-" + month + "-" + day;

        queryData = [localUserID, '2021-11-22', _today];
        searchDate = ['2021-11-22', _today];
    }

    const loanStateSql = 'SELECT COUNT(LOAN_NO) AS count FROM MANSPAWNSHOP.LOAN A WHERE A.CALL_NO = ? AND LOAN_DATE between ? AND ? GROUP BY STATEMENT;';
    const loanInfoSql = 'SELECT * FROM ( SELECT * FROM (SELECT A.LOAN_PRINCIPAL, A.LOAN_DATE, A.STATEMENT, B.PRODUCT FROM MANSPAWNSHOP.LOAN AS A LEFT OUTER JOIN( SELECT * FROM MANSPAWNSHOP.security ) AS B ON (B.LOAN_NO = A.LOAN_NO) WHERE A.CALL_NO = ? ) AS C LEFT OUTER JOIN( SELECT *  FROM manspawnshop.code_entity ) AS D ON (C.PRODUCT = D.C_ID) WHERE C.LOAN_DATE BETWEEN ? AND ?) AS E LEFT OUTER JOIN( SELECT F.C_ID AS LOAN_ID , F.C_NAME AS STATENAME FROM manspawnshop.code_entity F ) AS G ON (E.STATEMENT = G.LOAN_ID) ORDER BY LOAN_ID DESC';
    const loanDateSql = 'SELECT LOAN_DATE, COUNT(LOAN_DATE) AS COUNT FROM MANSPAWNSHOP.LOAN WHERE CALL_NO = ? AND LOAN_DATE between ? AND ? GROUP BY LOAN_DATE ORDER BY LOAN_DATE DESC';

    conn.query(loanStateSql, queryData, function (err, result) {
        if (err) {
            console.log('#!!#query is not excuted. insert fail...\n' + err);
            res.redirect('/mypage');
            return;
        } else {
            if (result == null) {} else {
                loanStateDatas = result;

                conn.query(loanInfoSql, queryData, function (err, result) {
                    if (err) {
                        console.log('#!!#query is not excuted. insert fail...\n' + err);
                        res.redirect('/mypage');
                        return;
                    } else {
                        if (result == null) {
                            loanInfoDatas = null;
                        } else {
                            for (var i = 0; i < result.length; i++) {
                                var a = result[i].LOAN_PRINCIPAL;
                                a = String(a);
                                var _length = a.length;
                                var position = 1;
                                var h = _length % 3;
                                var _mod = _length / 3;
                                var n = 0;

                                if (h == 1) {
                                    position = 1;
                                } else if (h == 2) {
                                    position = 2;
                                } else {
                                    position = 3;
                                }

                                for (; n < _mod; n++) {
                                    if (h == 0 || position >= _length) {
                                        break;
                                    }
                                    a = [a.slice(0, position), ',', a.slice(position)].join('');
                                    position += 4;
                                }

                                result[i].LOAN_PRINCIPAL = a;
                                loanInfoDatas.push(result[i]);
                            }

                            conn.query(loanDateSql, queryData, function (err, result) {
                                var count = 0
                                if (err) {
                                    console.log('#!!#query is not excuted. insert fail...\n' + err);
                                    res.redirect('/mypage');
                                    return;
                                } else {
                                    if (result == null) {} else {
                                        for (var i = 0; i < result.length; i++) {
                                            count += result[i].COUNT;
                                        }
                                        loanDateDatas = result;
                                    }
                                }

                                res.render(__dirname + '/views/mypage.ejs', {
                                    title: "마이페이지 | " + siteData.title,
                                    loanState: loanStateDatas,
                                    loanInfo: loanInfoDatas,
                                    loanDate: loanDateDatas,
                                    searchDate: searchDate,
                                    count: count
                                });
                            });
                        }
                    }
                });
            }
        }
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
app.get('/board?:postno', (req, res) => {
    var comment_content = [];
    var sex = req.params.postno;
    if (loginsession != 0) {
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

    var sql = "SELECT COMMENT_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM manspawnshop.comment B WHERE POST_NO = ? ORDER BY B.COMMENT_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1'; ";
    conn.query(sql, c_postno, function (err, rows) {
        if (err) console.error("err : " + err);
        if (rows[0] == null) {
            contentNO = 0;
            console.log("###############################");

        } else {
            console.log("###############################");
            console.log("#1", rows[0].COMMENT_NO, contentNO);
            contentNO = Number(rows[0].COMMENT_NO);
            console.log("#2", rows[0].COMMENT_NO, contentNO);
        }
        var commentdata = [contentNO + 1, c_postno, content];
        console.log("#end", contentNO);
        console.log("###############################");
        sql = 'INSERT INTO MANSPAWNSHOP.COMMENT(COMMENT_NO, POST_NO, CONTENT) VALUES(?, ?, ?);'
        conn.query(sql, commentdata, function (err, rows) {
            if (err) console.error("err : " + err);
        });
    });
});
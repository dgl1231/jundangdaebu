//app.js
//package settings
const express = require('express');
const router = express.Router();
const path = require('path');
const PORT = normalizePort(process.env.PORT || '8001');;
const app = express();
const PROMISE = require("bluebird");
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
const {
    query
} = require('express');
const {
    CONNREFUSED
} = require('dns');
const e = require('express');
const {
    resolve
} = require('path');


function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}




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
    var dir = __dirname + '/public/' + '/uploadedFiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    console.log(dir);
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
    var sql = "SELECT POST_NO, TITLE, date_format(WRITE_DATE,' %Y-%m-%d ')WRITE_DATE,PASSWORD,CONTENT,CALL_NO FROM dgl1231.limit_search_post ORDER BY POST_NO DESC";
    conn.query(sql, function(err, rows) {
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
    var loandocu_path = '';
    const loanListSql = "SELECT LOAN_NO, LOAN_PRINCIPAL, PRODUCT, G_ID, G_NAME, NAME, STORED_DOCU_NAME, DOCU_PATH FROM (SELECT l.loan_no, LOAN_PRINCIPAL, PRODUCT, ce.G_ID, G_NAME, u.NAME FROM dgl1231.loan l, dgl1231.security s, dgl1231.code_entity ce, dgl1231.code_group cg, dgl1231.user u WHERE l.loan_no = s.loan_no AND ce.C_ID = s.PRODUCT AND cg.G_ID = ce.G_ID AND l.CALL_NO = u.CALL_NO ORDER BY l.loan_no DESC) AS FIR LEFT OUTER JOIN(SELECT DISTINCT A.STORED_DOCU_NAME, A.DOCU_PATH, A.LOAN_NO AS L_N FROM dgl1231.document A, (SELECT @ROWNUM := 0) B WHERE A.DOCU_G = '11') AS SEC ON (FIR.LOAN_NO = SEC.L_N) GROUP BY LOAN_NO ORDER BY LOAN_NO DESC;";

    conn.query(loanListSql, function(err, result) {
        if (err) console.error("err : " + err);
        else {
            if (result[0] == null) {
                result = null;
            } else {
            }
            for (var i = 0; i < result.length; i++) {

                loandocu_path = result[i].DOCU_PATH;
                loandocu_path = loandocu_path.substr(59, loandocu_path.length);
                result[i].DOCU_PATH = loandocu_path;
            }

            res.render(__dirname + '/views/loanlist.ejs', {
                title: "대출이력 | " + siteData.title,
                loanInfos: result,
                length: result.length
            });
        }
    });
});
var attached_P_N = [];
//마이페이지
app.get('/mypage?', async(req, res) => {

    if (loginsession == 1 || loginsession == 5) {
        app.locals.styleNo = 5;

        var url = req.url.split('?');
        var url_board = '';
        var queryData = new Array();


        var loanStateDatas = new Array(3);
        var loanInfoDatas = new Array();
        var loanDateDatas = new Array();
        var searchDate = new Array();
        var docuCount = new Array();
        var documents = new Array();
        var myPage_postno = new Array();
        var page = 0;
        var length = 0;
        var count = 0;
        var myBoard = 0;

        if (url[1] != null) {
            url_board = url[1].split('=');
            if (url_board[0] != 'myBoard') {
                myBoard = 0;
                var params = new URLSearchParams(url[1]);
                queryData = [localUserID, params.get('date1'), params.get('date2')];
                searchDate = [params.get('date1'), params.get('date2')];
            } else {
                myBoard = 1;
                page = Number(url_board[1]);

                const boardSql = "SELECT POST_NO, TITLE, date_format(WRITE_DATE,' %Y-%m-%d ')WRITE_DATE,PASSWORD,CONTENT,CALL_NO FROM dgl1231.limit_search_post WHERE CALL_NO = ? ORDER BY POST_NO DESC";
                conn.query(boardSql, [localUserID], function(err, rows) {
                    if (err) console.error("err : " + err);
                    else {
                        length = rows.length - 1;
                        res.render(__dirname + '/views/mypage.ejs', {
                            title: "마이페이지 | " + siteData.title,
                            myBoard: myBoard,
                            postno: myPage_postno,
                            page: page,
                            rows: rows,
                            length: length
                        });
                        postinfo = rows;
                    }
                });
                return;
            }
        } else {
            var today = new Date();

            var year = today.getFullYear();
            var month = today.getMonth() + 1;
            var day = today.getDate();

            if ((month / 10) < 1) {
                month = '0' + month;
            }
            if ((day / 10) < 1) {
                day = '0' + day;
            }

            var _today = year + "-" + month + "-" + day;

            queryData = [localUserID, '2021-11-22', _today];
            searchDate = ['2021-11-22', _today];
        }

        const loanStateSql = 'SELECT COUNT(LOAN_NO) AS count FROM dgl1231.loan A WHERE A.CALL_NO = ? AND LOAN_DATE between ? AND ? GROUP BY STATEMENT;';
        const loanInfoSql = "SELECT *, date_format(LOAN_DATE,' %Y-%m-%d ') AS LOAN_DATE FROM ( SELECT * FROM (SELECT A.LOAN_PRINCIPAL, A.LOAN_DATE , A.STATEMENT, A.LOAN_NO, B.PRODUCT FROM dgl1231.loan AS A LEFT OUTER JOIN( SELECT * FROM dgl1231.security ) AS B ON (B.LOAN_NO = A.LOAN_NO) WHERE A.CALL_NO = ?) AS C LEFT OUTER JOIN( SELECT *  FROM dgl1231.code_entity ) AS D ON (C.PRODUCT = D.C_ID) WHERE C.LOAN_DATE BETWEEN ? AND ?) AS E LEFT OUTER JOIN( SELECT F.C_ID AS LOAN_ID , F.C_NAME AS STATENAME FROM dgl1231.code_entity F ) AS G ON (E.STATEMENT = G.LOAN_ID) ORDER BY LOAN_NO DESC";
        const loanDateSql = "SELECT date_format(LOAN_DATE,' %Y-%m-%d ') AS LOAN_DATE, COUNT(LOAN_DATE) AS COUNT FROM dgl1231.loan WHERE CALL_NO = ? AND LOAN_DATE between ? AND ? GROUP BY LOAN_DATE ORDER BY LOAN_DATE DESC";
        const documentCountSql = 'SELECT A.LOAN_NO, COUNT(B.DOCU_NO) AS count FROM (SELECT * FROM dgl1231.loan WHERE CALL_NO = ? AND LOAN_DATE BETWEEN ? AND ?) A LEFT OUTER JOIN(SELECT * FROM document) B ON (A.LOAN_NO = B.LOAN_NO) GROUP BY LOAN_NO ORDER BY A.LOAN_NO DESC';
        const documentsSql = 'SELECT * FROM dgl1231.document WHERE CALL_NO = ? AND SEND_IN_DATE BETWEEN ? AND ? ORDER BY LOAN_NO DESC';

        conn.query(loanStateSql, queryData, function(err, result) {
            if (err) {
                console.log('#!!#query is not excuted. insert fail...\n' + err);
                res.redirect('/mypage');
                return;
            } else {
                if (result[0] == null) {
                    loanStateDatas = null;
                    loanInfoDatas = null;
                    loanDateDatas = null;
                    docuCount = null;
                    documents = null;

                    res.render(__dirname + '/views/mypage.ejs', {
                        title: "마이페이지 | " + siteData.title,
                        loanState: loanStateDatas,
                        loanInfo: loanInfoDatas,
                        loanDate: loanDateDatas,
                        documents: documents,
                        searchDate: searchDate,
                        docuCount: docuCount,
                        count: count,
                        myBoard: myBoard
                    });
                } else {
                    loanStateDatas = result;

                    conn.query(loanInfoSql, queryData, function(err, result) {
                        if (err) {
                            console.log('#!!#query is not excuted. insert fail...\n' + err);
                            res.redirect('/mypage');
                            return;
                        } else {
                            if (result[0] == null) {} else {
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
                                        if (position >= _length) {
                                            break;
                                        }

                                        a = [a.slice(0, position), ',', a.slice(position)].join('');
                                        position += 4;
                                    }

                                    result[i].LOAN_PRINCIPAL = a;
                                    loanInfoDatas.push(result[i]);
                                }

                                conn.query(loanDateSql, queryData, function(err, result) {
                                    if (err) {
                                        console.log('#!!#query is not excuted. insert fail...\n' + err);
                                        res.redirect('/mypage');
                                        return;
                                    } else {
                                        if (result[0] == null) {} else {
                                            for (var i = 0; i < result.length; i++) {
                                                count++;
                                            }
                                            loanDateDatas = result;

                                            conn.query(documentCountSql, queryData, function(err, result) {
                                                if (err) {
                                                    console.log('#!!#query is not excuted. insert fail...\n' + err);
                                                    res.redirect('/mypage');
                                                    return;
                                                } else {
                                                    if (result[0] == null) {
                                                        docuCount = null;
                                                        documents = null;
                                                    } else {
                                                        docuCount = result;
                                                    }
                                                    conn.query(documentsSql, queryData, function(err, result) {

                                                        if (err) {
                                                            console.log('#!!#query is not excuted. insert fail...\n' + err);
                                                            res.redirect('/mypage');
                                                            return;
                                                        } else {
                                                            if (result[0] == null) {
                                                                documents = null;
                                                            } else {
                                                                documents = result;
                                                                attached_P_N = result;
                                                            }

                                                            res.render(__dirname + '/views/mypage.ejs', {
                                                                title: "마이페이지 | " + siteData.title,
                                                                loanState: loanStateDatas,
                                                                loanInfo: loanInfoDatas,
                                                                loanDate: loanDateDatas,
                                                                documents: documents,
                                                                searchDate: searchDate,
                                                                docuCount: docuCount,
                                                                count: count,
                                                                myBoard: myBoard
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });

                }
            }
        });
    } else {
        res.send('<script type="text/javascript">alert("로그인 해주세요!");document.location.href="/sign_up";</script>');
    }
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

var realsex = [];
var nowpn = 0;
app.get('/board?:postno', (req, res) => {
    var comment_content = [];
    attached_P_N = [];
    realsex = [];


    var sex = req.params.postno;
    nowpn = sex;
    if (loginsession != 0) {
        if (postinfo[sex].CALL_NO == localUserID || loginsession == 5) {
            app.locals.styleNo = 8;
            realsex = postinfo[sex];
            var commentsql = "SELECT CONTENT FROM dgl1231.comment WHERE POST_NO = ?";
            conn.query(commentsql, realsex.POST_NO, function(err, rows) {
                if (rows[0] == null) {
                    comment_content[0] = null;
                } else {
                    for (var i = 0; i < rows.length; i++) {
                        comment_content[i] = rows[i];
                    }
                }

            });

            var sql = 'SELECT * FROM attached_file WHERE ATTACHED_POST_NO = ?';
            var i;
            conn.query(sql, realsex.POST_NO, function(err, rows) {
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
app.post('/login_check', function(req, res) {
    var name = req.body.id;
    var phoneNo = req.body.pn;
    if (name == '') {
        // 이름을 입력해주세요(팝업(?))
        res.send('<script type="text/javascript">alert("이름을 입력해주세요.");document.location.href="/sign_up";</script>');
        return;
    } else if (phoneNo == '') {
        res.send('<script type="text/javascript">alert("전화번호를 입력해주세요.");document.location.href="/sign_up";</script>');
        return;
    } else if (name.length < 2) {
        res.send('<script type="text/javascript">alert("다시 입력해주세요.");document.location.href="/sign_up";</script>');
        return;
    } else if (phoneNo.length != 11) {
        res.send('<script type="text/javascript">alert("다시 입력해주세요.");document.location.href="/sign_up";</script>');
        return;
    }
    var verNo = req.body.lang;

    var loginPN = [phoneNo];
    var loginData = [name, phoneNo];

    const sql = 'SELECT NAME FROM dgl1231.user WHERE CALL_NO = ?';
    const insql = 'INSERT INTO dgl1231.user(NAME, CALL_NO) VALUES(?, ?)';

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
                        localUserID = phoneNo;
                        loginsession = 1;
                        app.locals.login = loginsession;
                        res.redirect('/');
                    }
                });
            } else {
                if (result[0].NAME == name) {
                    localUserID = phoneNo;
                    usersql = 'SELECT USER_CODE FROM dgl1231.user WHERE CALL_NO = ?'
                    conn.query(usersql, localUserID, function(err, usercode) {
                        if (err) console.log("err : ", err);
                        if (usercode[0].USER_CODE == null) {
                            loginsession = 1;
                            app.locals.login = loginsession;
                            res.redirect('/');
                        } else {
                            loginsession = 5;
                            app.locals.login = loginsession;
                            res.redirect('/');
                        }
                    });
                } else {
                    // 로그인 실패
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
        fs.mkdirSync(dir, {
            recursive: true
        });
        console.log(dir);
    }

}
var filepath = '';
var storage = multer.diskStorage({ //  파일이름을 유지하기 위해 사용할 변수(중복방지를 위하여 시간을 넣어줫음)
    destination(req, file, cb) {
        makeFolder(__dirname + '/public/' + 'uploadedFiles/' + localUserID + '/' + datapostno);
        filepath = __dirname + '/public/' + 'uploadedFiles/' + localUserID + '/' + datapostno;
        cb(null, __dirname + '/public/' + 'uploadedFiles/' + localUserID + '/' + datapostno);
    },
    filename(req, file, cb) {
        var today = new Date();
        var month = today.getMonth() + 1;
        var day = today.getDate()

        if ((month / 10) < 1) {
            month = '0' + month;
        }
        if ((day / 10) < 1) {
            day = '0' + day;
        }

        changefilename = `${today.getFullYear()}${month}${day}${today.getSeconds()}__${file.originalname}`;
        cb(null, `${today.getFullYear()}${month}${day}${today.getSeconds()}__${file.originalname}`);
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

    if ((month / 10) < 1) {
        month = '0' + month;
    }
    if ((date / 10) < 1) {
        date = '0' + date;
    }

    var write_date = String(year) + String(month) + String(date);

    var files = null;
    files = req.files;

    var originalname = '',
        filename = '',
        mimetype = '',
        size = 0;

    var lastpostno = '';
    var subpostno = '';
    var postno = '';

    var datas = [];
    var attacheddatas = [];

    var sql = "SELECT POST_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM dgl1231.limit_search_post B ORDER BY B.POST_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1';";
    conn.query(sql, function(err, rows) {
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


        sql = "INSERT INTO dgl1231.limit_search_post(POST_NO, TITLE, WRITE_DATE, CONTENT, CALL_NO, PASSWORD) VALUES(?, ?, ?, ?, ?, ?);";

        conn.query(sql, datas, async function(err, rows) {

            if (err) console.error("err : " + err);
            var attno = '';
            var attno2 = '';
            var subpostno = '';

            var filesch = "SELECT ATTACHED_FILE_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM dgl1231.attached_file B ORDER BY B.ATTACHED_FILE_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1'";
            await conn.query(filesch, function(err, rows) {
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

                        sql = "INSERT INTO dgl1231.attached_file(ATTACHED_FILE_NO, FILE_PATH, DEFAULT_FILE_NAME, STORED_FILE_NAME, FILE_SIZE, FILE_EXTENSION, REGI_DATE, CALL_NO, ATTACHED_POST_NO) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
                        conn.query(sql, attacheddatas[index], async function(err, rows) {
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

                    var filenumber = 'P' + String((Number(attno2) + index));
                    attacheddatas[index] = [filenumber, filepath, originalname, filename, size, mimetype, write_date, localUserID, postno];
                    sql = "INSERT INTO dgl1231.attached_file(ATTACHED_FILE_NO, FILE_PATH, DEFAULT_FILE_NAME, STORED_FILE_NAME, FILE_SIZE, FILE_EXTENSION, REGI_DATE, CALL_NO, ATTACHED_POST_NO) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
                    conn.query(sql, attacheddatas[index], async function(err, rows) {
                        if (err) console.error("err : " + err);
                    });
                }
            });
            res.redirect('/dambo1');
        });

    });

});

app.get('/download/:i', function(req, res, next) {
    console.log(req.params.i);
    var file_No = req.params.i;
    console.log(attached_P_N[file_No]);


    if (app.locals.styleNo == 8) {
        var file = attached_P_N[file_No].FILE_PATH + '/' + attached_P_N[file_No].STORED_FILE_NAME;
    } else if (app.locals.styleNo == 5) {
        var file = attached_P_N[file_No].DOCU_PATH + '/' + attached_P_N[file_No].STORED_DOCU_NAME;
    }


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


app.post('/commentsave', function(req, res, next) {
    var content = req.body.content;
    var contentNO = 0;
    var c_postno = realsex.POST_NO;
    console.log(realsex);
    var sql = "SELECT COMMENT_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM dgl1231.comment B WHERE POST_NO = ? ORDER BY B.COMMENT_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1'; ";
    conn.query(sql, c_postno, function(err, rows) {
        if (err) console.error("err : " + err);
        if (rows[0] == null) {
            contentNO = 0;
        } else {
            contentNO = Number(rows[0].COMMENT_NO);
        }
        var commentdata = [contentNO + 1, c_postno, content];

        sql = 'INSERT INTO dgl1231.comment(COMMENT_NO, POST_NO, CONTENT) VALUES(?, ?, ?);';
        conn.query(sql, commentdata, function(err, rows) {

            if (err) console.error("err : " + err);

        });
    });

    console.log(nowpn);
    res.redirect("/board" + nowpn);

});


app.get('/deliver', function(req, res, next) {
    if (loginsession != 0) {
        app.locals.styleNo = 9;
        app.locals.login = loginsession;
        res.render(__dirname + '/views/deliver.ejs', {
            title: "대출이력 | " + siteData.title
        });
        res.send('<script type="text/javascript">alert("로그인 해주세요!");document.location.href="/sign_up";</script>');
    } else if (loginsession == 0) {
        res.send('<script type="text/javascript">alert("로그인 해주세요!");document.location.href="/sign_up";</script>');
    }
});

var lastloan_no = "";
var lastsec_no = "";

var lastrepay_no = "";
var loaninfo = [];
var secinfo = [];

app.get('/menage', function(req, res, next) {
    app.locals.styleNo = 10;
    app.locals.login = loginsession;


    var sql = 'SELECT LOAN_NO FROM dgl1231.loan;';
    conn.query(sql, function(err, l_rows) {
        if (err) console.error("err : " + err);
        if (l_rows[0] == null) {
            lastloan_no = null;
            lastsec_no = null;

        } else {

            sql = 'SELECT LOAN_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM dgl1231.loan B ORDER BY B.LOAN_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE ROWNUM = 1;';
            conn.query(sql, function(err, l_rows) {
                if (err) console.error("err : " + err);
                lastloan_no = l_rows[0].LOAN_NO;
                console.log("lastloan_no", lastloan_no);
                var loansql = 'SELECT * FROM dgl1231.loan;';
                conn.query(loansql, function(err, l_rows) {
                    loaninfo = l_rows;
                });


            });

            sql = 'SELECT SEC_NO FROM dgl1231.security;';
            conn.query(sql, function(err, s_rows) {
                if (err) console.error("err : " + err);
                if (s_rows[0] == null) {} else {
                    sql = 'SELECT SEC_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM dgl1231.security B ORDER BY B.SEC_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE ROWNUM = 1;';

                    conn.query(sql, function(err, s_rows) {
                        if (err) console.error("err : " + err);
                        lastsec_no = s_rows[0].SEC_NO;
                        console.log("lastsec_no", lastsec_no);
                        var secsql = 'SELECT * FROM dgl1231.security;';
                        conn.query(secsql, function(err, s_rows) {
                            secinfo = s_rows;
                        });
                    });
                }
            });
        }
    });

    var repayselectsql = 'SELECT REPAY_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM dgl1231.repayment B ORDER BY B.REPAY_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE ROWNUM = 1;';
    conn.query(repayselectsql, function(err, r_rows) {
        if (r_rows[0] == null) {
            lastrepay_no = null;
        } else {

            lastrepay_no = r_rows[0].REPAY_NO;
        }
    });
    var docu_noSql = "SELECT DOCU_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM dgl1231.document B ORDER BY B.DOCU_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1'";
    conn.query(docu_noSql, function(err, d_rows) {
        if (d_rows[0] == null) {
            console.log("null", d_rows[0])
        } else {
            console.log("no", d_rows[0])
        }
    });

    res.render(__dirname + '/views/menage.ejs', {
        title: "관리페이지 | " + siteData.title,
        lastloan_no: lastloan_no,
        lastsec_no: lastsec_no,
        loaninfo: loaninfo,
        secinfo: secinfo,
    });

});

var loan_p_no = 0;









app.get('/loansecmanage?:page', function(req, res, next) {

    var cn = loaninfo.CALL;
    var email_loan = [];
    app.locals.styleNo = 11;
    app.locals.login = loginsession;
    var page = req.params.page;
    var data = [];
    var bbb = "SELECT l.*,s.SEC_NO, s.SEND_IN_DATE, s.RECEIVE_DATE, s.BRAND, cg.G_NAME, u.MAIL_ADDR FROM loan l, security s, code_entity ce, code_group cg, user u WHERE l.loan_no = s.loan_no AND s.PRODUCT = ce.C_ID AND ce.G_ID = cg.G_ID AND u.CALL_NO = l.CALL_NO ORDER BY l.LOAN_NO DESC;"
    conn.query(bbb, cn, function(err, sss) {
        data = sss;
    });

    var sql = "SELECT LOAN_NO FROM dgl1231.loan ORDER BY LOAN_NO DESC;";
    conn.query(sql, function(err, rows) {
        if (err) console.error("err : " + err);
        else {
            res.render(__dirname + '/views/loansecmanage.ejs', {
                title: "대출,담보현황 | " + siteData.title,
                rows: rows,
                page: page,
                length: rows.length - 1,
                page_num: 10,
                pass: true,
                loan_p_no: loan_p_no,
                data: data
            });
        }
    });
});








var filepath_loan = '';
var storage = multer.diskStorage({ //  파일이름을 유지하기 위해 사용할 변수(중복방지를 위하여 시간을 넣어줫음) 
    destination(req, file, cb) {
        var today = new Date();

        var month = today.getMonth() + 1;
        var day = today.getDate();

        if ((month / 10) < 1) {
            month = '0' + month;
        }
        if ((day / 10) < 1) {
            day = '0' + day;
        }

        makeFolder(__dirname + '/public/' + 'uploadedFiles/' + 'loan' + '/' + localUserID + '/' + today.getFullYear() + month + day);
        filepath_loan = __dirname + '/public/' + 'uploadedFiles/' + 'loan' + '/' + localUserID + '/' + today.getFullYear() + month + day;
        cb(null, __dirname + '/public/' + 'uploadedFiles/' + 'loan' + '/' + localUserID + '/' + today.getFullYear() + month + day);
    },
    filename(req, file, cb) {
        var today = new Date();

        var month = today.getMonth() + 1;
        var day = today.getDate();

        if ((month / 10) < 1) {
            month = '0' + month;
        }
        if ((day / 10) < 1) {
            day = '0' + day;
        }

        changefilename = `${today.getFullYear()}${month}${day}${today.getSeconds()}__${file.originalname}`;
        cb(null, `${today.getFullYear()}${month}${day}${today.getSeconds()}__${file.originalname}`);
    },
});
var upload = multer({
    storage: storage,
    limits: {
        file: 10,
        fileSize: 1024 * 1024 * 1024
    }
});

app.post('/loanwrite', upload.array('FileName'), async function(req, res, next) {

    console.log("filepath", filepath_loan);
    //var total_loan = req.body.total_loan;
    var principal = req.body.principal;
    //var repayment = req.body.repayment;
    var loan_date = req.body.loan_date;
    var expirationed = req.body.expirationed;
    var expenses = req.body.expenses;
    //var day_loan = req.body.day_loan;
    //var interest = req.body.interest;
    var state = req.body.state;
    var give_date = req.body.give_date;
    var brand = req.body.brand;
    var price = req.body.price;
    var get_date = req.body.get_date;
    var product = req.body.product;
    var docu_g = req.body.docu_g;


    var files = null;
    files = req.files;

    var originalname = '',
        filename = '',
        mimetype = '',
        size = 0;


    var phone = req.body.phone;

    var loan_no = '';
    var sec_no = '';

    var loan_data = [];
    var sec_data = [];

    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var date = today.getDate();

    if ((month / 10) < 1) {
        month = '0' + month;
    }
    if ((date / 10) < 1) {
        date = '0' + date;
    }

    var today_date = String(year) + String(month) + String(date);

    console.log("#1 lastloan_no", lastloan_no);
    if (lastloan_no != null) {
        var loandt = lastloan_no.substr(1, 8);
        console.log("l", loandt);
        if (loandt == today_date) {
            loandt = lastloan_no.substr(1, 16);
            loan_no = Number(loandt) + 1;
            loan_no = String(loan_no);
            loan_no = 'L' + loan_no;
            console.log("#1 loan_no", loan_no);
        }
    } else {
        loan_no = 'L' + today_date + String('00000001');
        console.log("#2 loan_no" + loan_no);
    }

    loan_data = [loan_no, principal, loan_date, expirationed, expenses, state, phone]
    var sql = 'INSERT INTO dgl1231.loan(LOAN_NO,LOAN_PRINCIPAL,LOAN_DATE,LOAN_DEADLINE,OTHER_EXPENSES,STATEMENT,CALL_NO) VALUES (?, ?, ?, ?, ?, ?, ?)'

    await conn.query(sql, loan_data, async function(err, rows) {
        if (err) console.error("err : " + err);
    });
    if (lastsec_no != null) {
        console.log("#3", lastsec_no);
        var loandt = lastsec_no.substr(0, 8);
        console.log("b" + loandt);
        if (loandt == today_date) {
            console.log("좀가자");
            loandt = lastsec_no;
            sec_no = Number(loandt) + 1;
            sec_no = String(sec_no);
            console.log("#3 sec_no", sec_no);
        }
    } else {
        sec_no = today_date + String('00000001');
        console.log("#4 sec_no", sec_no);
    }

    console.log("filepath", filepath_loan);
    var docudata = [];
    var subdocuno = '';
    var docuno = '';
    var filesch = "SELECT DOCU_NO FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.* FROM (SELECT B.* FROM dgl1231.document B ORDER BY B.DOCU_NO DESC) A, (SELECT @ROWNUM := 0 ) C) D WHERE D.ROWNUM='1'";
    await conn.query(filesch, async function(err, rows) {
        if (err) {
            console.error("err :" + err)

        } else {
            console.log(rows);
            if (rows[0] != null) {
                docuno = rows[0].DOCU_NO;
                subdocuno = docuno.substr(1, 8);
                docuno = docuno.substr(1, 16);
                if (today_date == subdocuno) {
                    console.log("#있을때", docuno);
                    docuno = Number(docuno) + 1;
                } else {
                    docuno = today_date + String('00000001');
                }
            } else if (rows[0] == null) {
                docuno = today_date + String('00000001');
                console.log("#없을때", docuno);
            }

            console.log("#시작", docuno);
            if (Array.isArray(files)) {
                console.log('배열에 들어있는 파일 갯수 : %d', files.length);
                for (var index = 0; index < files.length; index++) {
                    originalname = files[index].originalname;
                    filename = files[index].filename;
                    mimetype = files[index].mimetype;
                    size = files[index].size;
                    var filenumber = 'F' + String((Number(docuno) + index));

                    console.log('현재 파일 정보 : ' + filenumber + ',' + originalname + ',  ' + filename + ',  ' + mimetype + ',  ' + size + ', ' + filenumber);
                    docudata[index] = [filenumber, today_date, filepath_loan, originalname, filename, size, mimetype, phone, loan_no, docu_g];

                    sql = "INSERT INTO dgl1231.document(DOCU_NO, SEND_IN_DATE,DOCU_PATH, DEFAULT_DOCU_NAME, STORED_DOCU_NAME, DOCU_SIZE, FILE_EXTENSION, CALL_NO, LOAN_NO, DOCU_G) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?,?);";
                    await conn.query(sql, docudata[index], async function(err, rows) {
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

                var filenumber = 'F' + String((Number(docuno) + index));
                docudata[index] = [filenumber, today_date, filepath_loan, originalname, filename, size, mimetype, phone, loan_no, docu_g];
                sql = "INSERT INTO dgl1231.document(DOCU_NO, SEND_IN_DATE,DOCU_PATH, DEFAULT_DOCU_NAME, STORED_DOCU_NAME, DOCU_SIZE, FILE_EXTENSION, CALL_NO, LOAN_NO, DOCU_G) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?,?);";
                await conn.query(sql, docudata[index], async function(err, rows) {
                    if (err) console.error("err : " + err);
                });
            }
            sec_data = [sec_no, give_date, brand, price, get_date, product, phone, loan_no];
            sql = 'INSERT INTO dgl1231.security VALUES (?, ?, ?, ?, ?, ?, ?,?)';
            conn.query(sql, sec_data, function(err, rows) {
                if (err) console.error("err : " + err);
                res.redirect('/menage');
            });
        }
    });



});




app.post('/repayment', function(req, res, next) {

    var repay_amount = req.body.repay_amount;
    var repay_date = req.body.repay_date;
    var repay_g = req.body.repay_g;
    var r_loan_no = req.body.loan_no;

    var repay_no = '';
    var repay_data = [];

    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var date = today.getDate();

    if ((month / 10) < 1) {
        month = '0' + month;
    }
    if ((date / 10) < 1) {
        date = '0' + date;
    }

    var today_date = String(year) + String(month) + String(date);

    console.log("#1 lastrepay_no", lastrepay_no);
    if (lastrepay_no != null) {
        var loandt = lastrepay_no.substr(1, 8);
        console.log("l", loandt);
        if (loandt == today_date) {
            loandt = lastrepay_no.substr(1, 16);
            repay_no = Number(loandt) + 1;
            repay_no = String(repay_no);
            repay_no = 'R' + repay_no;
            console.log("#1 repay_no", repay_no);
        }
    } else {
        repay_no = 'L' + today_date + String('00000001');
        console.log("#2 repay_no" + repay_no);
    }

    repay_data = [repay_no, repay_amount, repay_date, repay_g, r_loan_no]
    var sql = 'INSERT INTO dgl1231.repayment(REPAY_NO, REPAY_AMOUNT, REPAY_DATE, REPAY_G, LOAN_NO) VALUES (?, ?, ?, ?, ?)'

    conn.query(sql, repay_data, function(err, rows) {
        if (err) console.error("err : " + err);
        res.redirect('/menage');
    });



});

app.post('/deliver_submit', function(req, res, next) {
    var email = req.body.email;
    var del_no = req.body.tbs;
    var del_com = req.body.del_company;
    var del_data = [del_no, del_com, localUserID];
    var sql = "INSERT INTO dgl1231.deliver(DELIVER_NO, DELIVER_COMPANY_NAME, CALL_NO) VALUES(?, ?, ?);";
    conn.query(sql, del_data, function(err, rows) {
        if (err) {
            console.error("err : " + err);
            res.redirect('/');
        }

        sql = "UPDATE dgl1231.user SET MAIL_ADDR = ? WHERE CALL_NO = ?;"
        var up_data = [email, localUserID];
        conn.query(sql, up_data, function(err, rows) {
            if (err) {
                console.error("err : " + err);
                res.redirect('/');
            }
            res.redirect('/');
        });
    });
});
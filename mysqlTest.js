// 히트네요...

const { application } = require('express');
var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = mysql.createConnection({
    host: '192.168.0.14',
    user: 'root',
    password: '153264ze',
    database: 'testDB'
});

connection.connect(function(error) {
    if (!!error) {
        console.log('Error');
    } else {
        console.log('Connected');
    }
});

//app.get('/', function(req, resp) {
    connection.query("SELECT * FROM TESTDB.TESTTABLE", function(error, rows, fields) {
        if (!!error) {
            console.log('Error in the query');
        } else {
            console.log(rows);
            console.log('Success!');
        }
    });
//});

connection.end();

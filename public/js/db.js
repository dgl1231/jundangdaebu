// 히트네요...
const { application } = require('express');
var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = {
    host: 'bangguseok.kr',
    user: 'dgl1231',
    password: 'dlehdrjs1!',
    port: '3306',
    database: 'dgl1231',
};
module.exports = {
    init: function () {
        return mysql.createConnection(connection);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if (err) { console.log("FFFFFFFFUUUUUUUUUUUUUUCCCCCCCCCCCCCKKKKKKKKKKKKKKKK"); console.error('mysql connection error : ' + err); }
            else console.log('mysql is connected successfully!');
            
        });
    }
}
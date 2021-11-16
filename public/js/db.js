// 히트네요...
const { application } = require('express');
var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = mysql.createConnection({
    host: '192.168.0.14',
    user: 'root',
    password: 'dlehdrjs1!',
    database: 'testDB'
});
module.exports = {
    init: function () {
        return mysql.createConnection(connection);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    }
}

/*
connection.connect(function(error) {
    if (!!error) {
        console.log('Error');
    } else {
        console.log('Connected');
    }
});

*/
connection.end();
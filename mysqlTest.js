// 히트네요...

const { application } = require('express');
var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = mysql.createConnection({
    host: '192.168.0.14',
    user: 'joker',
    password: 'dlehdrjs1!',
    database: 'testDB'
});

connection.connect(function(error) {
    if (!!error) {
        console.log('Error');
    } else {
        console.log('Connected');
    }
});

connection.end();
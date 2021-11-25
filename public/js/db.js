// 히트네요...
const { application } = require('express');
var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = {
    host: '192.168.0.14',
    user: 'joker',
    password: 'dlehdrjs1!',
    port: '3306',
    database: 'manspawnshop',
    dateStrings: "date"
};
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
//connection.end();
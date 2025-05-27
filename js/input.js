"use strict";

// ト音記号画像のパス
const trebleClefImagePath = "img/to-onkigou.png";
// Go Live用パス
// const trebleClefImagePath = "../img/to-onkigou.png";

// 上から一つ目の五線譜の一本目の線の縦軸(単位:pixel)
const initialY = 50;
// 五線譜の線の間(単位:pixel)
const lineInterval = 20;
// 一本目の五線譜から次の五線譜の一番上の線の間(単位:pixel)
const staffInterval = 200;
// 五線譜の数
const num = 10;
// ト音記号の横軸の位置
const kigouX = -50;


let previousTimeMS = 0;

let noteDataArray = [];

const timeIntervalMS = 100;


class Note {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function process(x, y) {
    let currentDate = new Date();
    let currentTimeMS = currentDate.getTime();
    if (currentTimeMS >= previousTimeMS + timeIntervalMS) {
        // noteDataArray.push(Note(x, y));
        console.log(x);
        console.log(y);
    }
}

// -------------------------------------------------------------
// <canvas>タグで
// onMouseDown="startDraw(event)"
// onMouseMove="Draw(event)"
// onMouseUp="endDraw(event)" で実行します
// -------------------------------------------------------------
//mousedownチェック用
var mouseDown = false;
//マウス座標保存用
var wbound = 0;
var stX = 0;
var stY = 0;
var x = 0;
var y = 0;
//canvas要素保存用
var canvas;
var context;
//描画の開始
function startDraw(event) {
    //マウスボタンが押された
    mouseDown = true;
    //canvasの絶対座標を取得
    wbound = event.target.getBoundingClientRect();
    //マウスの座標（始点）をセット
    stX = event.clientX - wbound.left;
    stY = event.clientY - wbound.top;
}

function Draw(event) {
    //マウスボタンが押されていれば描画
    if (mouseDown) {
        //キャンバスの取得
        canvas = document.getElementById("drawarea");
        //コンテキストの取得
        context = canvas.getContext("2d");
        //マウスの座標(終点）を取得
        x = event.clientX - wbound.left;
        y = event.clientY - wbound.top;
        process(x, y);
        //パスの開始
        context.beginPath();
        //線の色セット
        context.strokeStyle = "black";
        //線の太さセット
        context.lineWidth = 5;
        //線端の形状セット
        context.lineCap = "round";
        context.globalCompositeOperation = 'source-over';
        context.moveTo(stX, stY);
        context.lineTo(x, y);
        context.stroke();
        //座標（始点）の切替
        stX = x;
        stY = y;
    }
}

//描画の終了
function endDraw(event) {
    //マウスボタンが押されていれば描画
    if (mouseDown) {
        //マウスボタンが離された
        mouseDown = false;
    }
}


function drawImage(x, y) {
    const ctx = document.getElementById("drawarea").getContext("2d");
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, x, y);
    };
    img.src = trebleClefImagePath;
}


function drawHorizontalLine(y) {
    var canvas = document.getElementById('drawarea');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        //輪郭線
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1000, y);
        ctx.closePath();
        ctx.stroke();
    }
}

function fiveLinedStaff(initialY, lineInterval) {
    for (let index = 0; index < 5; index++) {
        drawHorizontalLine(initialY + index * lineInterval);
    }
}

function page(initialY, lineInterval, staffInterval, num, kigouX) {
    for (let index = 0; index < num; index++) {
        const currentY = initialY + index * staffInterval;
        fiveLinedStaff(currentY, lineInterval);
        drawImage(kigouX, -10 + index * staffInterval);
    }
}

page(initialY, lineInterval, staffInterval, num, kigouX);
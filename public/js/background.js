const body = document.getElementById('mainbackground');
const photoNum=5; //num of photo;

function callRan(){
ranNum=Math.floor((Math.random()*5)+1);//call number 1 to 6
return ranNum
}

function callPho(){
ranNum=callRan();
url=`../img/main_bg/${ranNum}.jpg`;
body.style.backgroundImage=`url(${url})`;

}

function init(){
    setInterval(callPho,5000); 
}
init();


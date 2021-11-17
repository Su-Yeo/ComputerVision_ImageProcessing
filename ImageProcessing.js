// 전역 변수부 (*중요*)
var inCanvas, inCtx, inPaper, outCanvas, outCtx, outPaper; // 화면용
var inImage, inH, inW, outImage, outH, outW; // 핵심 변수들
var inFile;
var select; //자유형, 사각형 선택 구분
// 공통 함수부
// 초기화 함수
function init() {
    inCanvas = document.getElementById('inCanvas'); // 도화지에 접근
    inCtx = inCanvas.getContext('2d'); // 물감,붓이 들은 통
    outCanvas = document.getElementById('outCanvas'); // 도화지에 접근
    outCtx = outCanvas.getContext('2d'); // 물감,붓이 들은 통
    
    // 캔버스 크기를 결정
   outCanvas.height = window.innerHeight*0.6;
   outCanvas.width = window.innerWidth*0.6;
}
function loadImage() {
    inFile = document.getElementById('inFile').files[0]; // 선택한 칼라 파일
    // 그림 파일 --> 이미지 객체
    var inPicture = new Image(); // 빈 이미지 객체 생성
    inPicture.src = "Nature99(Small)/" +inFile.name;
    //alert(inFile.name);
    inPicture.onload = function() { // 익명함수
        // *중요* 입력 파일 크기 파악
        inH = inPicture.height;
        inW = inPicture.width;
        outH=inH;
        outW=inW;

        // 캔버스 크기 조절
        inCanvas.height = inH;
        inCanvas.width = inW;
        inCtx.drawImage(inPicture,0,0,inW,inH);

        outCanvas.height = inH;
        outCanvas.width = inW;
        outCtx.drawImage(inPicture,0,0,inW,inH);
        

        // 입력용 4차원 배열 메모리 할당
        inImage = new Array(4); // 4장짜리 배열(R,G,B,Alpha)
        outImage = new Array(4); // 4장짜리 배열(R,G,B,Alpha)
        for(var i=0; i<4; i++) {
            inImage[i] = new Array(inH);
            outImage[i] = new Array(inH);
            for(var k=0; k<inH; k++){
                inImage[i][k] = new Array(inW);
                outImage[i][k] = new Array(inW);
            }
        }

        // *중요* 캔버스 --> 배열로 칼라색상 추출
        var colorBlob = inCtx.getImageData(0,0,inW,inH); // 주의!
        var R, G, B, Alpha;
        var n=0;
        for(var i=0; i<inH; i++) {
            for (var k=0; k<inW; k++) {
                //var px = (i*inW + k) * 4; // 1픽셀=4Byte
                var px = n * 4; // 1픽셀=4Byte
                R = colorBlob.data[px+0];
                G = colorBlob.data[px+1];
                B = colorBlob.data[px+2];
                Alpha = colorBlob.data[px+3];
                inImage[0][i][k] = R;
                inImage[1][i][k] = G;
                inImage[2][i][k] = B;
                inImage[3][i][k] = Alpha;
                outImage[0][i][k] = R;
                outImage[1][i][k] = G;
                outImage[2][i][k] = B;
                outImage[3][i][k] = Alpha;
                n++;
            }
        }
    } 
}
//이미지 출력
var hop=1; //몇배 건너뛰면서 출력할 변수
function displayImage(image=outImage){
    outCanvas.height = outH*hop;
    outCanvas.width = outW*hop;
    outPaper=outCtx.createImageData(outW*hop,outH*hop);
    var n=0;
    for(var i=0; i<parseInt(outH*hop); i++){
        for(var k=0; k<parseInt(outW*hop); k++){
            try{
                var newI = parseInt(i/hop);
                var newK = parseInt(k/hop);
                var R = image[0][newI][newK];
                var G = image[1][newI][newK];
                var B = image[2][newI][newK];
                outPaper.data[n*4+0]=R; //Red
                outPaper.data[n*4+1]=G; //Green
                outPaper.data[n*4+2]=B; //Blue
                outPaper.data[n*4+3]=255; //Alpha 투명도(0(투명)~255(불투명))
                n++;
            }catch(e){
                //overflow 일어날 경우 그냥 넘어가게
            }
        }
    }
    outCtx.putImageData(outPaper,0,0); //이미지 화면 출력(inPaper,x,y)
}
//그림 그리기
var strokeColor="#000000";
var strokeWidth="2";
function drawLine() {
	// 마우스 리스너 등록. e는 MouseEvent 객체
	outCanvas.addEventListener("mousemove", move, false);
	outCanvas.addEventListener("mousedown", down, false);
	outCanvas.addEventListener("mouseup", up, false);
	outCanvas.addEventListener("mouseout", out, false);

    var startX=0, startY=0; // 마우스의 마지막 포인터 좌표
    var drawing=false;
    function draw(curX, curY) {
        outCtx.beginPath();
        outCtx.lineWidth = strokeWidth; // 선 굵기
        outCtx.strokeStyle = strokeColor;
        outCtx.moveTo(startX, startY);
        outCtx.lineTo(curX, curY);
        outCtx.stroke();
    }
    function down(e) {
        startX = e.offsetX; startY = e.offsetY;
        drawing = true;
    }
    function up(e) { drawing = false; }
    function move(e) {
        if(!drawing) return; // 마우스가 눌러지지 않았으면 리턴
        var curX = e.offsetX, curY = e.offsetY;
        draw(curX, curY);
        startX = curX; startY = curY;
    }
    function out(e) { 
        drawing = false;
        $(document).click(function (e) { 
            var container = $('.segment');
            if (container.has(e.target).length === 0) {
                outCanvas.removeEventListener("mousemove", move, false);
                outCanvas.removeEventListener("mousedown", down, false);
                outCanvas.removeEventListener("mouseup", up, false);
                outCanvas.removeEventListener("mouseout", out, false);
            
            }
        });
        $(".rect").click(function (e) { 
            outCanvas.removeEventListener("mousemove", move, false);
            outCanvas.removeEventListener("mousedown", down, false);
            outCanvas.removeEventListener("mouseup", up, false);
            outCanvas.removeEventListener("mouseout", out, false);
            
        });
    }
}
//사각형 그리기
function drawRect() {
    var startX, startY, endX, endY; 
    outCanvas.addEventListener("mousedown", __downMouse, false);
    outCanvas.addEventListener("mouseup", __upMouse, false);
    function __downMouse(e){
        startX = e.offsetX;
        startY = e.offsetY;
    }
    function __upMouse(e){
        endX = e.offsetX;
        endY = e.offsetY;
        if(startX>endX){
            var tmp = startX;
            startX = endX;
            endX = tmp;
        }
        if(startX>endY){
            var tmp = startY;
            startY = endY;
            endY = tmp;
        }

        //사격형 그리기
        outCtx.beginPath();
        outCtx.strokeStyle=strokeColor;
        outCtx.lineWidth=strokeWidth;
        outCtx.rect(startX, startY, (endX-startX), (endY-startY));
        outCtx.stroke(); // 선표시
        outCtx.closePath();
        $(document).click(function (e) {
            var container = $('.segment');
            if (container.has(e.target).length === 0) {
                outCanvas.removeEventListener("mousedown", __downMouse, false);
                outCanvas.removeEventListener("mouseup", __upMouse, false);
            }
        });
        $(".line").click(function (e) { 
            outCanvas.removeEventListener("mousedown", __downMouse, false);
            outCanvas.removeEventListener("mouseup", __upMouse, false);
        });
    }
    
}

var pntAry = []; //마우스가 지나간 좌표 모음
function selectLine() {
    select=1;
    pntAry = []; //포인트 값들 초기화
    outCanvas.addEventListener("mousedown", __downMouse, false);
    outCanvas.addEventListener("mousemove", __moveMouse, false);
    outCanvas.addEventListener("mouseup", __upMouse, false);
    var clickYN = false;

    function __downMouse(e){
        clickYN = true;
        sx = e.offsetX;
        sy = e.offsetY;
        pntAry[pntAry.length]=[sx,sy];
    }

    function __moveMouse(e){
        if(!clickYN)
            return;
        sx = e.offsetX;
        sy = e.offsetY;
        pntAry[pntAry.length] = [sx,sy];
        //선그리기
        pt1 = pntAry[pntAry.length-2]; //앞에 좌표
        pt2 = pntAry[pntAry.length-1]; //현재 좌표
        outCtx.beginPath();
        outCtx.moveTo(pt1[0],pt1[1]); //앞에 위치에서
        outCtx.lineTo(pt2[0],pt2[1]); //현재 위치로 그리기
        outCtx.stroke();
        outCtx.closePath();
    }

    function __upMouse(e){
        clickYN = false;
        sx = e.offsetX;
        sy = e.offsetY;
        pntAry[pntAry.length] = [sx, sy];
        pntAry[pntAry.length] = pntAry[0]; //폐합 폴리곤으로 만들기
        //마지막 선 그리기
        pt1 = pntAry[pntAry.length-2]; //앞에 좌표
        pt2 = pntAry[pntAry.length-1]; //현재 좌표
        outCtx.beginPath();
        outCtx.beginPath();
        outCtx.moveTo(pt1[0],pt1[1]); //앞에 위치에서
        outCtx.lineTo(pt2[0],pt2[1]); //현재 위치로 그리기
        outCtx.stroke();
        outCtx.closePath();
        outCanvas.removeEventListener("mousedown", __downMouse, false);
        outCanvas.removeEventListener("mousemove", __moveMouse, false);
        outCanvas.removeEventListener("mouseup", __upMouse, false);
    }
    $(".rect").click(function (e) { 
        outCanvas.removeEventListener("mousedown", __downMouse, false);
        outCanvas.removeEventListener("mousemove", __moveMouse, false);
        outCanvas.removeEventListener("mouseup", __upMouse, false);
    });
}

function pointInPolygon(pointArray, pntY, pntX){
    //만약 다갹형 안에 있으면 true 리턴, 아니면 false 리턴
    var crossCnt = 0; // 교차 횟수 
    for(var i=0; i<pointArray.length-1; i++){ //i,k는 다각형의 인접 선분. 
        var k=i+1;
        if((pointArray[i][1]>pntY) != (pointArray[k][1]>pntY)){ 
            var atX = (pointArray[k][0] - pointArray[i][0]) * (pntY - pointArray[i][1]) 
            / (pointArray[k][1] - pointArray[i][1]) + pointArray[i][0]; 
            if(pntX < atX) 
                crossCnt++; 
        } 
    } 
    // 홀수면 내부, 짝수면 외부에 있음 
    if(crossCnt%2==0)
        return false; 
    else 
        return true; 
    pntAry = []; //포인트 값들 초기화
}

//사각형 선택
var startX, startY, endX, endY; 
function selectRect() {
    select=2;
    outCanvas.addEventListener("mousedown", __downMouse, false);
    outCanvas.addEventListener("mouseup", __upMouse, false);
    function __downMouse(e){
        startX = e.offsetX;
        startY = e.offsetY;
    }
    function __upMouse(e){
        endX = e.offsetX;
        endY = e.offsetY;
        if(startX>endX){
            var tmp = startX;
            startX = endX;
            endX = tmp;
        }
        if(startX>endY){
            var tmp = startY;
            startY = endY;
            endY = tmp;
        }

        //사격형 그리기
        outCtx.beginPath();
        outCtx.strokeStyle="#000000";
        outCtx.lineWidth=2;
        outCtx.rect(startX, startY, (endX-startX), (endY-startY));
        outCtx.stroke(); // 선표시
        outCtx.closePath();
        
        outCanvas.removeEventListener("mousedown", __downMouse, false);
        outCanvas.removeEventListener("mouseup", __upMouse, false);
    }
    $(".line").click(function (e) { 
        outCanvas.removeEventListener("mousedown", __downMouse, false);
        outCanvas.removeEventListener("mouseup", __upMouse, false);
    });
    
}

// 영상처리 함수부
function selectAlgorithm(selectNum){
    if(inFile==null) {alert("파일을 선택해주세요"); return false;}
    switch(parseInt(selectNum)){
        case 101: //동일 영상
            equalImage(); break;
        case 102: //밝게 어둡게
            addImage(); break;
        case 103: //그레이 스케일
            grayImage(); break;
        case 104: //흑백 입력값 기준
            grayInput(); break;
        case 105: //흑백 평균 기준
            grayAvg(); break;
        case 106: //흑백 중앙값 기준
            grayMedi(); break;
        case 107: //색상 반전
            revImage(); break;
        case 108: //파라볼라(캡)
            paraCap(); break;
        case 109: //파라볼라(컵)
            paraCup(); break;
        case 110: //감마
            gamma(); break;
        case 111: //범위 강조
            stressTrans(); break;
        case 112: //and연산
            andMask(); break;
        case 113: //and연산
            posterizing(); break;
        case 201: //축소하기
            zoomOut(); break;
        case 202: //확대하기
            zoomIn(); break;
        case 203: //상하 좌우 반전
            flipImage(); break;
        case 204: //90도 회전
            rotatImage90(); break;
        case 205: //회전
            rotatImage(); break;
        case 301: //히스토그램 스트레칭
            histoStretch(); break;
        case 302://End-In 탐색
            endInSearch(); break;
        case 303: //평활화
            histoEqual(); break;
        case 401: //엠보싱
            embossing(); break;
        case 402: //블러링
            blurring(); break;
        case 403: //가우시안 스무딩
            gaussian(); break;
        case 404: //샤프닝1
            sharpening1(); break;
        case 405: //샤프닝2
            sharpening2(); break;
        case 406: //고주파 필터 샤프닝
            hpfSharp(); break;
        case 407: //저주파 필터 샤프닝
            lpfSharp(); break;
        case 408: //경계선1 이동과 차분(수직)
            shiftVer(); break;
        case 409: //경계선2 이동과 차분(수평)
            diffHor(); break;
        case 410: //경계선3 유사 연산자
            homogen(); break;
        case 411: //경계선4 차연산자
            diffOper(); break;
        case 412: //경계선5 LoG
            laplacian(); break;
        case 413: //경계선6 DoG
            diffGaussi(); break;
        case 501: //채도 변경
            changeSaturation(); break;
        case 502: //명도 변경
            changeValue(); break;
        case 503: //색상 추출
            pickColor(); break;
    }
    select=0;
}

//101. 동일 영상
function equalImage(){
    //**중요** 출력 영상 크기 결정 -> 알고리즘에 의존
    outH=inH;
    outW=inW;
    // 출력용 4차원 배열 메모리 할당
    outImage = new Array(4); // 4장짜리 배열(R,G,B,Alpha)
    for(var i=0; i<4; i++) {
        outImage[i] = new Array(outH);
        for(var k=0; k<outH; k++)
            outImage[i][k] = new Array(outW);
    }
    //***영상 처리 알고리즘 ***
    for(var rgb=0; rgb<4; rgb++){
        for(var i=0; i<inH; i++){
            for(var k=0; k<inW; k++){
                outImage[rgb][i][k] = inImage[rgb][i][k];
            }
        }
    }
    displayImage();
}
function makeTmpImage(){
    var tmpImage = new Array(4); // 4장짜리 배열(R,G,B,Alpha)
    for(var rgb=0; rgb<4; rgb++){
        tmpImage[rgb]= new Array(outH);
        for(var i=0; i<outH; i++){
            tmpImage[rgb][i] = new Array(outW);
            for(var k=0; k<outW; k++){
                tmpImage[rgb][i][k]=outImage[rgb][i][k]; //임시 저장
            }
        }
    }
    return tmpImage;
}
//102. 밝기, 어둡기
function addImage(){
    var value = Number(document.getElementById("brightSlider").value);
    var tmpImage = makeTmpImage();

    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var pixel = tmpImage[rgb][i][k];
                if(pixel+value>255) 
                    pixel=255;
                else if(pixel+value<0)
                    pixel=0;
                else
                    pixel+=value;
                tmpImage[rgb][i][k]=pixel;
            }
        }
    }
    displayImage(tmpImage);
    $(".bright").mouseleave(function () {
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                outImage[0][i][k]=tmpImage[0][i][k]; 
                outImage[1][i][k]=tmpImage[1][i][k];
                outImage[2][i][k]=tmpImage[2][i][k];
                outImage[3][i][k]=tmpImage[3][i][k];
            }
        }
        $('.brightInput').val(0);
        tmpImage=null;
    });
}
//103. 그레이 스케일
function grayImage(){
    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=pixel;
                }
            }
        }
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=pixel;
                }
            }
        }
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=pixel;
            }
        }
    }
    displayImage();
}
//104. 흑백(입력값 기준)
function grayInput(){
    var value = parseInt(document.getElementById("grayInput").value);
    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    if(pixel<value)
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                    else
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
                }
            }
        }
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    if(pixel<value)
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                    else
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
                }
            }
        }
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                if(pixel<value)
                    outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                else
                    outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
            }
        }
    }
    displayImage();
}
//105. 흑백(평균값 기준)
function grayAvg(){
    var sum=0;
    var avg=0;
    for(var i=0; i<outH; i++){
        for(var k=0; k<outW; k++){
            var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
            sum+=pixel;
        }
    }
    avg=Math.floor(sum/(outH*outW));
    
    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    if(pixel<avg)
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                    else
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
                }
            }
        }
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    if(pixel<avg)
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                    else
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
                }
            }
        }  
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                if(pixel<avg)
                    outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                else
                    outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
            }
        }
    }
    displayImage();
}
//106. 흑백(중앙값기준)
function grayMedi(){
    var median=0, n=0;
    var imageMedi=new Array();
    for(var i=0; i<outH; i++){
        for(var k=0; k<outW; k++){
            var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
            imageMedi[n]=pixel;
            n++;
        }
    }
    imageMedi.sort(function(a, b)  { //숫자 정렬
        return a - b;// 유니코드순이 아닌 두 수의 차로 양수,음수 이용하여 숫자 오름차순
    });
    //중앙값 계산
    if(imageMedi.length%2==0)//짝수이면
        median=(imageMedi[(imageMedi.length/2)]+imageMedi[(imageMedi.length/2)+1])/2;
    else
        median=imageMedi[(imageMedi.length/2)+1];

    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    if(pixel<median)
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                    else
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
                }
            }
        }   
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    if(pixel<median)
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                    else
                        outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
                }
            }
        }   
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                if(pixel<median)
                    outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=0;
                else
                    outImage[0][i][k]=outImage[1][i][k]=outImage[2][i][k]=255;
            }
        }
    }
    displayImage();
}
//107. 색상 반전
function revImage(){
    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    outImage[0][i][k]=255-outImage[0][i][k];
                    outImage[1][i][k]=255-outImage[1][i][k];
                    outImage[2][i][k]=255-outImage[2][i][k];
                }
            }
        }
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    outImage[0][i][k]=255-outImage[0][i][k];
                    outImage[1][i][k]=255-outImage[1][i][k];
                    outImage[2][i][k]=255-outImage[2][i][k];
                }
            }
        }   
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                outImage[0][i][k]=255-outImage[0][i][k];
                outImage[1][i][k]=255-outImage[1][i][k];
                outImage[2][i][k]=255-outImage[2][i][k];
            }
        }
    }
    displayImage();
}
//108. 파라볼라 cap
function paraCap(){
    //LUT(LookUp Table) -> 미리 복잡한 수식을 계산해 놓고 가져다 쓰기
    var LUT = new Array(256);
    for(var i=0; i<256; i++){
        outVal=255.0-255.0*Math.pow((i/127.0-1),2.0);
        if(outVal>255.0)
            outVal=255.0;
        if(outVal<0.0)
            outVal=0.0;
        LUT[i] = parseInt(outVal);
    }
   
    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                    outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                    outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
                }
            }
        }
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                    outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                    outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
                }
            }
        }
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
            }
        }    
    }
    displayImage();
}
//109. 파라볼라 cup
function paraCup(){
    //LUT(LookUp Table) -> 미리 복잡한 수식을 계산해 놓고 가져다 쓰기
    var LUT = new Array(256);
    for(var i=0; i<256; i++){
        outVal=255.0*Math.pow((i/127.0-1),2.0);
        if(outVal>255.0)
            outVal=255.0;
        if(outVal<0.0)
            outVal=0.0;
        LUT[i] = parseInt(outVal);
    }
    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                    outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                    outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
                }
            }
        }
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                    outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                    outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
                }
            }
        }
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
            }
        }    
    }
    displayImage();
}
//110. 감마
function gamma(){
    var value = parseFloat(document.getElementById("gammaSlider").value);
    console.log(value);
    var LUT = new Array(256);
    for(var i=0; i<256; i++){
        outVal=Math.pow(i,1/value);
        if(outVal>255.0)
            outVal=255.0;
        if(outVal<0.0)
            outVal=0.0;
        LUT[i] = parseInt(outVal);
    }
   // var tmpImage = makeTmpImage();

    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                    outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                    outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
                }
            }
        }
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                    outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                    outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
                }
            }
        }
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                outImage[0][i][k]=parseInt(LUT[outImage[0][i][k]]);
                outImage[1][i][k]=parseInt(LUT[outImage[1][i][k]]);
                outImage[2][i][k]=parseInt(LUT[outImage[2][i][k]]);
            }
        }    
    }
    displayImage();
    $('.gammaInput').val(1);
}
//111. 범위 강조
// function stressTrans(){
//     var startRange = parseInt(document.getElementById("startRange").value);
//     var endRange = parseInt(document.getElementById("endRange").value);

//     if(select==1){
//         for(var i=0; i<outH; i++){
//             for(var k=0; k<outW; k++){
//                 if(pointInPolygon(pntAry,i,k)){
//                     var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
//                     if(pixel>=startRange && pixel<=endRange){
//                         outImage[0][i][k]=255;
//                         outImage[1][i][k]=255;
//                         outImage[2][i][k]=255;
//                     }
//                 }  
//             }
//         }   
//     }else if(select==2){
//         for(var i=0; i<outH; i++){
//             for(var k=0; k<outW; k++){
//                 if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
//                     var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
//                     if(pixel>=startRange && pixel<=endRange){
//                         outImage[0][i][k]=255;
//                         outImage[1][i][k]=255;
//                         outImage[2][i][k]=255;
//                     }
//                 }  
//             }
//         }
//     }else{
//         for(var i=0; i<outH; i++){
//             for(var k=0; k<outW; k++){
//                 var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
//                 if(pixel>=startRange && pixel<=endRange){
//                     outImage[0][i][k]=255;
//                     outImage[1][i][k]=255;
//                     outImage[2][i][k]=255;
//                 }     
//             }
//         }
//     }
//     displayImage();
// }
function stressTrans(){
    var startRange = parseInt(document.getElementById("startRange").value);
    var endRange = parseInt(document.getElementById("endRange").value);
    var tmpImage = makeTmpImage();
    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    // 강조 시작 값과 강조 종료 값 사이에 위치하면 255 출력
                    if(pixel>=startRange && pixel<=endRange){
                        tmpImage[0][i][k]=255;
                        tmpImage[1][i][k]=255;
                        tmpImage[2][i][k]=255;
                    }
                }  
            }
        }   
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                    if(pixel>=startRange && pixel<=endRange){
                        tmpImage[0][i][k]=255;
                        tmpImage[1][i][k]=255;
                        tmpImage[2][i][k]=255;
                    }
                }  
            }
        }
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                if(pixel>=startRange && pixel<=endRange){
                    tmpImage[0][i][k]=255;
                    tmpImage[1][i][k]=255;
                    tmpImage[2][i][k]=255;
                }     
            }
        }
    }
    displayImage(tmpImage);
    $(".stressTrans").mouseleave(function () {
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                outImage[0][i][k]=tmpImage[0][i][k]; 
                outImage[1][i][k]=tmpImage[1][i][k];
                outImage[2][i][k]=tmpImage[2][i][k];
            }
        }
        tmpImage=null;
    });
}
//112. and연산(마스크 수정)
var start,end;
function andMask(){
    
    if(select==1){
        start= new Date();
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    andMask2();
                }
            }
        }
        end = new Date();
        console.log(end-start,"ms");
    }else if(select==2){
        start= new Date();
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    andMask2();
                }
            }
        }
        end = new Date();
        console.log(end-start,"ms");
    }else{
        start= new Date();
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
                if(pixel & 128>=255){
                    outImage[0][i][k]=255;
                    outImage[1][i][k]=255;
                    outImage[2][i][k]=255;
                }else if(pixel & 128<0){
                    outImage[0][i][k]=0;
                    outImage[1][i][k]=0;
                    outImage[2][i][k]=0;
                }else{
                    outImage[0][i][k]=outImage[0][i][k]&128;
                    outImage[1][i][k]=outImage[1][i][k]&128;
                    outImage[2][i][k]=outImage[2][i][k]&128;
                }
            }
        }
        end = new Date();
        console.log(end-start,"ms");
    }

    function andMask2(){
        var pixel = Math.floor((outImage[0][i][k]+outImage[1][i][k]+outImage[2][i][k])/3.0);
        if(pixel & 128>=255){
            outImage[0][i][k]=255;
            outImage[1][i][k]=255;
            outImage[2][i][k]=255;
        }else if(pixel & 128<0){
            outImage[0][i][k]=0;
            outImage[1][i][k]=0;
            outImage[2][i][k]=0;
        }else{
            outImage[0][i][k]=outImage[0][i][k]&128;
            outImage[1][i][k]=outImage[1][i][k]&128;
            outImage[2][i][k]=outImage[2][i][k]&128;
        }
    }
    displayImage();
}
//113. 포스터라이징
function posterizing(){
    var value=0;
    if(select==1){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(pointInPolygon(pntAry,i,k)){
                    outImage[0][i][k]=32*parseInt(outImage[0][i][k]/32);
                    outImage[1][i][k]=32*parseInt(outImage[1][i][k]/32);
                    outImage[2][i][k]=32*parseInt(outImage[2][i][k]/32);
                }
            }
        }
    }else if(select==2){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if((startX<=k && k<=endX) && (startY<=i && i<=endY)){
                    outImage[0][i][k]=32*parseInt(outImage[0][i][k]/32);
                    outImage[1][i][k]=32*parseInt(outImage[1][i][k]/32);
                    outImage[2][i][k]=32*parseInt(outImage[2][i][k]/32);
                }
            }
        }
    }else{
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                outImage[0][i][k]=32*parseInt(outImage[0][i][k]/32);
                outImage[1][i][k]=32*parseInt(outImage[1][i][k]/32);
                outImage[2][i][k]=32*parseInt(outImage[2][i][k]/32);
                
            }
        }
    }
    displayImage();
}
//201. 축소하기
function zoomOut(){
    var scale = parseInt(document.getElementById("zoomOutSlider").value);
    outH = parseInt(outH/scale);
    outW = parseInt(outW/scale);

    var tmpImage = new Array(4); // 4장짜리 배열(R,G,B,Alpha)
    for(var rgb=0; rgb<4; rgb++){
        tmpImage[rgb]= new Array(outH);
        for(var i=0; i<outH; i++){
            tmpImage[rgb][i] = new Array(outW);
            for(var k=0; k<outW; k++){
                tmpImage[rgb][i][k]=outImage[rgb][i*scale][k*scale]; //out에 저장
            }
        }
    }

    outImage = new Array(4); //out리사이즈
    for(var rgb=0; rgb<4; rgb++){
        outImage[rgb] = new Array(outH);
        for(var i=0; i<outH; i++){
            outImage[rgb][i] = new Array(outW);
            for(var k=0; k<outW; k++){
                outImage[rgb][i][k]=tmpImage[rgb][i][k]; //out에 저장
            }
        }
    }
    displayImage();
}
//202. 확대하기(양선형 보간법)
function zoomIn(){
    var scale = parseInt(document.getElementById("zoomInSlider").value);
    var oldH=outH;
    var oldW=outW;
    outH = parseInt(outH*scale);
    outW = parseInt(outW*scale);
    
    var tmpImage = new Array(4); // 4장짜리 배열(R,G,B,Alpha)
    for(var rgb=0; rgb<4; rgb++){
        tmpImage[rgb]= new Array(oldH);
        for(var i=0; i<oldH; i++){
            tmpImage[rgb][i] = new Array(oldW);
            for(var k=0; k<oldW; k++){
                tmpImage[rgb][i][k]=outImage[rgb][i][k]; //out에 저장
            }
        }
    }

    outImage = new Array(4); //out리사이즈
    for(var rgb=0; rgb<4; rgb++){
        outImage[rgb]= new Array(outH);
        for(var i=0; i<outH; i++)
            outImage[rgb][i] = new Array(outW);
    }

    for(var i=0; i<outH; i++){
        for(var k=0; k<outW; k++){
            var rH=i/scale;
            var rW=k/scale;
            var iH = Math.floor(rH);
            var iW = Math.floor(rW);
            var sH=rH-iH;
            var sW=rW-iW;
            if(iH<0 || iH>=(oldH-1) || iW<0 || iW>=(oldW-1)){
                outImage[0][i][k]=255;
                outImage[1][i][k]=255;
                outImage[2][i][k]=255;
                outImage[3][i][k]=255;
            }else{
                for(var rgb=0; rgb<4; rgb++){
                    var c1= tmpImage[rgb][iH][iW];
                    var c2= tmpImage[rgb][iH][iW+1];
                    var c3= tmpImage[rgb][iH+1][iW+1];
                    var c4= tmpImage[rgb][iH+1][iW];

                    var newValue=(c1*(1-sH)*(1-sW)+c2*sW*(1-sH)+c3*sW*sH+c4*(1-sW)*sH);
                    outImage[rgb][i][k]=newValue;
                }
            }
        }
    }
    
    displayImage();
}
//203. 상하 좌우 반전
function flipImage(){
    for(var rgb=0; rgb<4; rgb++){
        outImage[rgb].reverse();
        for(var i=0; i<outH; i++)
            outImage[rgb][i].reverse();
    }
    displayImage();
}
//204. 90도 회전시키기
function rotatImage90(){
    var rotatH = outW;
    var rotatW = outH;

    var image90 = new Array(4); 
    for(var rgb=0; rgb<4; rgb++){
        image90[rgb] = new Array(rotatH); 
        for(var i=0; i<rotatH; i++)
            image90[rgb][i]=new Array(rotatW);
    }

    for(var rgb=0; rgb<4; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                image90[rgb][k][(outH-i)]=outImage[rgb][i][k];
            }
        }
    }

    outImage = new Array(4); //out리사이즈
    for(var rgb=0; rgb<4; rgb++){
        outImage[rgb]= new Array(rotatH);
        for(var i=0; i<rotatH; i++){
            outImage[rgb][i] = new Array(rotatW);
            for(var k=0; k<rotatW; k++)
                outImage[rgb][i][k]=image90[rgb][i][k];
        }
    }

    outW = rotatW;
    outH = rotatH;
    displayImage();
}
// //205. 회전시키기
function rotatImage(){
    var angle = parseInt(document.getElementById("rotatSlider").value);
    var radian = angle*Math.PI/180.0;
    var rh=Math.floor(outH*Math.abs(Math.cos(radian))+outW*Math.abs(Math.sin(radian)));
    var rw=Math.floor(outH*Math.abs(Math.sin(radian))+outW*Math.abs(Math.cos(radian)));
    var centerH=rh/2;
    var centerW=rw/2;

    var tmpArray = new Array(4); // 4장짜리 배열(R,G,B,Alpha)
    for(var rgb=0; rgb<4; rgb++){
        tmpArray[rgb]= new Array(rh);
        for(var i=0; i<rh; i++){
            tmpArray[rgb][i] = new Array(rw);
        }
    }
    
    for(var rgb=0; rgb<4; rgb++){
        for(var i=0; i<rh; i++){
            for(var k=0; k<rw; k++){
                var newH = parseInt((i-centerH)*Math.cos(radian)-(k-centerW)*Math.sin(radian)+outH/2);
                var newW = parseInt((i-centerH)*Math.sin(radian)+(k-centerW)*Math.cos(radian)+outW/2);

                tmpArray[i][k]=parseInt
                if(newH<0 || newH>=outH)
                    value=255;
                else if(newW<0 || newW>=outW)
                    value=255;
                else
                    value=outImage[rgb][newH][newW];
                tmpArray[rgb][i][k]=value;    
            }
        }
    }
    
    outImage = new Array(4);
    for(var rgb=0; rgb<4; rgb++){
        outImage[rgb] = new Array(rh);
        for(var i=0; i<rh; i++){
            outImage[rgb][i] = new Array(rw);
            for(var k=0; k<rw; k++){
                outImage[rgb][i][k]=tmpArray[rgb][i][k];
            }
        }
    }
   
    outH=rh;
    outW=rw;
    displayImage();
}
//301. 히스토그램 스트레칭
function histoStretch(){
    //out=(in-low)/(high-low)*255
    var high=[], low=[]; 
    //최대, 최소 찾기
    for(var rgb=0; rgb<3; rgb++){
        high[rgb]=low[rgb]=outImage[rgb][0][0]; //초기값을 실제값으로 주어야 오류 안남
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(high[rgb]<outImage[rgb][i][k])
                    high[rgb]=outImage[rgb][i][k];
                if(low[rgb]>outImage[rgb][i][k])
                    low[rgb]=outImage[rgb][i][k]; 
            }
        }
    }
    
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var outVal=(outImage[rgb][i][k]-low[rgb])/(high[rgb]-low[rgb])*255.0;
                outImage[rgb][i][k]=parseInt(outVal);
            }
        }
    }
    displayImage();
}
//302. 엔드인 탐색
function endInSearch(){
    //out=(in-low)/(high-low)*255
    var high=[], low=[]; 
    //최대, 최소 찾기
    for(var rgb=0; rgb<3; rgb++){
        high[rgb]=low[rgb]=outImage[rgb][0][0]; //초기값을 실제값으로 주어야 오류 안남
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                if(high[rgb]<outImage[rgb][i][k])
                    high[rgb]=outImage[rgb][i][k];
                if(low[rgb]>outImage[rgb][i][k])
                    low[rgb]=outImage[rgb][i][k]; 
            }
        }
        high[rgb]-=30;
        low[rgb]+=30;
    }
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var outVal=(outImage[rgb][i][k]-low[rgb])/(high[rgb]-low[rgb])*255.0;
                if(outVal>255.0)
                    outVal=255.0;
                if(outVal<0.0)
                    outVal=0.0;
                outImage[rgb][i][k]=parseInt(outVal);
            }
        }
    }
    displayImage();
}
//303. 평활화
function histoEqual(){
    var histo=new Array(3);
    var sumHisto=new Array(3);
    var normalHisto = new Array(3);
    
    //1단계: 빈도수 히스토그램 생성
    for(var rgb=0; rgb<3; rgb++){
        histo[rgb]=new Array(256);
        for(var i=0; i<256; i++) //초기화
            histo[rgb][i]=0;
    }
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){ //빈도 수 조사
            for(var k=0; k<outW; k++){
                value=outImage[rgb][i][k];
                histo[rgb][value]++;
            }
        }
    }
    
    //2단계: 누적 히스토그램 생성
    for(var rgb=0; rgb<3; rgb++){
        sumHisto[rgb]=new Array(256);
        var sumValue=0;
        for(var i=0; i<256; i++){//초기화
            //sumHisto[rgb][i]=0;
            sumValue+=histo[rgb][i];//누적합
            sumHisto[rgb][i]=sumValue;
        }
    }

    //3단계: 정규화된 누적 히스토그램
    //n=sumHisto*(1/총픽셀수)*화소최대밝기(255)
    for(var rgb=0; rgb<3; rgb++){
        normalHisto[rgb] = new Array(256);
        for(var i=0; i<256; i++){
            //normalHisto[rgb][i]=0;
            normalHisto[rgb][i]=sumHisto[rgb][i]*(1/(outH*outW))*255;
        }
    }
    
    //정규화 히스토그램 적용
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){ 
            for(var k=0; k<outW; k++){
                var outVal = normalHisto[rgb][outImage[rgb][i][k]];
                if(outVal>255.0)
                    outVal=255.0;
                if(outVal<0.0)
                    outVal=0.0;
                outImage[rgb][i][k]=parseInt(outVal);
            }
        }
    }
    displayImage();
}
//401. 엠보싱
function embossing(){
    //화소영역처리(mask) 3x3
    var mask=[[-1.0, 0.0, 0.0],
                [ 0.0, 0.0, 0.0],
                [ 0.0, 0.0, 1.0]];

    convolution(mask, true); //화소 영역 처리 공통함수
    displayImage();
}
 //402. 블러링
 function blurring() { // 크기 지정
    // 화소영역처리 (마스크)
    var mSize = parseInt(document.getElementById("blurSlider").value);
    var mask = new Array(mSize); 
    for (var i=0; i<mSize; i++)
        mask[i] = new Array(mSize);

    for(var i=0; i<mSize; i++) {
        for(var k=0; k<mSize; k++) {
            mask[i][k] = 1.0 / (mSize*mSize);
        }
    }
    convolution(mask, false); //화소 영역 처리 공통함수
    displayImage();
}
//403. 가우시안 스무딩
function gaussian(){
    //화소영역처리(mask) 3x3
    var mask=[[ 1/16, 1/8, 1/16],
                [ 1/8, 1/4, 1/8],
                [ 1/16, 1/8, 1/16]];
    convolution(mask, false); //화소 영역 처리 공통함수
    displayImage();
}
//404. 샤프닝1
function sharpening1(){
    //화소영역처리(mask) 3x3
    var mask=[[-1.0, -1.0, -1.0],
                [-1.0, 9.0, -1.0],
                [-1.0, -1.0, -1.0]];
    convolution(mask, false); //화소 영역 처리 공통함수
    displayImage();
}
//405. 샤프닝2
function sharpening2(){
    //화소영역처리(mask) 3x3
    var mask=[[0.0, -1.0, 0.0],
                [-1.0, 5.0, -1.0],
                [0.0, -1.0, 0.0]];
    convolution(mask, false); //화소 영역 처리 공통함수
    displayImage();
}
//406. 고주파 필터 샤프닝
function hpfSharp(){
    //화소영역처리(mask) 3x3
    var mask=[[-1/9.0, -1/9.0, -1/9.0],
                [ -1/9.0, 8/9.0, -1/9.0],
                [ -1/9.0, -1/9.0, -1/9.0]];
    convolution(mask, true); //화소 영역 처리 공통함수
    displayImage();
}
//407. 저주파 필터 샤프닝
function lpfSharp(){
    //화소영역처리(mask) 3x3
    var mask=[[1/9.0, 1/9.0, 1/9.0],
                [1/9.0, 1/9.0, 1/9.0],
                [1/9.0, 1/9.0, 1/9.0]];
    convolution(mask, 'lpf'); //화소 영역 처리 공통함수
    displayImage();
}
//408. 경계선1 이동과 차분(수직)
function shiftVer(){
    //화소영역처리(mask) 3x3
    var mask=[[0.0, 0.0, 0.0],
                [-1.0, 1.0, 0.0],
                [0.0, 0.0, 0.0]];
    convolution(mask, true); //화소 영역 처리 공통함수
    displayImage();
}
//409. 경계선2 이동과 차분(수평)
function diffHor(){
    //화소영역처리(mask) 3x3
    var mask=[[0.0, -1.0, 0.0],
                [0.0, 1.0, 0.0],
                [0.0, 0.0, 0.0]];
    convolution(mask, true); //화소 영역 처리 공통함수
    displayImage();
}
//화소 영역 처리 공통함수
function convolution(mask, plus){
    // 임시 입력 배열 (입력 배열 + (mSize - 1) )
    var hSize = mask.length - 1; // 임시 입력 배열 크기
    var tmpInImage = new Array(3); 

    for(var rgb=0; rgb<3; rgb++){
        tmpInImage[rgb] = new Array(inH+hSize); 
        for (var i=0; i<outH+hSize; i++){
            tmpInImage[rgb][i] = new Array(inW+hSize);
            for(var k=0; k<outW+hSize; k++) {
                tmpInImage[rgb][i][k] = 127; // 임시 입력 배열 초기화 (127)
            }
        }
    }
    //입력 배열 -> 임시 입력 배열
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                tmpInImage[rgb][i+1][k+1]=outImage[rgb][i][k];
            }
        }
    }
    //임시 출력 배열
    var tmpOutImage = new Array(3);
    for(var rgb=0; rgb<3; rgb++){
        tmpOutImage[rgb] = new Array(outH);
        for(var i=0; i<outH; i++){
            tmpOutImage[rgb][i] = new Array(outW);
        }
    }
    //**영상처리 알고리즘 -> 회선 연산
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var s=0.0;
                for(var m=0; m<mask.length ; m++){
                    for(var n=0; n<mask.length ; n++){
                        s += tmpInImage[rgb][i+m][k+n] * mask[m][n];
                    }
                }
                tmpOutImage[rgb][i][k]=s;
            }
        }
    }
    if(plus==true){
        //후처리 작업(마스크 합계가 0이면 127 정도를 더하기)
        for(var rgb=0; rgb<3; rgb++){
            for(var i=0; i<outH; i++){
                for(var k=0; k<outW; k++){
                    tmpOutImage[rgb][i][k] += 127.0;
                }
            }   
        }
    }else if(plus=='lpf'){
        for(var rgb=0; rgb<3; rgb++){
            for(var i=0; i<outH; i++){
                for(var k=0; k<outW; k++){
                    tmpOutImage[rgb][i][k] = (5*outImage[rgb][i][k])-tmpOutImage[rgb][i][k];
                }
            }
        }
    }
    //임시 출력 배열 -> 출력 배열
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var v = tmpOutImage[rgb][i][k];
                if(v>255.0)
                    v=255.0;
                if(v<0.0)
                    v=0.0;
                outImage[rgb][i][k]=parseInt(v);
            }
        }
    }
}
//410. 경계선3 유사 연산자
function homogen(){
    var hSize = 3; // 임시 입력 배열 크기
    var tmpInImage = new Array(3); 
    for(var rgb=0; rgb<3; rgb++){
        tmpInImage[rgb] = new Array(inH+hSize); 
        for (var i=0; i<outH+hSize; i++){
            tmpInImage[rgb][i] = new Array(inW+hSize);
            for(var k=0; k<outW+hSize; k++) {
                tmpInImage[rgb][i][k] = 127; // 임시 입력 배열 초기화 (127)
            }
        }
    }

    //입력 배열 -> 임시 입력 배열
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                tmpInImage[rgb][i+1][k+1]=outImage[rgb][i][k];
            }
        }
    }
    //임시 출력 배열
    var tmpOutImage = new Array(3);
    for(var rgb=0; rgb<3; rgb++){
        tmpOutImage[rgb] = new Array(outH);
        for(var i=0; i<outH; i++){
            tmpOutImage[rgb][i] = new Array(outW);
        }
    }

    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var max = 0.0; //블록이 이동할 때마다 최대값 초기화
                for(n=0; n<3; n++){
                    for(m=0; m<3; m++){
                        if(Math.abs(tmpInImage[rgb][i+1][k+1]-tmpInImage[rgb][i+n][k+m])>=max)
                        //블록의 가운데 값-블록의 주변 픽셀 절대 값중에서 최대값
                            max=Math.abs(tmpInImage[rgb][i+1][k+1]-tmpInImage[rgb][i+n][k+m]);
                    }
                }
                tmpOutImage[rgb][i][k]=max;
            }
        }
    }
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var v = tmpOutImage[rgb][i][k];
                if(v>255.0)
                    v=255.0;
                if(v<0.0)
                    v=0.0;
                outImage[rgb][i][k]=parseInt(v);
            }
        }
    }
    displayImage();
}
//411. 경계선4 차연산자
function diffOper(){
    var hSize = 3; // 임시 입력 배열 크기
    var tmpInImage = new Array(3); 
    for(var rgb=0; rgb<3; rgb++){
        tmpInImage[rgb] = new Array(inH+hSize); 
        for (var i=0; i<outH+hSize; i++){
            tmpInImage[rgb][i] = new Array(inW+hSize);
            for(var k=0; k<outW+hSize; k++) {
                tmpInImage[rgb][i][k] = 127; // 임시 입력 배열 초기화 (127)
            }
        }
    }
    //입력 배열 -> 임시 입력 배열
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                tmpInImage[rgb][i+1][k+1]=outImage[rgb][i][k];
            }
        }
    }
    //임시 출력 배열
    var tmpOutImage = new Array(3);
    for(var rgb=0; rgb<3; rgb++){
        tmpOutImage[rgb] = new Array(outH);
        for(var i=0; i<outH; i++){
            tmpOutImage[rgb][i] = new Array(outW);
        }
    }
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var max = 0.0; //블록이 이동할 때마다 최대값 초기화
                for(n=0; n<3; n++){
                    if(Math.abs(tmpInImage[rgb][i][k+n]-tmpInImage[rgb][i+2][k+(2-n)])>=max)
                        max=Math.abs(tmpInImage[rgb][i][k+n]-tmpInImage[rgb][i+2][k+(2-n)]);
                }
                if(Math.abs(tmpInImage[rgb][i+1][k+2]-tmpInImage[rgb][i+1][k])>=max)
                    max=Math.abs(tmpInImage[rgb][i+1][k+2]-tmpInImage[rgb][i+1][k]);
                tmpOutImage[rgb][i][k]=max;
            }
        }
    }
    for(var rgb=0; rgb<3; rgb++){
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                var v = tmpOutImage[rgb][i][k];
                if(v>255.0)
                    v=255.0;
                if(v<0.0)
                    v=0.0;
                outImage[rgb][i][k]=parseInt(v);
            }
        }
    }
    displayImage();
}
//412. 경계선5 LoG
var log=1;
function laplacian(){
    //화소영역처리(mask) 3x3
    var mask;
    if(log==1){
        mask=[[0.0, 1.0, 0.0],
             [1.0, -4.0, 1.0],
             [0.0, 1.0, 0.0]];
    }else if(log==2){
        mask=[[1.0, 1.0, 1.0],
             [1.0, -8.0, 1.0],
             [1.0, 1.0, 1.0]];
    }else{
        mask=[[-1.0, -1.0, -1.0],
             [-1.0, 8.0, -1.0],
             [-1.0, -1.0, -1.0]];
    }
    convolution(mask, true); //화소 영역 처리 공통함수
    displayImage();
}
//413. 경계선6 DoG
function diffGaussi(){
    var mask = [[0 , 0 , 0 , -1 , -1 , -1 , 0 , 0 , 0 ] , 
                [0 , -2 , -3 , -3 , -3 , -3 , -3 , -2 , 0 ] , 
                [0 , -3 , -2 , -1 , -1 , -1 , -2 , -3 , 0] , 
                [-1 , -3 , -1 , 9 , 9 , 9 , -1 , -3 , -1] , 
                [-1 , -3 , -1 , 9 , 19 , 9 , -1 , -3 , -1] , 
                [-1 , -3 , -1 , 9 , 9 , 9 , -1 , -3 , -1] , 
                [0 , -3 , -2 , -1 , -1 , -1 , -2 , -3 , 0] , 
                [0 , -2 , -3 , -3 , -3 , -3 , -3 , -2 , 0] , 
                [0 , 0 , 0 , -1 , -1 , -1 , 0 , 0 , 0 , ]];
    convolution(mask, false); //화소 영역 처리 공통함수
    displayImage();
}
//채도
function changeSaturation(){
    var s_value = parseFloat(document.getElementById("satuSlider").value);
    //***영상 처리 알고리즘 ***
    for(var i=0; i<inH; i++){
        for(var k=0; k<inW; k++){
            var R = outImage[0][i][k];
            var G = outImage[1][i][k];
            var B = outImage[2][i][k];
            //RGB -> HSV
            var hsv = rgb2hsv(R,G,B); //{h:120, s:0.4, v:0.3}
            var H = hsv.h;
            var S = hsv.s;
            var V = hsv.v;
            //채도 변경
            S += s_value;
            //HSV -> RGB
            var rgb = hsv2rgb(H,S,V); //{r:150, g:33, b:253}
            R = rgb.r;
            G = rgb.g;
            B = rgb.b;

            outImage[0][i][k] = R;
            outImage[1][i][k] = G;
            outImage[2][i][k] = B;
        }
    }
    displayImage();
}
//명도
function changeValue(){
    var v_value = parseFloat(document.getElementById("valueSlider").value);
    //***영상 처리 알고리즘 ***
    for(var i=0; i<inH; i++){
        for(var k=0; k<inW; k++){
            var R = outImage[0][i][k];
            var G = outImage[1][i][k];
            var B = outImage[2][i][k];
            //RGB -> HSV
            var hsv = rgb2hsv(R,G,B); //{h:120, s:0.4, v:0.3}
            var H = hsv.h;
            var S = hsv.s;
            var V = hsv.v;
            //명도 변경
            V += v_value;
            //HSV -> RGB
            var rgb = hsv2rgb(H,S,V); //{r:150, g:33, b:253}
            R = rgb.r;
            G = rgb.g;
            B = rgb.b;

            outImage[0][i][k] = R;
            outImage[1][i][k] = G;
            outImage[2][i][k] = B;
        }
    }
    displayImage();
}
//색상추출
function pickColor(){
    var value = parseInt(document.getElementById("hueSelect").value);
    var range = parseInt(document.getElementById("hueRange").value);
    if(!$('#hueSelect > option:selected').val()) {return false;} //select 선택 여부
    var startColor=value, endColor=value+range; //0~360도
    var tmpImage = makeTmpImage();

    if(endColor>360){
        endColor=360;
    }
    //***영상 처리 알고리즘 ***
    for(var i=0; i<inH; i++){
        for(var k=0; k<inW; k++){
            var R = tmpImage[0][i][k];
            var G = tmpImage[1][i][k];
            var B = tmpImage[2][i][k];
            //RGB -> HSV
            var hsv = rgb2hsv(R,G,B); //{h:120, s:0.4, v:0.3}
            var H = hsv.h; //0~1.0 *360
            var S = hsv.s;
            var V = hsv.v;
            //H범위 추출
            if(startColor<(H*360)&&(H*360)<endColor){ //색상 범위
                //HSV -> RGB
                var rgb = hsv2rgb(H,S,V); //{r:150, g:33, b:253}
                R = rgb.r;
                G = rgb.g;
                B = rgb.b;

                tmpImage[0][i][k] = R;
                tmpImage[1][i][k] = G;
                tmpImage[2][i][k] = B;
            }else{ //나머지는 그레이
                var rgb = parseInt((R+G+B)/3);
                tmpImage[0][i][k] = rgb;
                tmpImage[1][i][k] = rgb;
                tmpImage[2][i][k] = rgb;
            }
        }
    }
    
    displayImage(tmpImage);
    $("#hsvSMenu").mouseleave(function () {
        for(var i=0; i<outH; i++){
            for(var k=0; k<outW; k++){
                outImage[0][i][k]=tmpImage[0][i][k]; 
                outImage[1][i][k]=tmpImage[1][i][k];
                outImage[2][i][k]=tmpImage[2][i][k];
                outImage[3][i][k]=tmpImage[3][i][k];
            }
        }
        tmpImage=null;
    });
}
//rgb -> hsv 변환
function rgb2hsv(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }
    return {
        h: h,    s: s,    v: v
    };
}
//hsv -> rgb 변환
function hsv2rgb(h, s, v) {
    var r, g, b, i, f, p, q, t;

    h = h*360;  s = s*100;    v = v*100;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    
    h /= 360;   s /= 100;     v /= 100;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
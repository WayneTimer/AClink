var jpg_width="60"; //图片宽度
var jpg_height="52"; //图片高度
var td_width=62; //每个td的宽度
var td_height=57; //每个td的高度
var canvas_sx=227; //canvas起始点x坐标
var canvas_sy=141; //canvas起始点y坐标
var maxn=9; //最大行数
var maxm=12; //最大列数
var maxpic=18; //最大图片种类数
var pairs=3<<1; //每张图片有3对
var sum=new Array(); //每张图片总的个数
var x1,y1,x2,y2,lastpid; //x1的初始值为-1表示未选定
var f=new Array(); //格点中图片的种类id,0表示为空
var way=new Array(); //4个方向
var used=new Array(); //BFS时判断点是否遍历过,>=0-遍历过,转弯数,-1-未遍历
var fa=new Array(); //BFS时记录路径
var face=new Array(); //BFS时记录面对的方向(0-3)
var q1=new Array(); //BFS时队列x坐标
var q2=new Array(); //BFS时队列y坐标
var xmid; //canvas画线时中心点 宽中心 
var ymid; //canvas画线时中心点 高中心
var clear_time=200; //canvas清除配对连线的延迟时间
var AI_time=500; //清除AI提示的延迟时间
var score=0; //得分
var sumpic=0; //已消灭的配对数
var sumtime=5*60*1000; //总时间5分钟,每消去一对加1秒,合计5分54秒
var nowtime=0; //已过时间(秒)
var jindu_left=200; //时间条图片左端横坐标
var jindu_right=1025; //时间条图片右端横坐标
var change_jindu_time=1000; //刷新时间条时间(ms)
var end_flag=false; //结束标记，false为还未结束，true为结束
var tishi_times=10; //提示次数
var chongpai_times=3; //重排次数

function findx(x) //计算鼠标点击canvas上的坐标对应格点
{
  x=Math.floor((x-canvas_sy)/td_height);
  return x;
}

function findy(y) //计算鼠标点击canvas上的坐标对应格点
{
  y=Math.floor((y-canvas_sx)/td_width);
  return y;
}

function click_canvas(event) //点击上层canvas选定下层图片
{
  if (end_flag) return;
  x=event.clientY;
  y=event.clientX;
  x=findx(x);
  y=findy(y)
  choose(x,y);
}

function changeBorder(x,y) //改变选定和未选定图片的border
{
  var border=document.getElementById("img_"+x+"-"+y);
  if (border.className=='choose')
    border.className='unchoose';
  else
    border.className='choose';
}

function clearUsed() //清楚遍历标记
{
  var i,j;
  for (i=0;i<=maxn+1;i++)
    for (j=0;j<=maxm+1;j++)
      used[i][j]=-1;
}

function check(x,y,t) //检查是否超出边界
{
  if (t>2) return false;
  if (x<0) return false;
  if (x>maxn+1) return false;
  if (y<0) return false;
  if (y>maxm+1) return false;
  if (used[x][y]==-1) return true;
  if (used[x][y]<t) return false;
  return true;
}

function BFS(x,y) //BFS找是否有路径连接
{
  var i,head,tail,tx,ty,tt;
  var turn=new Array(); //转弯的次数
  clearUsed();
  used[x1][y1]=true;
  q1[0]=x1;
  q2[0]=y1;
  face[0]=-1;
  turn[0]=-1;
  fa[0]=-1;
  head=-1;
  tail=0;
  do
  {
    head++;
    for (i=0;i<4;i++)
    {
      tx=q1[head]+way[i][0];
      ty=q2[head]+way[i][1];
      tt=turn[head];
      if (face[head]!=i) tt++;
      if (check(tx,ty,tt))
      {
        if (f[tx][ty]==0||(tx==x&&ty==y))
        {
          tail++;
          q1[tail]=tx;
          q2[tail]=ty;
          face[tail]=i;
          turn[tail]=tt;
          fa[tail]=head;
          used[tx][ty]=tt;
          if (tx==x&&ty==y)
            return tail;
        }
      }
    }
  } while (head<tail);
  return 0;
}

function choose(x,y) //选定图片
{
  if (f[x][y]==0) return;
  if (x1==-1)
  {
    changeBorder(x,y);
    x1=x;
    y1=y;
    lastpid=f[x][y];
    return;
  }
  if (x1==x&&y1==y) return;
  var tail;
  if (f[x][y]==lastpid&&(tail=BFS(x,y))>0)
  {
    sum[lastpid]-=2;
    changeBorder(x,y);
    x2=x;
    y2=y;
    draw(tail);
    setTimeout("cls("+x1+","+y1+","+x2+","+y2+")",clear_time);
    f[x1][y1]=0;
    f[x2][y2]=0;
    x1=-1;
  }
  else
  {
    changeBorder(x1,y1);
    changeBorder(x,y);
    x1=x;
    y1=y;
    lastpid=f[x][y];
  }
}

function draw(a) //canvas连线
{
  var c=document.getElementById("myCanvas");
  var cxt=c.getContext("2d");
  var ax,ay;
  cxt.beginPath();
  cxt.lineWidth=4;
  ay=q1[a]+1;
  ax=q2[a]+1;
  cxt.moveTo((ax*2-1)*xmid,(ay*2-1)*ymid); //strange?
  do
  {
    a=fa[a];
    ay=q1[a]+1;
    ax=q2[a]+1;
    //alert("ax="+ax+",ay="+ay);
    cxt.lineTo((ax*2-1)*xmid,(ay*2-1)*ymid);
  } while (a!=0);
  cxt.stroke();
}

function cls(a1,b1,a2,b2) //canvas清除连线及table清除两配对图片
{
  var c=document.getElementById("myCanvas");
  var cxt=c.getContext("2d");
  cxt.clearRect(0,0,868,627);
  var img,td;
  //td = document.getElementById("td_" + a1 + "-" + b1);
  img=document.getElementById("img_"+a1+"-"+b1);
  img.setAttribute("class","unchoose");
  //td.removeChild(img);
  img.setAttribute("class","kill");
  //td = document.getElementById("td_" + a2 + "-" + b2);
  img=document.getElementById("img_"+a2+"-"+b2);
  img.setAttribute("class","unchoose");
  //td.removeChild(img);
  img.setAttribute("class","kill");
  //------
  sumpic++;
  score++;
  sumtime+=1000;
  var temp;
  temp=document.getElementById("score");
  temp.innerHTML=score;
  //------
  if (sumpic>=maxn*maxm>>1)
  {
    end_flag=true;
    //alert("You win! 耗时:"+nowtime+"秒");
    window.location.href="./win.html?"+nowtime;
  }
}

function init() //随机分配maxpic个图片到f[][]里
{
  var tr,td,img,table;
  var i,j,x,inc; //inc用来控制随机图片时出现多于maxpic时找下一个的增减方向
  for (i=1;i<=maxpic;i++)
    sum[i]=0;
  x1=-1;
  for (i=0;i<4;i++)
  {
    way[i]=new Array();
    way[i][0]=0;
    way[i][1]=0;
  }
  way[0][0]=-1;
  way[1][1]=1;
  way[2][0]=1;
  way[3][1]=-1;
  xmid=td_width/2;
  ymid=td_height/2;
  table=document.getElementById("table1");
  for (i=0;i<=maxn+1;i++)
  {
    f[i]=new Array();
    used[i]=new Array();
    tr=document.createElement("tr");
    for (j=0;j<=maxm+1;j++)
    {
      used[i][j]=-1;
      td=document.createElement("td");
      td.setAttribute("id","td_"+i+"-"+j);
      if (i==0||j==0||i==maxn+1||j==maxm+1)
        f[i][j]=0;
      else
      {
        img=document.createElement("img");
        x=Math.floor(Math.random()*maxpic)+1; //获得1~maxpic的随机数
        if ((i+j)&1)
          inc=1;
        else
          inc=-1;
        while (sum[x]>=pairs)
        {
          x+=inc;
          if (x>maxpic) x-=maxpic;
          if (x<=0) x+=maxpic;
        }
        f[i][j]=x;
        sum[x]++;
        img.setAttribute("src","./images/"+maxpic+"_AC_png/"+x+".png");
        img.setAttribute("id","img_"+i+"-"+j);
        img.setAttribute("class","unchoose");
        img.setAttribute("width",jpg_width);
        img.setAttribute("height",jpg_height);
        img.setAttribute("border","0");
        td.appendChild(img);
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  var temp;
  temp=document.getElementById("tishi_times");
  temp.innerHTML=tishi_times;
  temp=document.getElementById("chongpai_times");
  temp.innerHTML=chongpai_times;
}

function cls_AI(i1,j1,i2,j2) //清除AI选定图片蓝框
{
  var img;
  img=document.getElementById("img_"+i1+"-"+j1);
  img.className='unchoose';
  img=document.getElementById("img_"+i2+"-"+j2);
  img.className='unchoose';
  if (x1!=-1)
  {
    img=document.getElementById("img_"+x1+"-"+y1);
    img.setAttribute("class","choose");
  }
}

function AI() //提示两个可行配对图片
{
  if (tishi_times<=0) return;
  tishi_times--;
  var temp;
  temp=document.getElementById("tishi_times");
  temp.innerHTML=tishi_times;
  var i1,j1,i2,j2;
  i1=x1;
  j1=y1;
  for (x1=1;x1<=maxn;x1++)
    for (y1=1;y1<=maxm;y1++)
      if (f[x1][y1]!=0)
      {
        for (i2=1;i2<=maxn;i2++)
          for (j2=1;j2<=maxm;j2++)
            if (f[i2][j2]!=0&&!(x1==i2&&y1==j2)&&f[x1][y1]==f[i2][j2])
            {
              if (BFS(i2,j2)>0)
              {
                var img;
                img=document.getElementById("img_"+x1+"-"+y1);
                img.setAttribute("class","AI_choose");
                img=document.getElementById("img_"+i2+"-"+j2);
                img.setAttribute("class","AI_choose");
                var t1,t2;
                t1=x1;
                t2=y1;
                x1=i1;
                y1=j1;
                setTimeout("cls_AI("+t1+","+t2+","+i2+","+j2+")",AI_time);
                return;
              }
            }
      }
  alert("sorry! There is no pictures can be linked.");
}

function chongpai_AI() //重排AI
{
  if (chongpai_times<=0) return;
  chongpai_times--;
  var temp;
  temp=document.getElementById("chongpai_times");
  temp.innerHTML=chongpai_times;
  x1=-1;
  var i,j,x,inc;
  var allpic;
  allpic=new Array();
  for (i=1;i<=maxpic;i++)
    allpic[i]=0;
  for (i=1;i<=maxn;i++)
    for (j=1;j<=maxm;j++)
      if (f[i][j]!=0)
      {
        x=Math.floor(Math.random()*maxpic)+1; //获得1~maxpic的随机数
        if ((i+j)&1)
          inc=1;
        else
          inc=-1;
        while (allpic[x]>=sum[x])
        {
          x+=inc;
          if (x>maxpic) x-=maxpic;
          if (x<=0) x+=maxpic;
        }
        f[i][j]=x;
        allpic[x]++;
        img=document.getElementById("img_"+i+"-"+j);
        img.setAttribute("src","./images/"+maxpic+"_AC_png/"+x+".png");
        img.setAttribute("class","unchoose");
      }
}

function change_jindu() //改变时间条图片位置
{
  if (end_flag) return;
  if (sumpic<maxn*maxm>>1)
  {
    t=(sumtime-nowtime*1000)/sumtime;
    if (t<=0)
    {
      end_flag=true;
      lost();
      //alert("Time out! You lost!");
      return;
    }
    if (t<0.75&&flag==0)
    {
      jindu.setAttribute("src","./images/PS/jindu/18.png");
      flag++;
    }
    if (t<0.5&&flag==1)
    {
      jindu.setAttribute("src","./images/PS/jindu/22.png");
      flag++;
    }
    if (t<0.25&&flag==2)
    {
      jindu.setAttribute("src","./images/PS/jindu/53.png");
      flag++;
    }
    t=(jindu_right-jindu_left)*t+jindu_left;
    jindu.style.left=t+"px";
    nowtime+=Math.floor(change_jindu_time/1000);
    setTimeout("change_jindu()",change_jindu_time);
  }
}

function restart() //重新开始游戏
{
  window.location.reload();
}

function ret() //返回主菜单
{
  window.location.href="./start.html";
}

function lost_1() //"游"
{
  var t;
  t=document.getElementById("lost1");
  t.style.left="480px";
  t.innerHTML="游";
  setTimeout("lost_2()",500);
}

function lost_2() //"戏"
{
  var t;
  t=document.getElementById("lost2");
  t.style.left="580px";
  t.innerHTML="戏";
  setTimeout("lost_3()",500);
}

function lost_3() //"失"
{
  var t;
  t=document.getElementById("lost3");
  t.style.left="680px";
  t.innerHTML="失";
  setTimeout("lost_4()",500);
}

function lost_4() //"败"
{
  var t;
  t=document.getElementById("lost4");
  t.style.left="780px";
  t.innerHTML="败";
}

function lost() //失败后显示文字
{
  var timeout;
  timeout=document.getElementById("timeout");
  timeout.innerHTML="时间耗尽";
  setTimeout("lost_1()",500);
}

var jindu,flag;
init();
jindu=document.getElementById("jindu");
flag=0;
change_jindu();
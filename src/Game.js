import React, { Component } from 'react';
import HandCard from './HandCard'
import Card from './Card'
import mp3 from './sleep.mp3'
import Background from './battle-background.jpg';
import FuncMenu from './FuncMenu';
//import $ from 'jquery';
import Button from 'react-bootstrap/Button';
import { findRenderedDOMComponentWithClass } from 'react-dom/cjs/react-dom-test-utils.production.min';
class Game extends Component{
    constructor(props){
        super(props)
        this.dictionary=["1W","2W","3W","4W","5W","6W","7W","8W","9W","1T","2T","3T","4T","5T","6T","7T","8T","9T","1S","2S","3S","4S","5S","6S","7S","8S","9S","DONG","NAN","XI","BEI","ZHONG","FA","BAI","space"];
        this.storeNow=0;//保存現在輪到誰
        this.canDo=[];
        this.player=[new HandCard(this,0,0),new HandCard(this,1,0),new HandCard(this,2,0),new HandCard(this,3,0)]
        this.allCard=[]
        this.playernum=props.playernum
        this.current=0;
        this.now=0;
        this.game_end=0;
        this.kan=-1
        this._kan=-1//暗槓
        this.pon=-1
        this.eat=-1
        this.win=-1
        this.show=0;
        this.state={
            change:true,
            showFuncMenu:false
        }
        this.ended=true
        this.allCard=[]
        this.dropedCard=[]
            for(let j=0;j<4;j++){
                for(let i=0;i<34;i++){
                this.allCard[i*4+j]=i;
            }
        }
         for(let i=0;i<136;i++){//洗牌
             let idx=Math.floor(Math.random()*136);
             [this.allCard[i],this.allCard[idx]]=[this.allCard[idx],this.allCard[i]];//swap
         }
        for(let j=0;j<4;j++){
            for(let i=0;i<16;i++){
                this.player[j].haveID.push(this.current)
                this.player[j].num[this.allCard[ this.current]]++
                this.player[j].have.push(this.allCard[ this.current++])
            }   
            this.player[j].have.sort(function(a,b){
                return a-b;
            })
            this.player[j].generate_listenlist()
        }
        //抽牌
        
        console.log("把功能列藏起來")
        this.first_draw()

    }
    printAll(){
        let all=[]
        let now=64;
        for(let j=0;j<4;j++){
            
            all.push(this.player[j].render())
            
            all.push(<br/>)
        }
        for(let k=now;k<this.allCard.length;k++){
            all.push(<Card card={this.allCard[k]}/>)
        }
        return all
    }
    printArrayCard(array,start=0,who=0){
        let all=[]
        for(let k= start;k<array.length;k++){
            all.push(<Card key={Math.random()}show={0} playernum={who} card={array[k]}/>)
        }
        return all
    }
    //ex:碰7萬之後 自己在摸到一張7萬
    light_kan(){//明槓
        if(this.win!=-1)
            return
        let kanlist=[];//可能一回合槓很多次
        //找亮搭的堆 如果手牌中有一張牌已經碰過
        let tmp=this.player[this.now].showlist
        let tmp2=this.player[this.now].have
        for(let i=2;i<tmp.length;i++){
            if(tmp[i]==tmp[i-1]&&tmp[i]==tmp[i-2]){
                for(let j=0;j<tmp2.length;j++){
                    if(tmp2[j]==tmp[i]){
                        kanlist.push(tmp[i])
                        break;
                    }
                }
            }
        }
        if(kanlist.length==0)
            return -1;
        if(this.now==0){
            for(let i=0;i<kanlist.length;i++){
                let reply=window.prompt("要明槓"+this.dictionary[kanlist[i]]+"嗎?(0=不槓 else=明槓)","0");
                if(reply=="0")
                    continue;
                return kanlist[i];
            }
            return -1;
        }   
        else
            return kanlist[0]; 
    }
    dark_kan(){//暗槓
        let kanlist=[];//一回合可能槓很多次 選擇要槓哪張
        if(this.win!=-1||this.kan!=-1)
            return
        for(let i=0;i<34;i++){
            if(this.player[this.now].num[i]==4)
                kanlist.push(i);
        }
        if(kanlist.length==0)//無牌可槓
            return -1;
        if(this.now==0){
            for(let i=0;i<kanlist.length;i++){
                let reply=window.prompt("要暗槓"+this.dictionary[kanlist[i]]+"嗎?(0=不槓 else=暗槓)","0");
                if(reply=="0")
                    continue;
                return kanlist[i];//槓哪一張
            }
            return -1;
        }   
        else
            return kanlist[0]; //槓哪一張
    }
    first_draw(){//先假設抽第一張牌不能槓不然會出大事
        console.log("剩"+(136-this.current).toString()+"張牌")
        console.log("玩家"+this.now.toString()+"抽")
        let card=this.allCard[this.current]
        this.player[this.now].num[card]++//num++
        this.player[this.now].have.push(this.allCard[this.current++])
    }
    draw(){
        if(136-this.current==16){//16
            window.alert("流局 遊戲結束")
            this.game_end=1;
            //結算
            return;
        }
        console.log("剩"+(136-this.current).toString()+"張牌")
        console.log("玩家"+this.now.toString()+"抽")
        let card=this.allCard[this.current]
        this.player[this.now].num[card]++//num++
        this.player[this.now].have.push(this.allCard[this.current++])
        //judge kan win
        this.win=this.self_win(card)
        this.kan=this.light_kan()
        this._kan=this.dark_kan()
        if(this.win!=-1){
            window.alert("玩家"+this.now.toString()+"自摸 遊戲結束")
            let loglist=this.calculate_reward(card,this.now)
            for(let i=0;i<loglist.length;i++)
                console.log(loglist[i])
            this.game_end=1
            return
            //結算畫面
        }
        else if(this.kan!=-1){
            this.player[this.now].remove(this.kan)
            this.player[this.now].showlist.push(this.kan)
            console.log(this.now.toString()+"明槓")
            this.draw()
        }
        else if(this._kan!=-1){
            for(let i=0;i<4;i++){
                this.player[this.now].remove(this._kan)
                this.player[this.now].showlist.push(this._kan)
            }
            this.player[this.now].dark_ker++;
            console.log(this.now.toString()+"暗槓")
            this.draw()
        }
    
    }
    
       
    someone_can_pon(card){//碰
         if(this.win!=-1||this.kan!=-1)//如果選擇槓，則不能碰
             return -1;
        let n=this.now;
         let ans=-1;//無人能碰
         for(let i=0;i<4;i++)
             if(n!=i&&this.player[i].num[card]>=2)//不能碰自己&該牌>=2
                 ans=i;
         if(ans==0){//玩家決定要不要碰
            if(this.kan!=-1)
                return -1;
            //  let reply=window.prompt("要碰嗎?(0=不碰 else=碰)","0");

           
         }
         return ans;
    }
//     someone_can_pon(card){//碰
//         if(this.win!=-1||this.kan!=-1)//如果選擇槓，則不能碰
//             return -1;
//        let n=this.now;
//         let ans=-1;//無人能碰
//         for(let i=0;i<4;i++)
//             if(n!=i&&this.player[i].num[card]>=2)//不能碰自己&該牌>=2
//                 ans=i;
//         if(ans==0){//玩家決定要不要碰
//            if(this.kan!=-1)
//                return -1;
//             let reply=window.prompt("要碰嗎?(0=不碰 else=碰)","0");
//             if(reply=="0")
//                 ans=-1;
//         }
//         return ans;
//    }
    someone_can_kan(card){//槓
        if(this.win!=-1)
            return -1
        let n=this.now
        let next=(n+1)%4;
        let ans=-1;
        for(let i=0;i<4;i++)
            if(i!=n&&i!=next&&this.player[i].num[card]==3)//不能槓自己跟上家
                ans= i;
        if(ans==0){
            // let reply=window.prompt("要槓嗎?(0=不槓 else=槓)","0");
           
        }
        return ans;//哪一家槓牌
    }
 
    next_can_eat(card){//吃
        if(this.win!=-1||this.kan!=-1||this.pon!=-1)
            return -1
        let n=this.now
        let i=(n+1)%4;//下家
        let type=-1 // eat n return 0 = n-1 n-2  1 = n-1 n+1  2 = n+1 n+2
        let k=[];
        let str=[]
        let tmp=this.player[i].num
        k[0]=0
        k[1]=0
        k[2]=0
        str[0]="不吃 "
        str[1]="不吃 "
        str[2]="不吃 "
        //字牌不處理 n 吃 n-1 n-2
        if(card<27&&card%9>1&&tmp[card-2]>0&&tmp[card-1]>0){
            k[0]=1
            str[0]=this.dictionary[card-2]+this.dictionary[card-1]
            console.log("can eat type = 0")
        }
        // n 吃 n-1 n+1
        if(card<27&&card%9>0&&card%9<8&&tmp[card+1]>0&&tmp[card-1]>0){
            k[1]=1;  
            str[1]=this.dictionary[card-1]+this.dictionary[card+1]
            console.log("can eat type = 1")
        }
        // n 吃 n+1 n+2
        if(card<27&&card%9<7&&tmp[card+1]>0&&tmp[card+2]>0){
            k[2]=1
            str[2]=this.dictionary[card+1]+this.dictionary[card+2] 
            console.log("can eat type = 2")
        }
        if(i==0&&(k[0]||k[1]||k[2])){
            let reply=window.prompt("要吃哪一種?(1: "+str[0]+" 2: "+str[1]+" 3: "+str[2] +" else=不吃)","0");
            console.log(reply)
            if(reply=="0")
                type=-1;   
            else if(reply=="1"&&str[0]!="不吃 ")
                type=0
            else if(reply=="2"&&str[1]!="不吃 ")
                type=1
            else if(reply=="3"&&str[2]!="不吃 ")
                type=2
            else
                type=-1
        }
        else{
            for(let j=0;j<3;j++)
                if(k[j])
                    type=j
        }
        return type
    }
    someone_can_win(card){//放槍 目前沒一砲多響 會自動胡牌 搶槓還沒寫
        for(let i=1;i<4;i++){
            let n=(this.now+i)%4
            for(let j=0;j<this.player[n].listenList.length;j++){
                if(card==this.player[n].listenList[j])
                    return n
            }
        }
        return -1
    }
    self_win(card){//自摸 無過水
        for(let i=0;i<this.player[this.now].listenList.length;i++){
            if(card==this.player[this.now].listenList[i])
                return this.now
        }
        return -1
    }
    showFuncMenu(canDo,card){
        // canDo,doEat,doPon,doKan,doWin
        this.canDo=canDo
        this.show=1
        this.setState({
            change:Math.random(),
            showFuncMenu:true,
            card:card
         })
    }
    playerCan(card){//偵測玩家是否可以吃碰槓胡
        let canDo=[0,0,0,0];//分別代表 吃 碰 槓 胡
        // if(this.next_can_eat(card)==0){//TODO
        //     cando[0]=1;
        // }
        if(this.someone_can_pon(card)==0){
            canDo[1]=1;
        }
        if(this.someone_can_kan(card)==0){
            canDo[2]=1;
        }
        if(this.someone_can_win(card)==0){
            canDo[3]=1;
        }
        if(canDo[0]==0&&canDo[1]==0&&canDo[2]==0&&canDo[3]==0)
        return null
        else
        return canDo;
    }
    doPlayerCanDo(card,func){//看看玩家能不能吃碰槓胡，不能的話繼續流程
        let canDo=this.playerCan(card)//偵測玩家能不能吃碰槓胡
        
        if(canDo){//如果可以
            console.log("玩家可以"+canDo)
            this.showFuncMenu(canDo,card,this);//叫出選單供玩家選擇
        }else{
            console.log("玩家不行"+canDo)
            func();//不行的話往下執行
        }
    }
    
    
     doEat(){
    //     let discard=this.state.card
    //     console.log("玩家選擇吃");
    //     this.now=(this.now+1)%4
    //                 if(this.eat==0){
    //                     this.player[0].remove(discard-2)
    //                     this.player[0].showlist.push(discard-2)
    //                     //this.player[this.now].remove(discard)
    //                     this.player[0].showlist.push(discard)
    //                     this.player[0].remove(discard-1)
    //                     this.player[0].showlist.push(discard-1)
    //                 }
    //                 else if(this.eat==1){
    //                     this.player[0].remove(discard-1)
    //                     this.player[0].showlist.push(discard-1)
    //                     //this.player[this.now].remove(discard)
    //                     this.player[0].showlist.push(discard)
    //                     this.player[0].remove(discard+1)
    //                     this.player[0].showlist.push(discard+1)
    //                 }
    //                 else if(this.eat==2){
    //                     this.player[0].remove(discard+1)
    //                     this.player[0].showlist.push(discard+1)
    //                    //this.player[this.now].remove(discard)
    //                     this.player[0].showlist.push(discard)
    //                     this.player[0].remove(discard+2)
    //                     this.player[0].showlist.push(discard+2)
    //                 }
    //                 console.log(this.now+"吃 type = "+this.eat.toString())
    //                 this.botsent() 
        //TODO
    }
    doPon(){
        console.log("玩家選擇碰");
        for(let i=0;i<3;i++){//刪兩張，顯示三張
            if(i!=0)
                this.player[0].remove(this.state.card);
            this.player[0].showlist.push(this.state.card)
        }
        this.now=1
        this.player[this.now].ming_ker++;
        console.log(this.pon+"碰")
        this.canDo=[0,0,0,0]
        this.show=false
        this.botsent()
        
    }
    doKan(){
        let discard=this.state.card
        console.log("玩家選擇槓");
        for(let i=0;i<4;i++){//刪三張，顯示四張
            if(i!=0)
                this.player[0].remove(discard)
            this.player[0].showlist.push(discard)
        }
        this.now=1
        console.log(0+"明槓")
        this.player[this.now].ming_ker++;
        this.canDo=[0,0,0,0]
        this.show=false
        this.draw()
        if(this.game_end)
            return;
        this.botsent()
        
    }
    doWin(){
        this.canDo=[0,0,0,0]
        this.show=false
        console.log("玩家選擇胡");
        let loglist=this.calculate_reward(this.state.card,this.now)
            for(let i=0;i<loglist.length;i++)
                console.log(loglist[i])
        window.alert("玩家"+this.win.toString()+"胡牌 遊戲結束")
        //TODO
    }
    //算台
    calculate_reward(card,who){//胡的那張牌 誰放槍
        let total=0,show=[],win=this.win;//win=誰胡牌
        //*連莊
        let self=0,clear=0
        //自摸
        if(who==win){
            total++;
            show.push("自摸 1台")
            self=1
        }
        //門清
        if(this.player[win].showlist.length==0){
            total++;
            show.push("門清 1台")
            clear=1
        }
        //不求人
        if(self&&clear){
            total++;
            show.push("不求人 1台")
        }
        //單吊/獨聽  (邊張 中洞我懶得寫)
        if(this.player[win].listenList.length==1){
            total++
            show.push("獨聽 1台")
        }
        //*搶槓
        //*槓上開花
        //海底
        if(136-this.current==60){
            total++
            show.push("海底撈月 1台")
        }
        //全求人
        if(this.player[win].have.length==1&&win!=who){
            total+=2
            show.push("全求人 2台")
        }
        let all_ker=this.player[win].ming_ker+this.player[win].dark_ker+this.player[win].ker[card];
        let all_dark_ker=all_ker-this.player[win].ming_ker;
        //三四五案刻
        if(all_dark_ker==5){
            total+=8
            show.push("五暗刻 8台")
        }
        else if(all_dark_ker==4){
            total+=5
            show.push("四暗刻 5台")
        }
        else if(all_dark_ker==3){
            total+=2
            show.push("三暗刻 2台")
        }
        //碰碰胡
        if(all_ker==5){
            total+=4
            show.push("碰碰胡 4台")
        }
        
        
        let word=0,wan=0,sol=0,ton=0
        //混一色
        for(let i=27;i<34;i++)
            word+=this.player[win].num[i];
        if(card>=27&&card<34)
            word++
        for(let i=0;i<9;i++)
            wan+=this.player[win].num[i];
        if(card>=0&&card<9)
            wan++
        for(let i=9;i<18;i++)
            ton+=this.player[win].num[i];
        if(card>=9&&card<18)
            ton++
        for(let i=18;i<27;i++)
            sol+=this.player[win].num[i];
        if(card>=18&&card<27)
            sol++
        //要有字 然後其餘的牌為萬桶條其中一個
        if(word&&((wan&&!sol&&!ton)||(!wan&&sol&&!ton)||(!wan&&!sol&&ton))){
            total+=4
            show.push("混一色 4台")
        }
        //大小三元
        let zhong=0,fa=0,bai=0,dont=0
        if(card==31)
            zhong++
        zhong+=this.player[win].num[31]
        for(let i=0;i<this.player[win].showlist.length;i++)
            if(this.player[win].showlist[i]==31)
                zhong++
        if(card==32)
            fa++
        fa+=this.player[win].num[32]
        for(let i=0;i<this.player[win].showlist.length;i++)
            if(this.player[win].showlist[i]==32)
                fa++;
        if(card==33)
            bai++
        bai+=this.player[win].num[33]
        for(let i=0;i<this.player[win].showlist.length;i++)
            if(this.player[win].showlist[i]==33)
                bai++;

        if(zhong>=3&&fa>=3&&bai>=3){
            total+=8
            show.push("大三元 8台")
            dont=1
        }
        else if(zhong>=2&&fa>=2&&bai>=2){//因為如果有兩個為2不會糊牌，故這樣判斷就好
            total+=4
            show.push("小三元 4台")
            dont=1
        }
        //中發白 大小三元後不用判斷
        if(!dont){
            if(zhong>=3){
                total++
                show.push("紅中 1台")
            }
            if(fa>=3){
                total++
                show.push("發財 1台")
            }
            if(bai>=3){
                total++
                show.push("白板 1台")
            }
        }
        //平胡
        if(all_ker==0&&this.player[win].listenList.length==2&&word==0){//無字無刻聽兩面
            total+=2
            show.push("平胡 2台")
        }
        //*地聽
        //*天聽
        //大小四喜
        let dong=0,nan=0,xi=0,bei=0,donot=0;//27 28 29 30
        if(card==27)
            dong++
        dong+=this.player[win].num[27]
        for(let i=0;i<this.player[win].showlist.length;i++)
            if(this.player[win].showlist[i]==27)
                dong++
        if(card==28)
            nan++
        nan+=this.player[win].num[28]
        for(let i=0;i<this.player[win].showlist.length;i++)
            if(this.player[win].showlist[i]==28)
                nan++;
        if(card==29)
            xi++
        xi+=this.player[win].num[29]
        for(let i=0;i<this.player[win].showlist.length;i++)
            if(this.player[win].showlist[i]==29)
                xi++;
        if(card==30)
            bei++
        bei+=this.player[win].num[30]
        for(let i=0;i<this.player[win].showlist.length;i++)
            if(this.player[win].showlist[i]==30)
                bei++;
        if(dong>=3&&nan>=3&&xi>=3&&bei>=3){
            total+=16
            show.push("大四喜 16台")
            donot=1
        }
        else if(dong>=2&&nan>=2&&xi>=2&&bei>=2){//因為如果有兩個為2不會糊牌，故這樣判斷就好
            total+=8
            show.push("小四喜 8台")
            donot=1
        }
        //東南西北 見字 大小四喜後不用判斷
        if(!donot){
            if(dong>=3){
                total++
                show.push("東風 1台")
            }
            if(xi>=3){
                total++
                show.push("西風 1台")
            }
            if(nan>=3){
                total++
                show.push("南風 1台")
            }
            if(bei>=3){
                total++
                show.push("北風 1台")
            }
        }
        

        //自一色
        if(word&&!wan&&!sol&&!ton){
            total+=16
            show.push("字一色 16台")
        }
        //天地人胡
        if(136-this.current==71){
            if(who==win){//自摸天胡 非自摸人胡
                total+=16
                show.push("天胡 16台")
            }      
            else{
                total+=16
                show.push("人胡 16台")
            }
        }
        else if(136-this.current>=68){
            if(who==win){//自摸地胡 非自摸人胡
                total+=16
                show.push("地胡 16台")
            }      
            else{
                total+=16
                show.push("人胡 16台")
            }
        }
        if(total==0)
            show.push("屁胡 0台")
        console.log("總共 "+total+"台")
        return show;
    }


    botsent(){
        
        if(this.now==0)
        return
        else{
         //console.log("playMusic")
         const music=new Audio(mp3);
         
       
         // console.log("sent reveive"+card)
            // this.player[playernum].have[this.player[playernum].have.indexOf(card),1]=1
            this.setState({
               change:false
            })
         music.play();
         music.onended=(e)=>{
             //電腦打牌
             let discard //要丟掉的牌
             if(this.player[this.now].listenList.length==0){//如果還沒聽牌的話
                discard=this.player[this.now].AI_remove()
                
            }
            else{//如果聽牌的話，只看拿到的牌有沒有在聽牌名單中
                discard=this.player[this.now].have[this.player[this.now].have.length-1]
            }
            this.dropedCard.push(discard)   
            this.player[this.now].remove(discard)
        
            this.player[this.now].generate_listenlist()
            console.log("玩家"+this.now.toString()+"聽:")
            console.log(this.player[this.now].listenList)
            
            this.player[this.now].have.sort(function(a,b){return a-b;})//將牌排序
            console.log(this.player[this.now].num)
            console.log(this.player[this.now].showlist)
            console.log(this.dictionary[discard])
            this.doPlayerCanDo(discard,()=>{ //利用 call back 達成
                this.win=this.someone_can_win(discard)
                this.kan=this.someone_can_kan(discard)
                this.pon=this.someone_can_pon(discard)
                this.eat=this.next_can_eat(discard)
                if(this.win!=-1){
                    window.alert("玩家"+this.win.toString()+"胡牌 遊戲結束")
                    let loglist=this.calculate_reward(discard,this.now)
                    for(let i=0;i<loglist.length;i++)
                        console.log(loglist[i])
                    this.game_end=1;
                    return
                    //結算畫面
                }
                else if(this.kan!=-1){
                    for(let i=0;i<4;i++){//刪三張，顯示四張
                        if(i!=0)
                            this.player[this.kan].remove(discard)
                        this.player[this.kan].showlist.push(discard)
                    }
                    this.now=this.kan
                    console.log(this.kan+"明槓")
                    this.draw()
                    if(this.game_end)
                        return;
                    this.botsent()
                }
                else if(this.pon!=-1){//remove num[discard]-- undo
                    for(let i=0;i<3;i++){//刪兩張，顯示三張
                        if(i!=0)
                            this.player[this.pon].remove(discard)
                        this.player[this.pon].showlist.push(discard)
                    }
                    this.now=this.pon
                    console.log(this.pon+"碰")
                    this.botsent()
                }
                else if(this.eat!=-1){
                    this.now=(this.now+1)%4
                    if(this.eat==0){
                        this.player[this.now].remove(discard-2)
                        this.player[this.now].showlist.push(discard-2)
                        //this.player[this.now].remove(discard)
                        this.player[this.now].showlist.push(discard)
                        this.player[this.now].remove(discard-1)
                        this.player[this.now].showlist.push(discard-1)
                    }
                    else if(this.eat==1){
                        this.player[this.now].remove(discard-1)
                        this.player[this.now].showlist.push(discard-1)
                        //this.player[this.now].remove(discard)
                        this.player[this.now].showlist.push(discard)
                        this.player[this.now].remove(discard+1)
                        this.player[this.now].showlist.push(discard+1)
                    }
                    else if(this.eat==2){
                        this.player[this.now].remove(discard+1)
                        this.player[this.now].showlist.push(discard+1)
                       //this.player[this.now].remove(discard)
                        this.player[this.now].showlist.push(discard)
                        this.player[this.now].remove(discard+2)
                        this.player[this.now].showlist.push(discard+2)
                    }
                    console.log(this.now+"吃 type = "+this.eat.toString())
                    this.botsent()
                }
                else{
                    this.now=(this.now+1)%4; 
                    this.draw()
                    if(this.game_end)
                        return;
                    this.botsent()
                }
                this.setState({
                    change:false
                 })
            })  
        }
    }
}
 
    sent(card,playernum){
        this.disable=true
        const music=new Audio(mp3);
        music.play();
        this.player[playernum].remove(card)
        this.setState({
            change:false
         })
        music.onended=(e)=>{
        this.player[playernum]=this.player[playernum]
       
           // this.player[playernum].have[this.player[playernum].have.indexOf(card),1]=1
        let discard=card
        this.dropedCard.push(card)
        this.player[this.now].generate_listenlist()
        console.log("玩家"+this.now.toString()+"聽:")
        console.log(this.player[this.now].listenList)
       //this.forceUpdate()
       this.player[this.now].have.sort(function(a,b){
        return a-b;
        })
        console.log(this.player[this.now].num)
        console.log(this.player[this.now].showlist)
        this.win=this.someone_can_win(discard)
        this.kan=this.someone_can_kan(discard)
        this.someone_can_pon(discard)
        this.eat=this.next_can_eat(discard)
        console.log(discard)
        //------------------切割成 按鈕後動作---------------------------------------
            if(this.win!=-1){
                window.alert("玩家"+this.win.toString()+"胡牌 遊戲結束")
                let loglist=this.calculate_reward(discard,this.now)
                for(let i=0;i<loglist.length;i++)
                    console.log(loglist[i])
                this.game_end=1;
                return
                //結算畫面
            }
            else if(this.kan!=-1){
                for(let i=0;i<4;i++){//刪三張，顯示四張
                    if(i!=0)
                        this.player[this.kan].remove(discard)
                    this.player[this.kan].showlist.push(discard)
                }
                this.now=this.kan
                console.log(this.kan+"明槓")
                this.draw()
                if(this.game_end)
                    return;
                this.botsent()
            }
            else if(this.eat!=-1){
                this.now=(this.now+1)%4
                if(this.eat==0){
                    this.player[this.now].remove(discard-2)
                    this.player[this.now].showlist.push(discard-2)
                    //this.player[this.now].remove(discard) 這張根本沒進手牌 不能移 
                    this.player[this.now].showlist.push(discard)
                    this.player[this.now].remove(discard-1)
                    this.player[this.now].showlist.push(discard-1)
                }
                else if(this.eat==1){
                    this.player[this.now].remove(discard-1)
                    this.player[this.now].showlist.push(discard-1)
                    //this.player[this.now].remove(discard)
                    this.player[this.now].showlist.push(discard)
                    this.player[this.now].remove(discard+1)
                    this.player[this.now].showlist.push(discard+1)
                }
                else if(this.eat==2){
                    this.player[this.now].remove(discard+1)
                    this.player[this.now].showlist.push(discard+1)
                    //this.player[this.now].remove(discard)
                    this.player[this.now].showlist.push(discard)
                    this.player[this.now].remove(discard+2)
                    this.player[this.now].showlist.push(discard+2)
                }
                console.log(this.now+"吃 type = "+this.eat.toString())
                this.botsent()
            }
            else{//完全沒事發生
                this.now=(this.now+1)%4;
                
                this.draw()
                if(this.game_end)
                    return;
                this.botsent()
            }
            this.disable=false
         }

        
   }
//    btn_pon(){
//     if(this.pon!=-1){
//         for(let i=0;i<3;i++){//刪兩張，顯示三張
//             if(i!=0)
//                 this.player[this.pon].remove(discard)
//             this.player[this.pon].showlist.push(discard)
//         }
//         this.now=this.pon
//         console.log(this.pon+"碰")
//         this.botsent()
//     }
    
// }
    render(props){
            // for(let i=0;i<4;i++)
            // console.log("player"+i+"="+this.player[i].have)
            //
            //console.log("render game")
            //this.now=this.now%4
           /* let b=[],ccnt=0
            if(this.game_end==1){
                let show=setInterval(function(){
                    let a=<div>end</div>;
                    b.push(a)
                    ccnt++;
                    if(ccnt==5)
                        clearInterval(show)
                },1000)
                
                return [b]
            }
            else{*/
                return [
                /*<h1>{(this.now)}</h1>,*/
                //<th class="tg-0pky"></th>
                //<td class="tg-0pky"></td>
                //<td class="tg-0pky" colspan="2" rowspan="2"></td>
                [<table class="tg">
                <thead>
                
                </thead>
                <tbody>
                <tr>
                    
                    <td class="tg-0pky" colspan="2" align = "center" ><div id="player2">{this.player[2].render(this.now)}</div></td>
                    <td class="tg-0pky"></td>
                </tr>
                <tr>
                <td>.</td>
                    </tr>
                <tr>
                <td>.</td>
                    </tr>
                    <tr>
                <td>.</td>
                    </tr>
                    <tr>
                <td>.</td>
                    </tr>
                <tr>
                <td>.</td>
                    </tr>
                <tr>
                <td class="tg-0pky" rowspan="2" width="50%"align="center"><div id="player1">{this.player[3].render(this.now)}</div></td>
                    
                    <td class="tg-0pky" rowspan="2" width="50%" align="center"><div id="player3">{this.player[1].render(this.now)}</div></td>
                
                </tr>
                <tr >
                    <td width="100%" rowspan="2">.</td>
                </tr>
                <tr>
                <td>.</td>
                </tr>
                <tr>
                <td>.</td>
                </tr>
                <tr>
                <td>.</td>
                </tr>
                <tr>
                <td>.</td>
                </tr>
                <tr>
                <td>.</td>
                </tr>
                <tr>
                
                    <td class="tg-0pky" colspan="2" align = "center"><div id="player0">{this.player[0].render(this.now,this.disable)}</div></td>
                    <td class="tg-0pky"></td>
                </tr>
                </tbody>
                </table>
                ,<h1 align="center"></h1>
                ,,<br/>
                ,,<br/>
                ,,<br/>
                ,,<hr></hr>
            ],[this.printArrayCard(this.allCard,this.current),<br/>,<hr/>
                ,this.printArrayCard(this.dropedCard)],
                this.show?
                [<Button key={Math.random()} variant="outline-primary"   onClick={()=>this.doEat()} disabled={!this.canDo[0]}>吃</Button>,
                <Button key={Math.random()} variant="outline-secondary" onClick={()=>this.doPon()} disabled={!this.canDo[1]}>碰</Button>,
                <Button key={Math.random()}variant="outline-success"  onClick={()=>this.doKan()} disabled={!this.canDo[2]}>槓</Button>,
                // <Button variant="outline-warning">聽</Button>,
                <Button key={Math.random()}variant="outline-danger"    onClick={()=>this.doWin()} disabled={!this.canDo[3]}>胡</Button>]
                :<div></div>
            
            ]
        //}
    }
     
}
export default Game
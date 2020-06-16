{
    class Datahandle {
        constructor(data) {
            this.data = data;
            this.nowid = 3;
        }
        /* 数据操作 */
        /**
         * Object getSelf(id) 根据id获取对应的当前项数据 
         * 参数：
         *      id 当前项 id
         * 返回值：
         *    当前项数据  
         * **/
        getSelf(id) {
            return this.data.filter((item) => {
                return item.id == id;
            })[0]
        }
        /** 获取子级 
        * Array getChild(pid) 根据父级的id找到所有的子级
        * 参数：
        *  pid 父级的id
        * 返回值：
        *  对应的所有子级
        * **/
        getChild(pid) {
            return this.data.filter((item) => {
                return item.pid == pid;
            })
        }
        /** 获取父级
        * Object getParent(id) 根据当前项的id找到它的父级
        * 参数：
        *  id 当前项id
        * 返回值：
        *  对应的父级
        * **/

        getParent(id) {
            let s = this.getSelf(id);
            //console.log(s);
            return this.data.filter((item) => {
                return item.id == s.pid;
            })[0];
        }
        /** 获取所有父级 
         * Array getAllParent(id) 根据当前项的id找到它的所有父级
         * 参数：
         *  id 当前项id
         * 返回值：
         *  对应的所有父级
         * **/
        getAllParents(id) {
            let res = [];
            let p = this.getParent(id);
            while (p) {
                res.unshift(p);
                p = this.getParent(p.id)
            }
            return res;

        }
        /**
        * Array getAllChild(id) 根据 id 获取数据的所有子级（包含儿孙）
        * 参数：
        *  数据的id
        * 返回值：
        *  所有子数据
        */
        getAllChilds(id) {
            let res = [];
            let s = this.getSelf(id);
            let This = this;
            subF(s);
            return res;
            function subF(item) {
                let children = This.getChild(item.id);
                if (children.length > 0) {
                    res = res.concat(children);
                    for (let i = 0; i < children.length; i++) {
                        subF(children[i]);
                    }
                }
            }
        }

        getSiblings(id){
          let s = this.getSelf(id);
          let sId=s.id;
          let parent=this.getParent(id);
          if(parent){
            let Siblings=this.getChild(parent.id);
            let res=[];
            Siblings.forEach(item=>{
                if(item.id!=sId){
                    res.push(item)
                }
            })
            return res;
          }else{
            return [];
          }

        }

        pushData(item) {
            this.data.push(item);
        }

        deleteData(id){
           let index=null;
           for(let i=0;i<this.data.length;i++){
               if(this.data[i]["id"]==id){
                  index=i;
                  break
               }
           }
           if(index){
               this.data.splice(index,1);
           }
        }

    }
    
    // let h1 = new Datahandle(data);
    // console.log(h1.getAllChilds(0));
    /* 视图渲染 */
    let treeMenu = document.querySelector(".tree-menu");
    let breadNav = document.querySelector(".bread-nav");
    let folder = document.querySelector("#folders");
    let checkedAll=document.querySelector("#checked-all");
    let HD = new Datahandle(data);
    console.log(HD.getSiblings(0));
    renderLayout();

    function renderLayout() {
        treeMenu.innerHTML=renderTreeMenu();
        renderBreadNav();
        renderFolders();
    }
    //open--true,所有项目都要打开, null--只是当前项的父级和当前项打开
    function renderTreeMenu(open) {
        //所有父项和当前项都应是打开状态
        let arr1 = [...HD.getAllParents(HD.nowid)];
        let arr = arr1.concat(HD.getSelf(HD.nowid));
        let inner = mapInner(-1);
        return inner;
        function mapInner(id) {
            let inner = "";
            let children = HD.getChild(id);
            if (children.length > 0) {
                inner = `<ul>`;
                children.forEach(item => {
                    //判断当前项目层级
                    let level = HD.getAllParents(item.id).length;
                    inner += `                 
                    <li class="${isopen({"open":open,"item":item})}">
                        <p class="${HD.getChild(item.id).length > 0 ? "has-child" : ""} ${item.id == HD.nowid ? "active" : ""}" style="padding-left:${(40 + level * 15) + 'px'}" data-id="${item.id}"><span>${item.title}</span></p>
                        ${mapInner(item.id)}
                    </li> 
                    `;

                })
                inner += `</ul>`;
            }
            return inner;
        }

        function isopen(obj) {
            if(obj.open){
                return "open"
            }else{
               return arr.includes(obj.item) ? "open" : ""
            }
        }

    }
    /* 路径导航渲染 */
    function renderBreadNav() {
        let ele = HD.getSelf(HD.nowid);
        let parEle = HD.getAllParents(HD.nowid);
        let inner = "";
        parEle.forEach(item => {
            inner += `
                    <a data-id="${item.id}">${item.title}</a>
           `;
        })
        inner += `<span data-id="${ele.id}">${ele.title}</span>`;
        breadNav.innerHTML = inner;
        checkAll(HD.getChild(HD.nowid));


    }
    /* 文件夹视图的渲染 */
    function renderFolders() {
        let items = HD.getChild(HD.nowid);
        let inner = "";
        items.forEach(item => {
            inner += `
                <li class="folder-item ${isActive(item)}" data-id="${item.id}">
                    <img src="img/folder-b.png" alt="">
                    <span class="folder-name">${item.title}</span>
                    <input type="text" class="editor" value="${item.title}">
                    <label class="checked">
                        <input type="checkbox" ${isChecked(item)} />
                        <span class="iconfont icon-checkbox-checked"></span>
                    </label>   
                </li>
          `
        })

        function isActive(obj) {
            return obj.isChecked?"active":""
        }

        function isChecked(obj) {
            return obj.isChecked?"checked":""
        }
        folder.innerHTML = inner;
    }
    //弹窗设置
    // 成功弹窗
    let altScs=document.querySelector(".alert-success");
    altScs.timer=null;
    function alertSuccess(info) {
       clearTimeout(altScs.timer);
       altScs.innerHTML=info;
       altScs.classList.add("alert-show");
       altScs.timer=setTimeout(()=>{
        altScs.classList.remove("alert-show");    
       },1000)
    }
    //警告弹窗
    let warns=document.querySelector(".alert-warning");
    warns.timer=null;
    function warnWin(info) {
        clearTimeout(warns.timer);
        warns.innerHTML=info;
        warns.classList.add("alert-show");
        warns.timer=setTimeout(()=>{
          warns.classList.remove("alert-show");
        },1000)
        
    }



    /* 三大视图的事件添加 */
    /** 树状菜单操作 **/
    treeMenu.addEventListener("click", function (e) {
        let ev = e || window.event;
        //console.log(ev.target);
        let item=null;
        if(ev.target.tagName=="SPAN"){
            item=ev.target.parentNode
        }else if(ev.target.tagName=="P"){
            item=ev.target;
        }
        if(item){
            let Id=item.dataset.id;
            HD.nowid=Id;
            renderLayout()
        }
        let contextmenu=document.querySelector("#contextmenu");
        contextmenu.style.display="none";

    })

    /** 路径导航操作 **/
    breadNav.addEventListener("click", function (e) {
        let ev = e || window.event;
        //console.log(ev.target);
        if (ev.target.tagName == "A") {
            //console.log(ev.target.dataset.id);
            let Id = ev.target.dataset.id;
            HD.nowid = Id;
            renderLayout();
        }
    })

    /** 文件夹视图 **/
    folders.addEventListener("click", function (e) {
        let ev = e || window.event;
        let item="";
        if (ev.target.tagName=="LI"){
            item=ev.target;
        }else if(ev.target.parentNode.tagName=="LI"){
            item=ev.target.parentNode;

        }
        if(item){
            let Id=item.dataset.id;
            HD.nowid=Id;
            renderLayout();
        }else{
            let contextmenu=document.querySelector("#contextmenu");
            contextmenu.style.display="none";

        }



    })

    /** 新建文件夹 **/
    let createBtn = document.querySelector(".create-btn");
    createBtn.onclick = function () {
        HD.pushData({
            id:Date.now(),
            pid:HD.nowid,
            title:getFolderName()
        })
        renderLayout();
        alertSuccess("创建文件夹成功！");
    }


    /*获取文件夹名字 新建文件夹(?) 数字不能重复，并且要自动补位*/
    function getFolderName() {
        let eles = HD.getChild(HD.nowid);
        let arr = [];
        eles.forEach(item => {
            arr.push(item.title);
        })
        let selArr = [];//保存 所有新建文件夹(?)
        let selfarr = [];//保存 新建文件夹
        arr.forEach(item => {
            let reg = /新建文件夹(\(\d+\))+/;
            if (item.match(reg)) {
                selArr.push(item)
            } else if (item == "新建文件夹") {
                selfarr.push(item);
            }
        })
        //没有新建文件夹，就补上
        if (selfarr.length == 0) {
            return "新建文件夹";
        }

        //新建文件夹(?) 按数字排序
        let newName = "";
        if (selArr.length > 0) {
            let reg = /[^0-9]/ig;
            selArr.sort((n1, n2) => {
                let a = n1.replace(reg, "");
                let b = n2.replace(reg, "");
                return a - b
            })
            let flag = true;
            for (let i = 0; i < selArr.length; i++) {
                let num = selArr[i].replace(/[^0-9]/ig, "");
                if ((i + 1) != num) {
                    newName = "新建文件夹(" + (i + 1) + ")";
                    flag = false;
                    break;
                }
            }
            //补全最后一位
            if (flag) {
                let num = selArr.length + 1;
                newName = "新建文件夹(" + num + ")";

            }
        }else{

            return "新建文件夹(1)";
        }
        return newName;
    }
    
    
    // 右键菜单
    let contextmenu=document.querySelector("#contextmenu");
    window.addEventListener("contextmenu",(e)=>{
        let ev=e||window.event;
        ev.preventDefault();
        contextmenu.style.display="none";
    })
    window.addEventListener("resize",function(e){
        contextmenu.style.display = "none";
    })
    window.addEventListener("scroll",function(e){
        contextmenu.style.display = "none";
    })

    folders.addEventListener("contextmenu",(e)=>{
       let ev=e||window.event;
       let item="";
       if (ev.target.tagName=="LI"){
           item=ev.target;
       }else if(ev.target.parentNode.tagName=="LI"){
           item=ev.target.parentNode;
       }
       if(item){
        contextmenu.style.display="block";
        let x=ev.clientX;
        let y=ev.clientY;
        let contextmenuWidth=contextmenu.clientWidth;
        let contextmenuHeight=contextmenu.clientHeight;
        let maxW=document.documentElement.clientWidth-contextmenuWidth;
        let maxH=document.documentElement.clientHeight-contextmenuHeight;
        //菜单须要限位
        let xx=Math.min(x,maxW)
        let yy=Math.min(y,maxH);
        contextmenu.style.left=xx+"px";
        contextmenu.style.top=yy+"px";
        //将右击的文件保存下来
        contextmenu.folder=item;
        ev.stopPropagation();//阻止冒泡
       }
       //contextmenu.style.display="block";
       ev.preventDefault();
       
    })
    

    //确认框
    /* confirm 弹窗 */
        let elConfirm = document.querySelector(".confirm");
        let confirmClos = elConfirm.querySelector(".clos");
        let confirmTxt = elConfirm.querySelector(".confirm-text");
        let confirmBtns = elConfirm.querySelectorAll(".confirm-btns a");
        let mask = document.getElementById("mask");
        //回调成功后函数
        function showConfirm(info,resolve,reject) {
            elConfirm.classList.add("confirm-show");
            mask.style.display="block";
            confirmTxt.innerHTML=info;
            contextmenu.style.display="none";
            //不能用 addEventListener, 那样事件要同一事件会被添加多次函数
            confirmClos.onclick=()=>{
                elConfirm.classList.remove("confirm-show");
                mask.style.display="none";
                contextmenu.style.display="none"
            }
            confirmBtns[0].onclick=()=>{
                elConfirm.classList.remove("confirm-show");
                mask.style.display="none";             
                resolve&&resolve();

            }
            confirmBtns[1].onclick=()=>{
                elConfirm.classList.remove("confirm-show");
                mask.style.display="none";
                reject&&reject();           
            }
        }

    //移动操作框
    let moveAlert=document.querySelector(".move-alert");
    let moveAlertClos=moveAlert.querySelector(".clos");
    let moveAlertTMCon=moveAlert.querySelector(".tree-menu");
    let moveAlertBtns=moveAlert.querySelectorAll("nav>a");
    function showMoveAlert(resolve) {
        mask.style.display="block";
        moveAlert.classList.add("move-alert-show");
        //将移动框中选中的文件框Id保存下来
        moveAlert.folderId=HD.nowid;
        //添加当前树状菜单
        moveAlertTMCon.innerHTML=renderTreeMenu(true);
        contextmenu.style.display="none";
        //关闭移动警告框
        //移动提示框内文件夹选择点击,保存目标文件夹
        moveAlertTMCon.onclick=(e)=>{
            let ev=e||window.event;
            let item=null;
            if(ev.target.tagName=="SPAN"){
                item=ev.target.parentNode;
                
            }else if(ev.target.tagName=="P"){
                item=ev.target;
            }
            if(item){
                let Ps=moveAlertTMCon.querySelectorAll("p");
                for(let i=0;i<Ps.length;i++){
                    Ps[i].classList.remove("active");
                }
                item.classList.add("active");
                let Id=item.dataset.id;
                //目标文件夹保存
                moveAlert.folderId=Id;
            }

        }
        moveAlertClos.onclick=function() {
            moveAlert.classList.remove("move-alert-show");
            mask.style.display="none";
        }
        //警告框确认
        moveAlertBtns[0].onclick=function(){
            resolve&&resolve();
            moveAlert.classList.remove("move-alert-show");
            mask.style.display="none";
        }
        //警告框取消
        moveAlertBtns[1].onclick=()=>{
            moveAlert.classList.remove("move-alert-show");
            mask.style.display="none";         
        }

        
    }




    //菜单单项操作
    contextmenu.addEventListener("click",function(e){
        let ev=e||window.event;
        //菜单点击删除时
        if(ev.target.innerHTML=="删除"){
          //显示弹出框，输入点击确认时的回调函数
          showConfirm("确认删除文件夹吗?",()=>{
            deleteFolder(this.folder)
            alertSuccess("成功删除文件夹!");
          });//移动操作
        }else if(ev.target.innerHTML=="移动到"){
            showMoveAlert(()=>{
                let folderId=this.folder.dataset.id;
                if(IsMoveFolder(folderId)){
                    renderLayout();
                    alertSuccess("文件夹移动成功！")
                }else{
                    warnWin("不能移动到该文件夹！")
                }   
            });
        }else if(ev.target.innerHTML=="重命名"){
            ReNameFolder(this.folder);

        }

    })
    //右键删除操作
    function deleteFolder(folder) {
        let Id=Number(folder.dataset.id);
        let arr=[];
        let children=HD.getAllChilds(Id);
        if(children.length>0){
            children.forEach((item)=>{
                arr.push(item)
            })
        }
        let selfele=HD.getSelf(Id);
        arr.push(selfele);
        arr.forEach((item)=>{
          let id=item.id;
          HD.deleteData(id);
        })
        renderLayout();
    }

    //右键移动操作,单个文件夹是否能被移动
    function IsMoveFolder(folderId){
        //let folderId=folder.dataset.id;
        if(moveAlert.folderId){
            //符合移动逻辑
           if(testDoubleId(folderId,moveAlert.folderId)){
               HD.data.forEach(item=>{
                   if(item.id==Number(folderId)){
                       //还要看是否符合重名规则，重名就要改名字
                       item.title=NameHandle(folderId,moveAlert.folderId);
                       item.pid=moveAlert.folderId;
                   }
               })
               return true
           }else{
               return false
           }
        }

    }

    //处理移动后的重名问题
    //cid 当前被移动文件夹id tid目标文件夹id
    function NameHandle(cid,tid) {
        let cEle=HD.getSelf(cid);
        let cName=cEle.title;
        let tEleChildren=HD.getChild(tid);
        let Names=[];
        tEleChildren.forEach(item=>{
            Names.push(item.title);
        })
        
        //Names 是目标文件夹下面已有的文件夹名称池
        // cName 是一个不断被修改的名字
        let resName="";
         modRepeatFolderName(cName,Names);
         return resName;

        function modRepeatFolderName(cName,Names) {
            let res=Names.indexOf(cName);
            if(res!=-1){
                //确实在黑名单中，须要修改当前文件夹名字
              let reg=/\((\d+)\)/;
              let res=reg.test(cName);
              //res:判断文件夹名字中是否含有（1）字样
              //console.log(res);
              if(!res){
                  cName=cName+"(1)";
                  modRepeatFolderName(cName,Names);
              }else{
                  $1=RegExp.$1;
                  let num=Number($1)+1;
                  let reg1=/\((\d+)\)/;
                  let newNum="("+num+")";
                  cName=cName.replace(reg1,newNum);
                  modRepeatFolderName(cName,Names);
              }
              
    
            }else{
                resName=cName;
            }
            
        }
        //-1在黑名单中

        
    }

    //侦测文件的嵌套规则是否符合逻辑
    //folderId 被移动的文件夹 targetId 目标文件夹
    function testDoubleId(folderId,targetId){
       let pid=HD.getParent(folderId);
       let childrenIds=HD.getAllChilds(folderId);
       let selfId=HD.getSelf(folderId);
       //arr 为黑名单，不能是上一级自身父级，不能是自身自己，也不能是自己
       let arr=[pid,...childrenIds,selfId];
       //console.log(arr);
       let arrIds=[];//把所有黑名单的值保存下来
       arr.forEach(item=>{
           arrIds.push(item.id)
       })


       let results=arrIds.indexOf(Number(targetId))
       //console.log(results);
       if(results==-1){
           //不在黑名单中，符合移动逻辑
          return true;
       }else{
           //在黑名单中，不符合逻辑
           return false;
       }
    }

    //右键菜单重命名操作
    function ReNameFolder(obj){
        contextmenu.style.display="none";
        //console.log(obj);
        let NameInput=obj.querySelector("input[type='text']");
        let NameSpan=obj.querySelector("span[class='folder-name']");
        NameInput.style.display="block";
        NameSpan.style.display="none";
        NameInput.onfocus=function (e) {
            this.name=this.value;
        }
        NameInput.onblur=function(){
            NameConfirm(this);
        }
        NameInput.onkeydown=function(e) {
            let ev=e||window.event;
            if(ev.keyCode==13){
                NameConfirm(this);
            }
        }

        NameInput.onclick=function (e) {
            let ev=e||window.event;
            ev.stopPropagation();
        }
        //文件夹重命名确认时判断
        function NameConfirm(obj) {
            let name=obj.value;
            let fId=obj.parentNode.dataset.id;
            let NameObj=HD.getSiblings(fId);
            //把兄弟文件夹名字保存
            let Names=[];
            NameObj.forEach(item=>{
                let name=item.title;
                Names.push(name);
            })
            //测试是否有重名现象
            let res=testNameConflict(name,Names);
            if(res){
              if(name==obj.name){
                  warnWin("没有改变原文件夹名字！")
                  NameInput.style.display="none";
                  NameSpan.style.display="block";
              }else if(name.trim()==""){
                  warnWin("文件名不能为空！");
                  NameInput.value=obj.name;
                  NameInput.select();
              }else{
                  HD.getSelf(fId).title=name;
                  renderLayout();
                  alertSuccess("文件夹重命名成功！");
              }  
            }else{
              NameInput.value=obj.name;
              NameInput.style.display="none";
              NameSpan.style.display="block";
              warnWin("文件夹重名！")
            }
            
        }
    }
    //看是否有重名,true无重名，false 有重名
    function testNameConflict(name,Names) {
        if(Names.indexOf(name)===-1){
            return true
        }else{
            return false;
        }
        
    }

    //文件夹的全选操作
    checkedAll.onchange=function(){
       
       let folderData=HD.getChild(HD.nowid);
       folderData.forEach(item=>{
           item.isChecked=this.checked;
       })
       renderFolders();
    }

    // 每个文件夹的选中操作
    folders.addEventListener("click",function(e){
       let ev=e||window.event;
       //防止与其他的click事件冲突
       if(!ev.target.parentNode){
           return
       }
       if(ev.target.parentNode.tagName=="LABEL"){
           let item=ev.target.parentNode.parentNode;
           let id=item.dataset.id;
           //选中即取反
           folderChecked(id)
           ev.stopPropagation();
       }
    })

    //文件夹被选中的操作
    function folderChecked(id) {
        HD.getSelf(id).isChecked=!HD.getSelf(id).isChecked;
        renderFolders();  
        let objs=HD.getSiblings(id);
        objs.push(HD.getSelf(id));
        checkAll(objs);
    }
    //判断是否全选
    function checkAll(obj) {
        let flag=true;
        obj.forEach(item=>{
             if(!item.isChecked){
                 flag=false;
             }
        })
        checkedAll.checked=flag?true:false;
        if(obj.length==0){
            checkedAll.checked=false;
        }
    }

    //框选操作
    folders.addEventListener("mousedown",(e)=>{
        let ev=e||window.event;
        //防止文件夹点击事件会触发 mousedown事件
        if(isFolder(ev.target)){
            document.onmousemove=function (e) {
                e.preventDefault();
            }
           return
        }
        let selBox="";
        let X1=ev.clientX;
        let Y1=ev.clientY;
        let BoundObj=folders.getBoundingClientRect();

        document.onmousemove=function (e) {
            let ev=e||window.event;
            let X2=ev.clientX;
            let Y2=ev.clientY;
            let LTX=Math.min(X1,X2);
            let LTY=Math.min(Y1,Y2);
            let RDX=Math.max(X1,X2);
            let RDY=Math.max(Y1,Y2);
            //创建选框
            if(!selBox){
                selBox=document.createElement("div");
                selBox.id="select-box";
                document.body.appendChild(selBox);
            }
            //if(Math.abs(X1-X2)<5){return}
            //选框范围须要有个限制
            if(LTX<BoundObj.left){
                LTX=BoundObj.left
            }
            if(LTY<BoundObj.top){
                LTY=BoundObj.top
            }
            if(RDX>BoundObj.right){
                RDX=BoundObj.right
            }
            if(RDY>BoundObj.bottom){
                RDY=BoundObj.bottom
            }
            let W=RDX-LTX;
            let H=RDY-LTY;


            selBox.style.width=W+"px";
            selBox.style.height=H+"px";
            selBox.style.left=LTX+"px";
            selBox.style.top=LTY+"px";
            //组织默认事件
            ev.preventDefault();
            //找出当前文件夹内容
            let folderItems=folders.querySelectorAll("li");
            if(folderItems){
                folderItems.forEach(item=>{
                    let id=item.dataset.id;
                    if(isCollision(item,selBox)){
                        HD.getSelf(id).isChecked=true;

                    }else{
                        HD.getSelf(id).isChecked=false;
                    }

                })
                renderFolders();  
                let objs=HD.getChild(HD.nowid);
                checkAll(objs);

            }


        }

        document.onmouseup=function () {
            document.onmousemove=document.onmouseup=null;
            if(selBox){
                document.body.removeChild(selBox);
            }
        }

        //判断目标元素是否是 folder的子元素
        function isFolder(obj) {
            let item=false;
            while(obj.parentNode){
                if(obj.tagName=="LI" && obj.classList.contains("folder-item")){
                   item=obj;
                   break
                }else{
                    obj=obj.parentNode;
                }
            }
            return item?true:false;
            
        }       
    })

    //判断是否选中文件夹

    function isCollision(obj1,obj2){
        let dis1=obj1.getBoundingClientRect();
        let dis2=obj2.getBoundingClientRect();
        let X1=dis1.left;
        let X2=dis1.left+dis1.width;
        let T1=dis1.top;
        let T2=dis1.top+dis1.height;
        let XX1=dis2.left;
        let XX2=dis2.left+dis2.width;
        let TT1=dis2.top;
        let TT2=dis2.top+dis2.height;
        if(XX2<X1||XX1>X2||TT2<T1||TT1>T2){
            return false
        }else{
            return true;
        }
    }

     // 批量删除文件夹
     let delBtn = document.querySelector(".del-btn");
     delBtn.onclick=function (e) {
         let children=HD.getChild(HD.nowid);
         let checkedArr=[];
         children.forEach(item=>{
             if(item.isChecked){
                 checkedArr.push(item);
             }
         })
         if(checkedArr.length>0){
            showConfirm("确认删除文件夹吗?",()=>{
                    checkedArr.forEach(item=>{
                        HD.deleteData(item.id)
                    })
                    renderLayout();
 
                alertSuccess("成功删除文件夹!");
              })
         }else{
            warnWin("请选择文件夹！")
         }


     }
     //批量移动
     let moveBtn = document.querySelector(".move-btn");
     moveBtn.onclick=function () {
        let children=HD.getChild(HD.nowid);
        let checkedArr=[];
        children.forEach(item=>{
            if(item.isChecked){
                checkedArr.push(item);
            }
        })
        if(checkedArr.length>0){
            let flag=true;
            showMoveAlert(()=>{
                checkedArr.forEach(item=>{
                    if(!IsMoveFolder(item.id)){
                       flag=false;
                    }
                })
                if(flag){
                    renderLayout();
                    alertSuccess("文件夹移动成功！")
                }else{
                    warnWin("不能移动到该文件夹！")
                }  
            });
        }else{
            warnWin("请选择文件夹！")
        }

        

     }










}
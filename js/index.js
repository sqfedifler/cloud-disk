(function(){
    var nowId = 0; //当前选中的文件夹
    var topPid = -1; // 顶层pid

    /* 数据操作方法 */
    // 根据id 找到 子级
    function getSelf(id){
        return data.filter(item=>item.id ==id)[0];
    }


    // 根据 id 找子级
    function getChild(id){
        return data.filter(item=>item.pid ==id);
    }

    // 根据 id 找父级
    function getParent(id){
        let pid = getSelf(id).pid;
        return data.filter(item=>item.id == pid)[0];
    }

    // 根据 id 找到所有父级
    function getAllParent(id){
        let p = getParent(id);
        let allParent = [];
        while(p){
            allParent.push(p);
            p = getParent(p.id);
        }
        return allParent;
    }

    /* 三大块操作 */
    // 左侧菜单的操作
    function addTreeMenuEv(){
        let treeMenu = document.querySelector("#tree-menu");
        let p = treeMenu.querySelectorAll("p");
        p.forEach(p=>{
            p.onclick = function(){
                nowId = this.dataset.id;
                render();
            };
        });
       
    }

    // 文件夹视图
    function addFoldersEv(){
        let folders = document.querySelector("#folders");
        let files = folders.querySelectorAll(".folder-item");
        files.forEach(item=>{
            item.onclick = function(){
                nowId = this.dataset.id;
                render();
            };
        });
    }
    
    
    /* 三大视图的渲染 */
    render();
    function render(){
        let treeMenu = document.querySelector("#tree-menu");
        treeMenu.innerHTML = renderTreeMenu(topPid,0); 
        addTreeMenuEv();
        let folders = document.querySelector("#folders");
        folders.innerHTML = renderFolders(nowId);
        addFoldersEv();
        let breadNav = document.querySelector(".bread-nav");
        breadNav.innerHTML = renderBreadNav(nowId);
    }


    // 左侧菜单
    
    function renderTreeMenu(pid,level){
       let child = getChild(pid);
       let inner = "<ul>";
       child.forEach(item => {
            let childData = getChild(item.id);
            inner += `
                <li class="open">
                    <p class="${childData.length>0?"has-child":""}" style="padding-left:${40 + level*20}px" data-id=${item.id}><span>${item.title}</span></p>
                    ${childData.length>0?renderTreeMenu(item.id,level+1):""}
                </li>   
            `
       });
       inner += "</ul>";
       return inner;
    }
    // 文件夹视图的渲染
    
    function renderFolders(id){
        let child = getChild(id);
        let inner = '';
        if(child.length > 0 ){
            folders.classList.remove("folders-empty");
        } else {
            folders.classList.add("folders-empty");
        }
        child.forEach(item=>{
            inner += `
            <li class="folder-item" data-id=${item.id}>
                <img src="img/folder-b.png" alt="">
                <span class="folder-name">${item.title}</span>
                <input type="text" class="editor" value="${item.title}">
                <label class="checked">
                    <input type="checkbox" />
                    <span class="iconfont icon-checkbox-checked"></span>
                </label>   
            </li>
            `
        });
        return inner;
    }

    // 路径导航渲染
   
    function renderBreadNav(id){
        let s = getSelf(id);
        let allParent = getAllParent(id).reverse();
        let inner = allParent.map(item=>`<a>${item.title}</a>`).join("");
        inner += `<span>${s.title}</span>`;
        return inner;
    }




})();
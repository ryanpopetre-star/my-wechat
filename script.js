// =========================================
// 1. 配置与身份系统
// =========================================

// ✅ 你的 Render 云端服务器地址
const API_URL = 'https://my-chat-server-gzfi.onrender.com/api/messages';
// 根据 API_URL 自动生成好友和登录接口地址
const FRIEND_API = API_URL.replace('/messages', '/friends');
const LOGIN_API = API_URL.replace('/messages', '/login');

// 获取我的名字
let myName = localStorage.getItem('myWeChatName');
let currentChatTarget = "所有人"; // 当前正在跟谁聊天

// 如果没登录过，弹窗询问
if (!myName) {
    myName = prompt("欢迎！请输入你的名字登录：");
    if (myName) {
        localStorage.setItem('myWeChatName', myName);
    } else {
        alert("必须输入名字才能使用！");
        location.reload(); // 强制刷新
    }
}

// 初始化界面
document.querySelector('.top-bar').innerText = `微信 (${myName})`;

// =========================================
// 2. 核心逻辑：自动注册与登录
// =========================================
// 页面一打开，就告诉服务器“我来了”，把我写进户口本
function registerUser() {
    fetch(LOGIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: myName })
    })
    .then(res => res.json())
    .then(data => console.log("服务器登录状态:", data.msg));
}
// 执行注册
registerUser();

// =========================================
// 3. 页面切换逻辑 (微信/通讯录/朋友圈)
// =========================================
function switchTab(tabName) {
    const chatPage = document.getElementById('chat-page');
    const momentsPage = document.getElementById('moments-page');
    const contactsPage = document.getElementById('contacts-page');
    const mePage = document.getElementById('me-page'); // ✨ 新增
    const navItems = document.querySelectorAll('.nav-item');

    // 1. 全部隐藏
    chatPage.style.display = 'none';
    momentsPage.style.display = 'none';
    contactsPage.style.display = 'none';
    mePage.style.display = 'none'; // ✨ 新增
    
    // 2. 取消高亮
    navItems.forEach(item => item.classList.remove('active'));

    // 3. 判断显示
    if (tabName === 'chat') {
        chatPage.style.display = 'block';
        navItems[0].classList.add('active');
        loadMessages();
    } else if (tabName === 'contacts') {
        contactsPage.style.display = 'block';
        navItems[1].classList.add('active');
        loadFriends();
    } else if (tabName === 'moments') {
        momentsPage.style.display = 'block';
        navItems[2].classList.add('active');
    } else {
        // ✨ 新增：个人中心
        mePage.style.display = 'block';
        navItems[3].classList.add('active');
        // 显示当前名字
        document.getElementById('currentNameDisplay').innerText = myName;
    }
}

// =========================================
// 4. 聊天功能 (发送 & 接收)
// =========================================
const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('msgInput');
const msgList = document.querySelector('.message-list');

// --- 发送消息 ---
sendBtn.addEventListener('click', function() {
    const text = input.value;
    if(text === "") return;

    // 准备数据包 (加上了 from 和 to)
    const data = {
        text: text,
        from: myName,          // 我是谁
        to: currentChatTarget, // 发给谁
        type: 'right' 
    };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        console.log('发送成功:', result);
        input.value = ''; 
        loadMessages(); // 发完立刻刷新
    });
});

// --- 获取消息 (带私聊过滤) ---
function loadMessages() {
    // 如果不在聊天页，就不刷新，节省流量
    if (document.getElementById('chat-page').style.display === 'none') return;

    fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        msgList.innerHTML = ''; // 清空列表
        
        // ✨ 核心过滤：只看“我和他”之间的信
        // 逻辑：(发送者是我 且 接收者是他) 或者 (发送者是他 且 接收者是我)
        const myMessages = data.filter(msg => {
            // 如果是“所有人”模式，就显示所有公共消息(如果有的话)
            if (currentChatTarget === "所有人") return true; 

            return (msg.from === myName && msg.to === currentChatTarget) || 
                   (msg.from === currentChatTarget && msg.to === myName);
        });

        // 渲染消息
        myMessages.forEach(msg => {
            const div = document.createElement('div');
            // 如果是我发的放右边，对方发的放左边
            const type = (msg.from === myName) ? 'right' : 'left';
            div.className = `msg ${type}`; 
            
            // 显示名字和内容 (比如: 张三: 你好)
            div.innerHTML = `<small style="display:block;color:#888;font-size:10px;margin-bottom:2px">${msg.from}</small> ${msg.text}`;
            
            msgList.appendChild(div);
        });
        
        // 滚动到底部
        window.scrollTo(0, document.body.scrollHeight);
    });
}

// =========================================
// 5. 通讯录功能 (加载 & 添加)
// =========================================
const friendInput = document.getElementById('friendInput');
const addFriendBtn = document.getElementById('addFriendBtn');
const contactList = document.querySelector('.contact-list');

// --- 加载好友列表 ---
function loadFriends() {
    fetch(FRIEND_API)
    .then(res => res.json())
    .then(friends => {
        contactList.innerHTML = ''; 
        friends.forEach(name => {
            const div = document.createElement('div');
            div.className = 'contact-row';
            div.innerHTML = `
                <div class="contact-avatar">👤</div>
                <div class="contact-name">${name}</div>
            `;
            
            // ✨ 点击好友，开启私聊
            div.onclick = function() {
                currentChatTarget = name; // 锁定聊天对象
                // 更新顶部标题
                document.querySelector('.top-bar').innerText = `正在与 ${name} 聊天`;
                // 跳转页面
                switchTab('chat');
            };
            
            contactList.appendChild(div);
        });
    });
}

// --- 添加好友 ---
addFriendBtn.addEventListener('click', () => {
    const name = friendInput.value;
    if (!name) return;

    // 不能添加自己
    if (name === myName) {
        alert("不能添加自己为好友！");
        return;
    }

    fetch(FRIEND_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('添加成功！');
            friendInput.value = '';
            loadFriends(); 
        } else {
            alert('添加失败：' + data.message); // 会提示“查无此人”
        }
    });
});

// =========================================
// 6. 启动轮询 (心跳)
// =========================================
// 每 2 秒去服务器看看有没有新消息
setInterval(loadMessages, 2000);
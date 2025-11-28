// --- 配置 ---
// const API_URL = 'http://localhost:3000/api/messages'; // ❌ 这是本地的，删掉

// ✅ 换成刚才 Render 给你的那个网址
const API_URL = 'https://my-chat-server-abcd.onrender.com/api/messages';

// 1. 发送消息的函数 (POST)
const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('msgInput');

sendBtn.addEventListener('click', function() {
    const text = input.value;
    if(text === "") return;

    // 准备数据包
    const data = {
        text: text,
        type: 'right' // 标记这是我发的消息
    };

    // ✨ 核心动作：使用 fetch 发送给后端
    fetch(API_URL, {
        method: 'POST', // 动作是 POST (发送)
        headers: {
            'Content-Type': 'application/json' // 告诉后端我是 JSON
        },
        body: JSON.stringify(data) // 把对象转成字符串
    })
    .then(response => response.json())
    .then(result => {
        console.log('发送成功:', result);
        input.value = ''; // 清空输入框
        // 发送完立刻刷新一下列表
        loadMessages(); 
    });
});

// 2.以此获取消息的函数 (GET)
const msgList = document.querySelector('.message-list');

function loadMessages() {
    // ✨ 核心动作：去后端拿数据
    fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        // 先清空现在的列表，防止重复
        msgList.innerHTML = '';
        
        // 遍历数组，把每一条消息画出来
        data.forEach(msg => {
            const div = document.createElement('div');
            // 根据 type 决定是 left(白) 还是 right(绿)
            div.className = `msg ${msg.type}`; 
            div.innerText = msg.text;
            msgList.appendChild(div);
        });
        
        // 滚动到底部
        window.scrollTo(0, document.body.scrollHeight);
    });
}

// 3. 自动轮询 (每隔 2秒 自动刷新一次消息)
// 这样别人发的消息，你也能自动看到！
setInterval(loadMessages, 2000);
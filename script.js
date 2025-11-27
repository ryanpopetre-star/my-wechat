// 切换标签页功能
function switchTab(tabName) {
    // 1. 获取两个页面和两个按钮
    const chatPage = document.getElementById('chat-page');
    const momentsPage = document.getElementById('moments-page');
    const navItems = document.querySelectorAll('.nav-item');

    // 2. 根据点击的名字来切换显示
    if (tabName === 'chat') {
        chatPage.style.display = 'block';
        momentsPage.style.display = 'none';
        // 变色
        navItems[0].classList.add('active');
        navItems[1].classList.remove('active');
    } else {
        chatPage.style.display = 'none';
        momentsPage.style.display = 'block';
        // 变色
        navItems[0].classList.remove('active');
        navItems[1].classList.add('active');
    }
}

// 简单的发送消息功能
const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('msgInput');
const msgList = document.querySelector('.message-list');

sendBtn.addEventListener('click', function() {
    const text = input.value;
    if(text === "") return; // 如果是空的就不发

    // 1. 添加我自己发的消息
    const myMsg = document.createElement('div');
    myMsg.className = 'msg right';
    myMsg.innerText = text;
    msgList.appendChild(myMsg);

    // 清空输入框
    input.value = '';

    // 2. 模拟机器人回复 (延迟1秒)
    setTimeout(function() {
        const botMsg = document.createElement('div');
        botMsg.className = 'msg left';
        botMsg.innerText = "我收到了： " + text;
        msgList.appendChild(botMsg);
        
        // 自动滚动到底部
        window.scrollTo(0, document.body.scrollHeight);
    }, 1000);
});
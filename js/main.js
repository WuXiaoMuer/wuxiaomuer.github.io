// 时间显示功能
function updateTime() {
    const timeElement = document.getElementById("time");
    const now = new Date();
    const date = now.toLocaleDateString('zh-CN');
    const time = now.toLocaleTimeString('zh-CN');
    timeElement.innerHTML = `${date} ${time}`;
}

// 每秒更新时间
setInterval(updateTime, 1000);
updateTime(); // 初始化显示

// 导航栏活跃状态
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// 滚动动画
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
}); 
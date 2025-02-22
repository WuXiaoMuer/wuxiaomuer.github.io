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
// 获取GitHub仓库信息并生成项目时间线
async function fetchGitHubProjects() {
    try {
        const response = await fetch('https://api.github.com/users/WuXiaoMuer/repos');
        const repos = await response.json();

        const timeline = document.querySelector('.timeline');
        repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        repos.forEach((repo, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.style.animationDelay = `${index * 0.2}s`;

            const content = document.createElement('div');
            content.className = 'timeline-content';

            const date = new Date(repo.created_at).toLocaleDateString('zh-CN');
            content.innerHTML = `
                <div class="timeline-date">${date}</div>
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || '暂无描述'}</p>
                <div class="timeline-tech">
                    <span class="tech-tag">${repo.language || 'Other'}</span>
                    <span class="tech-tag">⭐ ${repo.stargazers_count}</span>
                    <span class="tech-tag">🔄 ${repo.forks_count}</span>
                </div>
            `;

            timelineItem.appendChild(content);
            timeline.appendChild(timelineItem);
        });
    } catch (error) {
        console.error('获取GitHub项目信息失败:', error);
    }
}

// 页面加载完成后获取项目信息
document.addEventListener('DOMContentLoaded', fetchGitHubProjects);
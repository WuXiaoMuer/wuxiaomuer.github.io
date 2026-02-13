// 时间显示功能
function updateTime() {
    const timeElement = document.getElementById("time");
    if (timeElement) {
        const now = new Date();
        const date = now.toLocaleDateString('zh-CN');
        const time = now.toLocaleTimeString('zh-CN');
        timeElement.innerHTML = `${date} ${time}`;
    }
}

// 每秒更新时间
setInterval(updateTime, 1000);

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('WuXiaoMu website loaded');
    
    initializeNavigation();
    initializeTypingEffect();
    initializeFadeAnimations();
    
    setTimeout(() => {
        try {
            initializeTechBackground();
            fetchGitHubProjects();
            initializeStatsCounters();
            initializeProjectFilters();
        } catch (err) {
            console.warn('Advanced features failed:', err);
        }
    }, 100);
});

// 淡入动画
function initializeFadeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.skill-card, .stat-box, .contact-method').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// 导航功能
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // 处理导航链接点击
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const target = document.querySelector(targetId);
                if (target) {
                    const navHeight = 70;
                    const top = target.offsetTop - navHeight;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            }
            
            // 更新活跃状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 关闭移动端菜单
            if (navMenu && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // 移动端菜单
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// 打字效果
function initializeTypingEffect() {
    const texts = [
        'Full Stack Developer',
        '开源爱好者',
        'Creative Coder',
        '嵌入式开发者',
        '游戏开发者',
        'Tech Creator'
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedElement = document.querySelector('.typing-text');
    
    if (!typedElement) return;

    function typeText() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typedElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }

        setTimeout(typeText, typeSpeed);
    }

    typeText();
}

// 科技背景连线特效
function initializeTechBackground() {
    const canvas = document.getElementById('techCanvas');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    // 设置canvas尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // 鼠标移动事件
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // 粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

            // 鼠标交互
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const forceX = (dx / distance) * force * 2;
                    const forceY = (dy / distance) * force * 2;
                    this.x -= forceX;
                    this.y -= forceY;
                }
            }
        }

        draw() {
            ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 创建粒子
    function createParticles() {
        particles = [];
        const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < Math.max(numberOfParticles, 10); i++) {
            particles.push(new Particle());
        }
    }

    // 连线函数
    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (1 - (distance / 120)) * 0.3;
                    ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        
        requestAnimationFrame(animate);
    }

    createParticles();
    animate();
}

// 获取GitHub仓库信息
async function fetchGitHubProjects() {
    try {
        const response = await fetch('https://api.github.com/users/WuXiaoMuer/repos?per_page=100');
        if (!response.ok) throw new Error('API request failed');
        
        const repos = await response.json();
        
        allRepos = repos;
        
        allRepos.sort((a, b) => {
            const scoreA = a.stargazers_count * 100 + new Date(a.updated_at).getTime();
            const scoreB = b.stargazers_count * 100 + new Date(b.updated_at).getTime();
            return scoreB - scoreA;
        });
        
        renderProjects(allRepos);
    } catch (error) {
        console.error('GitHub API error:', error);
        
        const defaultRepos = [
            {
                name: 'CUBES',
                description: '方了个块，没有人能到达第三关的游戏！',
                html_url: 'https://github.com/WuXiaoMuer/CUBES',
                stargazers_count: 2,
                forks_count: 0,
                language: 'C#',
                created_at: '2022-10-16T01:25:24Z',
                updated_at: '2024-01-01T00:00:00Z'
            },
            {
                name: 'StartupTools',
                description: '用于Windows开机启动的小工具。',
                html_url: 'https://github.com/WuXiaoMuer/StartupTools',
                stargazers_count: 15,
                forks_count: 1,
                language: 'C#',
                created_at: '2022-08-04T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            },
            {
                name: 'RayRender',
                description: '光线追踪渲染器',
                html_url: 'https://github.com/WuXiaoMuer/RayRender',
                stargazers_count: 8,
                forks_count: 2,
                language: 'C++',
                created_at: '2023-01-15T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }
        ];
        
        allRepos = defaultRepos;
        renderProjects(defaultRepos);
    }
}

// 渲染项目列表
function renderProjects(repos) {
    const container = document.getElementById('projects-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const reposToShow = repos.slice(0, 9);
    
    reposToShow.forEach((repo, index) => {
        const card = createProjectCard(repo, index);
        container.appendChild(card);
    });
    
    setTimeout(() => {
        observeProjectCards();
    }, 100);
}

function observeProjectCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });
}

// 创建项目卡片
function createProjectCard(repo, index) {
    const card = document.createElement('div');
    card.className = 'project-card fade-in';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const date = new Date(repo.created_at).toLocaleDateString('zh-CN');
    const language = repo.language || 'Unknown';
    
    card.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
        <p>${repo.description || '暂无描述'}</p>
        <div class="project-tags">
            <span><i class="fas fa-code"></i> ${language}</span>
            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
        </div>
    `;
    
    return card;
}

// 项目过滤器
let allRepos = [];

function initializeProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterProjects(filter);
        });
    });
}

function filterProjects(filter) {
    let filtered = [...allRepos];
    
    if (filter === 'popular') {
        filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (filter === 'recent') {
        filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else {
        filtered.sort((a, b) => {
            const scoreA = a.stargazers_count * 100 + new Date(a.updated_at).getTime();
            const scoreB = b.stargazers_count * 100 + new Date(b.updated_at).getTime();
            return scoreB - scoreA;
        });
    }
    
    renderProjects(filtered);
}

// 统计数字动画
function initializeStatsCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.getAttribute('data-target'));
                
                if (entry.target.parentElement.querySelector('.stat-label')?.textContent === '加入GitHub') {
                    entry.target.innerText = target;
                    return;
                }
                
                animateCounter(entry.target, target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// 计数器动画
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    
    const updateCounter = () => {
        if (current < target) {
            current += increment;
            element.innerText = Math.ceil(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.innerText = target;
        }
    };
    
    updateCounter();
}

// 错误处理
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
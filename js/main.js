// 右下角时钟（日期 + 时间）
function updateClock() {
    const timeText = document.getElementById('timeText');
    if (!timeText) return;
    const now = new Date();
    const date = now.toLocaleDateString('zh-CN');
    const time = now.toLocaleTimeString('zh-CN');
    timeText.textContent = `${date} ${time}`;
}
updateClock();
setInterval(updateClock, 1000);

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeTheme();
    initializeScrollUI();
    initializeScrollSpy();
    initializeTypingEffect();
    initializeFadeAnimations();
    initializeProjects();
    initializeStatsCounters();
    loadBlogPosts();
    initializeNameCard();
    initializeTechBackground();
    initializeCalendar();
});

// 精选项目清单（双语描述 + 技术标签，静态主数据）
const featuredProjects = [
    {
        name: 'muos',
        desc: '轻量级裸机操作系统内核 · A lightweight bare-metal OS kernel',
        tags: ['C', '操作系统', '裸机'],
        url: 'https://github.com/WuXiaoMuer/muos'
    },
    {
        name: 'MiniC',
        desc: 'Mini C 编译器 · A mini C compiler',
        tags: ['C', '编译器', '词法/语法分析'],
        url: 'https://github.com/WuXiaoMuer/MiniC'
    },
    {
        name: 'voxel',
        desc: '体素世界游戏 · A voxel world game',
        tags: ['GDScript', 'Godot', '游戏'],
        url: 'https://github.com/WuXiaoMuer/voxel'
    },
    {
        name: 'StartupTools',
        desc: 'Windows 开机启动小工具 · A Windows startup utility',
        tags: ['C#', '.NET', '桌面工具'],
        url: 'https://github.com/WuXiaoMuer/StartupTools'
    },
    {
        name: 'WalnutConsole',
        desc: '胡桃控制台 UI · Walnut console UI (Lycoris Recoil)',
        tags: ['JavaScript', 'Web', 'UI'],
        url: 'https://github.com/WuXiaoMuer/WalnutConsole'
    },
    {
        name: 'VsMag',
        desc: '磁力 IDE · Magnetism IDE',
        tags: ['C#', 'IDE', '桌面'],
        url: 'https://github.com/WuXiaoMuer/VsMag'
    }
];

// 渲染精选项目
function initializeProjects() {
    const container = document.getElementById('projects-list');
    if (!container) return;

    container.innerHTML = '';
    featuredProjects.forEach(project => {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.dataset.repo = project.name;
        card.innerHTML = `
            <div class="project-card-top">
                <h3><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.name}</a></h3>
                <span class="project-stars" hidden><i class="fas fa-star"></i><span class="star-count">0</span></span>
            </div>
            <p>${project.desc}</p>
            <div class="project-tags">${project.tags.map(t => `<span>${t}</span>`).join('')}</div>
        `;
        container.appendChild(card);
    });

    observeProjectCards();
    fetchStars();
}

// 用 GitHub API 补实时星标数，失败静默忽略
async function fetchStars() {
    try {
        const res = await fetch('https://api.github.com/users/WuXiaoMuer/repos?per_page=100');
        if (!res.ok) return;
        const repos = await res.json();
        const map = {};
        repos.forEach(r => { map[r.name] = r.stargazers_count; });

        document.querySelectorAll('.project-card[data-repo]').forEach(card => {
            const repo = card.dataset.repo;
            if (map[repo] != null) {
                const el = card.querySelector('.project-stars');
                el.hidden = false;
                el.querySelector('.star-count').textContent = map[repo];
            }
        });
    } catch (e) { /* GitHub API 不可用时忽略，卡片仍正常展示 */ }
}

// 项目卡片淡入
function observeProjectCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.project-card').forEach(card => observer.observe(card));
}

// 导航功能
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (targetId === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (target) {
                const navHeight = 66;
                window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
            }

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            if (navMenu && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

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

// 深浅主题切换
function initializeTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });
}

// 阅读进度条 + 回到顶部
function initializeScrollUI() {
    const progress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    let ticking = false;

    function update() {
        ticking = false;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + '%';
        if (backToTop) backToTop.classList.toggle('show', scrollTop > 500);
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    update();
}

// 滚动时高亮当前导航项 (scrollspy)
function initializeScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    if (!sections.length || !navLinks.length) return;

    const linkMap = {};
    navLinks.forEach(l => { linkMap[l.getAttribute('href')] = l; });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                const link = linkMap['#' + entry.target.id];
                if (link) link.classList.add('active');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
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

// 淡入动画
function initializeFadeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.skill-card, .stat-box, .contact-method').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// 统计数字动画
function initializeStatsCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.getAttribute('data-target'));

                if (isNaN(target)) {
                    entry.target.innerText = entry.target.textContent;
                    return;
                }

                animateCounter(entry.target, target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

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

// 日历渲染（含周末着色）
function initializeCalendar() {
    const monthEl = document.getElementById('calMonth');
    const yearEl = document.getElementById('calYear');
    const gridEl = document.getElementById('calGrid');
    const timeEl = document.getElementById('calTime');
    if (!monthEl || !gridEl) return;

    function renderCalendar() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const today = now.getDate();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        monthEl.textContent = monthNames[month];
        yearEl.textContent = year;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev = new Date(year, month, 0).getDate();

        let html = '';
        const headers = ['日', '一', '二', '三', '四', '五', '六'];
        for (let i = 0; i < 7; i++) {
            html += `<span class="day-header">${headers[i]}</span>`;
        }

        for (let i = firstDay - 1; i >= 0; i--) {
            html += `<span class="day other-month">${daysInPrev - i}</span>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dow = new Date(year, month, d).getDay();
            let cls = 'day';
            if (d === today) cls += ' today';
            else if (dow === 0 || dow === 6) cls += ' weekend';
            html += `<span class="${cls}">${d}</span>`;
        }

        const remaining = 42 - (firstDay + daysInMonth);
        for (let i = 1; i <= remaining; i++) {
            html += `<span class="day other-month">${i}</span>`;
        }

        gridEl.innerHTML = html;
    }

    function updateCalTime() {
        if (!timeEl) return;
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
    }

    renderCalendar();
    updateCalTime();
    setInterval(updateCalTime, 1000);
}

// 名片交互（点击/键盘翻转）
function initializeNameCard() {
    const card = document.querySelector('.name-card');
    if (!card) return;

    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.classList.toggle('flipped');
        }
    });
}

// 科技背景连线特效（颜色随主题自适应）
function initializeTechBackground() {
    const canvas = document.getElementById('techCanvas');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const mouse = { x: null, y: null, radius: 150 };

    function brandRGBA(alpha) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark
            ? `rgba(190, 140, 250, ${alpha})`
            : `rgba(155, 66, 219, ${alpha})`;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

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
            ctx.fillStyle = brandRGBA(0.55);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        const numberOfParticles = Math.floor((canvas.width * canvas.height) / 18000);
        for (let i = 0; i < Math.max(numberOfParticles, 10); i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (1 - (distance / 120)) * 0.3;
                    ctx.strokeStyle = brandRGBA(opacity);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animate);
    }

    createParticles();
    animate();
}

// 加载博客文章（静态读取 articles/data.json）
async function loadBlogPosts() {
    const container = document.getElementById('blogList');
    if (!container) return;

    try {
        const resp = await fetch('/articles/data.json');
        if (!resp.ok) throw new Error('No static articles');
        const articles = await resp.json();
        renderBlogPosts(articles, container);
    } catch {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-muted);">
                <i class="fas fa-feather" style="font-size:2rem;color:var(--color-brand);margin-bottom:1rem;display:block;"></i>
                <p>暂无文章 No articles yet.</p>
            </div>`;
    }
}

function renderBlogPosts(articles, container) {
    if (!articles || articles.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-muted);">
                <i class="fas fa-feather" style="font-size:2rem;color:var(--color-brand);margin-bottom:1rem;display:block;"></i>
                <p>暂无文章 No articles yet.</p>
            </div>`;
        return;
    }

    container.innerHTML = '';
    articles.slice(0, 6).forEach((article, i) => {
        const card = document.createElement('div');
        card.className = 'blog-card fade-in';
        card.style.animationDelay = `${i * 0.08}s`;

        const date = new Date(article.createdAt || article.date).toLocaleDateString('zh-CN');
        const tags = (article.tags || []).map(t => `<span>${t}</span>`).join('');

        card.innerHTML = `
            <div class="blog-date"><i class="fas fa-calendar"></i> ${date}</div>
            <h3>${article.title}</h3>
            <p>${article.summary || article.content?.replace(/<[^>]+>/g, '').substring(0, 120) || ''}</p>
            ${tags ? `<div class="blog-tags">${tags}</div>` : ''}
            <div class="read-more">阅读全文 Read <i class="fas fa-arrow-right"></i></div>
        `;

        card.addEventListener('click', () => {
            const viewer = document.getElementById('blogViewer');
            if (!viewer) return;

            viewer.innerHTML = `
                <div class="card" style="padding:2rem;max-width:720px;margin:0 auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                        <h3 style="font-family:var(--font-sans);font-weight:700;font-size:1.5rem;color:var(--color-primary);">${article.title}</h3>
                        <button onclick="closeBlogViewer()" style="background:none;border:none;font-size:1.5rem;color:var(--color-muted);cursor:pointer;">&times;</button>
                    </div>
                    <div style="font-size:0.82rem;color:var(--color-muted);margin-bottom:1.5rem;">
                        <i class="fas fa-calendar"></i> ${date}
                        ${tags ? `&nbsp;&nbsp;<i class="fas fa-tags"></i> ${article.tags?.join(', ')}` : ''}
                    </div>
                    <div style="line-height:1.8;color:var(--color-primary-soft);">
                        ${article.content || article.summary || ''}
                    </div>
                </div>
                <div style="text-align:center;margin-top:2rem;">
                    <button onclick="closeBlogViewer()" class="brand-btn">返回 Back</button>
                </div>`;
            viewer.style.display = 'flex';
        });

        container.appendChild(card);

        setTimeout(() => {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
                });
            }, { threshold: 0.1 });
            obs.observe(card);
        }, 50);
    });
}

function closeBlogViewer() {
    const viewer = document.getElementById('blogViewer');
    if (viewer) viewer.style.display = 'none';
}

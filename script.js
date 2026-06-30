document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const navbar = document.querySelector(".navbar");
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const navLinks = document.getElementById("site-nav");
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    const allAnchors = document.querySelectorAll('a[href^="#"]');
    const revealElements = document.querySelectorAll(".reveal");
    const leadForm = document.getElementById("leadForm");
    const formStatus = document.getElementById("form-status");
    const currentYear = document.getElementById("current-year");
    const handleNavbarScroll = () => {
     if (!navbar) return;
     navbar.classList.toggle("scrolled", window.scrollY > 12);
    };

    window.addEventListener("scroll", handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    const closeMenu = () => {
        if (!mobileBtn || !navLinks) return;
        navLinks.classList.remove("active");
        mobileBtn.classList.remove("active");
        mobileBtn.setAttribute("aria-expanded", "false");
        body.classList.remove("menu-open");
    };

    const openMenu = () => {
        if (!mobileBtn || !navLinks) return;
        navLinks.classList.add("active");
        mobileBtn.classList.add("active");
        mobileBtn.setAttribute("aria-expanded", "true");
        body.classList.add("menu-open");
    };

    const toggleMenu = () => {
        if (!navLinks || !mobileBtn) return;
        const isOpen = navLinks.classList.contains("active");
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener("click", toggleMenu);

        document.addEventListener("click", (event) => {
            const clickedInsideNav = navLinks.contains(event.target);
            const clickedMenuButton = mobileBtn.contains(event.target);

            if (!clickedInsideNav && !clickedMenuButton && navLinks.classList.contains("active")) {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }

    allAnchors.forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const href = anchor.getAttribute("href");

            if (!href || href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            closeMenu();

            const headerHeight = navbar ? navbar.offsetHeight : 0;
            const offset = 12;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - offset;

            window.scrollTo({
                top: targetTop,
                behavior: "smooth"
            });
        });
    });

    if ("IntersectionObserver" in window && revealElements.length) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.16
            }
        );

        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("active"));
    }

    const sections = document.querySelectorAll("section[id]");

    if ("IntersectionObserver" in window && sections.length && navAnchors.length) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const currentId = `#${entry.target.id}`;

                    navAnchors.forEach((link) => {
                        const isActive = link.getAttribute("href") === currentId;
                        link.classList.toggle("active", isActive);
                    });
                });
            },
            {
                threshold: 0.45
            }
        );

        sections.forEach((section) => sectionObserver.observe(section));
    }

    if (leadForm) {
        leadForm.addEventListener("submit", async (event) => { // Добавили async
            event.preventDefault();

            const nameInput = leadForm.querySelector("#name");
            const emailInput = leadForm.querySelector("#email");
            const phoneInput = leadForm.querySelector("#phone");
            const messageInput = leadForm.querySelector("#message"); // Добавили поле сообщения
            const submitButton = leadForm.querySelector('button[type="submit"]');

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const phone = phoneInput ? phoneInput.value.trim() : "";
            const message = messageInput ? messageInput.value.trim() : "";

            if (!name || !email || !phone) {
                if (formStatus) {
                    formStatus.textContent = "Пожалуйста, заполните обязательные поля: имя, email и телефон.";
                    formStatus.classList.add("show");
                    formStatus.style.color = "#ff6b6b"; // Красный цвет для ошибки
                    formStatus.style.background = "rgba(255, 107, 107, 0.1)";
                    formStatus.style.borderColor = "rgba(255, 107, 107, 0.3)";
                }
                return;
            }

            if (formStatus) {
                formStatus.classList.remove("show");
            }

            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Отправляем...";

            // НАСТРОЙКИ TELEGRAM (Замените на свои данные!)
            const BOT_TOKEN = '8905130215:AAEdkWCPSuQJlKCqT-Dgt_zHXdU6oOOWoU8'; 
            const CHAT_ID = '7595240201';
            
            const textMessage = `🔔 Новая заявка с сайта Beit Leila!\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n✉️ Email: ${email}\n💬 Сообщение: ${message ? message : 'Нет сообщения'}`;

            try {
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: textMessage
                    })
                });

                if (response.ok) {
                    leadForm.reset();
                    if (formStatus) {
                        formStatus.textContent = "Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.";
                        formStatus.classList.add("show");
                        formStatus.style.color = "#b8f5dc"; // Возвращаем зеленый цвет успеха
                        formStatus.style.background = "rgba(11, 102, 74, 0.18)";
                        formStatus.style.borderColor = "rgba(66, 179, 131, 0.35)";
                    }
                } else {
                    throw new Error('Ошибка сети');
                }
            } catch (error) {
                if (formStatus) {
                    formStatus.textContent = "Произошла ошибка при отправке. Пожалуйста, свяжитесь с нами по WhatsApp.";
                    formStatus.classList.add("show");
                }
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
  });




  // ===== GOOGLE SHEETS: popup =====
const SHEET_ID = "1t49fUg7oV-28oQCGhM6a_iQTXIIrEZZMmax1PWSAZlw";
const POPUP_URL = `https://opensheet.elk.sh/${SHEET_ID}/popup`;

function closeCoursePopup() {
    document.getElementById('course-popup').classList.remove('active');
    localStorage.setItem('course_popup_hidden', new Date(Date.now() + 24*60*60*1000).toISOString());
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('course-popup');
    if (event.target == modal) closeCoursePopup();
});

async function loadPopup() {
    try {
        const res  = await fetch(POPUP_URL);
        const data = await res.json();
        const c    = data[0];

        if (!c || c.enabled !== "TRUE") return;

        const hidden = localStorage.getItem('course_popup_hidden');
        if (hidden && new Date() < new Date(hidden)) return;

        // Заполняем данные из таблицы
        document.querySelector('.cp-badge').textContent  = c.badge    || '🎓 Новый поток';
        document.querySelector('.cp-title').textContent  = c.title    || '';
        document.querySelector('.cp-desc').textContent   = c.desc     || '';
        document.querySelector('.cp-seats').textContent  = c.seats    || '';

        const rows = document.querySelectorAll('.cp-row span:last-child');
        if (rows[0]) rows[0].textContent = c.start    || '';
        if (rows[1]) rows[1].textContent = c.schedule || '';
        if (rows[2]) rows[2].textContent = c.format   || 'Zoom';

        const btn = document.querySelector('.cp-btn');
        if (btn) {
            btn.textContent = c.button || 'Записаться на пробный урок';
            btn.href        = c.link   || '#contact';
        }

        const delay = parseInt(c.delay) || 7000;
        setTimeout(() => {
            const isHidden = localStorage.getItem('course_popup_hidden');
            if (!isHidden || new Date() > new Date(isHidden)) {
                document.getElementById('course-popup').classList.add('active');
            }
        }, delay);

    } catch(e) {
        // Если таблица недоступна — показываем popup со статичными данными через 7 сек
        setTimeout(() => {
            const isHidden = localStorage.getItem('course_popup_hidden');
            if (!isHidden || new Date() > new Date(isHidden)) {
                document.getElementById('course-popup').classList.add('active');
            }
        }, 7000);
    }
}

loadPopup();



// ===== GOOGLE SHEETS: COURSES =====

const COURSES_URL = `https://opensheet.elk.sh/${SHEET_ID}/courses`;

async function loadCourses() {
    try {
        const res = await fetch(COURSES_URL);
        const courses = await res.json();

        const grid = document.getElementById("courses-grid");
        if (!grid) return;

        grid.innerHTML = "";

        courses
            .filter(course => course.enabled === "TRUE")
            .sort((a, b) => Number(a.order) - Number(b.order))
            .forEach(course => {

                const article = document.createElement("article");
                article.className = "course-card reveal" +
                    (course.featured === "TRUE" ? " course-card--featured" : "");

                article.innerHTML = `
                    <div class="course-icon">${course.icon || "📚"}</div>
                    <div class="course-badge ${course.featured === "TRUE" ? "course-badge--gold" : ""}">
                        ${course.badge || ""}
                    </div>
                    <h3>${course.title || ""}</h3>
                    <p>${course.description || ""}</p>
                    <ul class="course-features">
                        ${course.feature1 ? `<li>${course.feature1}</li>` : ""}
                        ${course.feature2 ? `<li>${course.feature2}</li>` : ""}
                        ${course.feature3 ? `<li>${course.feature3}</li>` : ""}
                        ${course.feature4 ? `<li>${course.feature4}</li>` : ""}
                    </ul>
                    <a href="${course.link || "#contact"}"
                       class="btn ${course.featured === "TRUE" ? "btn-primary" : "btn-outline"}">
                        ${course.button || "Записаться"}
                    </a>
                `;

                grid.appendChild(article);

                // Подключаем анимацию reveal для новых карточек
                if ("IntersectionObserver" in window) {
                    const observer = new IntersectionObserver((entries, obs) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add("active");
                                obs.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.16 });
                    observer.observe(article);
                } else {
                    article.classList.add("active");
                }
            });

    } catch (error) {
        console.error("Ошибка загрузки курсов:", error);
    }
}

loadCourses();
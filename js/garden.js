/**
 * garden.js (версия 4.0)
 * 
 * Принципы:
 * - Один запрос за списком файлов
 * - Дата берётся из имени файла: 2025-12-05-tema.md
 * - Сортировка: новые записи сверху (по имени файла)
 * - Нет запросов на каждый файл → масштабируемо
 */

const REPO_API = 'https://api.github.com/repos/GenaPoleno/GenaPoleno.github.io/contents/entries';
const gardenMap = document.querySelector('.garden-map');

// Преобразует имя файла в заголовок: "2025-12-05-tema.md" → "Tema"
function formatTitle(filename) {
  let clean = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.(md|html)$/, '');
  clean = clean.replace(/-/g, ' ');
  return clean.replace(/\b\w/g, c => c.toUpperCase());
}

// Извлекает дату из имени: "2025-12-05-..." → { day, month, year }
function extractDate(filename) {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return { year, month, day };
}

// Форматирует дату: "5 дек 2025"
function formatDate(dateObj) {
  if (!dateObj) return '';
  const d = parseInt(dateObj.day, 10);
  const m = parseInt(dateObj.month, 10) - 1;
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн',
                  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${d} ${months[m]} ${dateObj.year}`;
}

// Основная функция
async function loadEntries() {
  try {
    const response = await fetch(REPO_API);
    if (!response.ok) throw new Error('Не удалось загрузить записи');
    
    const files = await response.json();
    
    const entries = files
      .filter(f => f.name.endsWith('.md') || f.name.endsWith('.html'))
      .map(f => ({
        name: f.name,
        title: formatTitle(f.name),
        date: extractDate(f.name),
        url: f.name.endsWith('.md')
          ? `entry-template.html?file=${f.name}`
          : `entries/${f.name}`
      }))
      .sort((a, b) => b.name.localeCompare(a.name));

    gardenMap.innerHTML = '';
    entries.forEach(entry => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = entry.url;
      a.textContent = `${entry.title} • ${formatDate(entry.date)}`;
      li.appendChild(a);
      gardenMap.appendChild(li);
    });

  } catch (error) {
    console.error('Ошибка:', error);
    gardenMap.innerHTML = `<li><span style="color:#e53935">⚠️ ${error.message}</span></li>`;
  }
}

document.addEventListener('DOMContentLoaded', loadEntries);

// ТЁМНАЯ ТЕМА
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

// Проверяем системную тему и сохранённый выбор
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
  body.classList.add('dark-theme');
}

// Переключение темы
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  const isDark = body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Обновление иконки (лунка/солнышко)
function updateThemeIcon() {
  const isDark = body.classList.contains('dark-theme');
  const svgPath = isDark 
    ? 'M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM15 13.5a3 3 0 11-6 0 3 3 0 016 0zm-2.25 2.25a.75.75 0 00-1.06-1.06l1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V18.75A.75.75 0 0112 18zm-4.5-6a.75.75 0 01-.75.75H4.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm4.5-2.25a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V9.75zm-.75-6a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H7.5a.75.75 0 01-.75-.75zM12 3a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3.75A.75.75 0 0112 3zm4.5 6a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V9zm-2.25-4.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5h-2.25a.75.75 0 01-.75-.75zM18 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25A.75.75 0 0118 12zm-4.5 4.5a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0v-2.25zM12 21.75a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5h-2.25a.75.75 0 01-.75-.75zm-7.5-3a.75.75 0 01.75-.75H7.5a.75.75 0 010 1.5H5.25A.75.75 0 014.5 18.75zm-1.5-4.5a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z' 
    : 'M12 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 3zm-4.657 4.657a.75.75 0 011.06-1.06l1.061 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06zm12.728 0a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.061-1.061l1.06-1.06zM12 16.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zm-6.657-2.157a.75.75 0 011.061-1.06l1.06 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06zm12.728 0a.75.75 0 01-1.06-1.06l1.06-1.061a.75.75 0 011.061 1.06l-1.06 1.061zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z';
  
  themeToggle.querySelector('svg path').setAttribute('d', svgPath);
}

// Инициализация
updateThemeIcon();
themeToggle.addEventListener('click', updateThemeIcon);

// ПАСХАЛКА С ПОЛИВОМ
document.addEventListener('DOMContentLoaded', () => {
  const wateringCan = document.getElementById('watering-can');
  const mound = document.getElementById('mound');
  const sprout = document.getElementById('sprout');
  
  // Проверяем сохранённый прогресс
  if (localStorage.getItem('gardenSprout') === 'grown') {
    sprout.classList.add('visible');
  }

  // Перетаскивание лейки
  let isDragging = false;
  let offsetX, offsetY;

  wateringCan.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - wateringCan.getBoundingClientRect().left;
    offsetY = e.clientY - wateringCan.getBoundingClientRect().top;
    wateringCan.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Ограничиваем перемещение в пределах экрана
    const maxX = window.innerWidth - wateringCan.offsetWidth;
    const maxY = window.innerHeight - wateringCan.offsetHeight;
    
    wateringCan.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    wateringCan.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    wateringCan.style.cursor = 'grab';
    
    // Проверяем, полили ли мы бугорок
    const canRect = wateringCan.getBoundingClientRect();
    const moundRect = mound.getBoundingClientRect();
    
    if (
      canRect.right > moundRect.left &&
      canRect.left < moundRect.right &&
      canRect.bottom > moundRect.top &&
      canRect.top < moundRect.bottom
    ) {
      // Анимация полива
      wateringCan.style.transform = 'scale(0.95)';
      setTimeout(() => {
        wateringCan.style.transform = '';
        
        // Росток
        if (!sprout.classList.contains('visible')) {
          sprout.classList.add('visible');
          localStorage.setItem('gardenSprout', 'grown');
          
          // Эффект частиц воды
          createWaterParticles(moundRect);
        }
      }, 200);
    }
  });

  // Эффект частиц воды
  function createWaterParticles(moundRect) {
    const particleCount = 15;
    const centerX = moundRect.left + moundRect.width / 2;
    const centerY = moundRect.top + moundRect.height / 2;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'water-particle';
      document.body.appendChild(particle);
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: var(--leaf);
        border-radius: 50%;
        left: ${centerX}px;
        top: ${centerY}px;
        pointer-events: none;
        z-index: 200;
      `;
      
      // Анимация частицы
      setTimeout(() => {
        particle.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.opacity = '0';
        particle.style.transform = 'scale(1.5)';
        
        // Удаление после анимации
        setTimeout(() => {
          particle.remove();
        }, 800);
      }, i * 30);
    }
  }
});

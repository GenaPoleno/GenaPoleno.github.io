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

document.addEventListener('DOMContentLoaded', function() {
  loadEntries();
  
  // Синхронизация темы
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  
  // Переключение темы
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      this.textContent = isDark ? 'light' : 'dark';
    });
  }
});

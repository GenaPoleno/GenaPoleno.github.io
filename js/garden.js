/**
 * garden.js (версия 4.0 — статичный, садовый)
 * 
 * Принципы:
 * - Однократный запрос к GitHub API за списком файлов
 * - Дата берётся из имени файла: 2025-12-05-tema.md
 * - Сортировка: новые записи сверху (по имени файла)
 * - Нет запросов на каждый файл → масштабируемо
 */

const REPO_API = 'https://api.github.com/repos/GenaPoleno/GenaPoleno.github.io/contents/entries';
const gardenMap = document.querySelector('.garden-map');

// Преобразует имя файла в заголовок: "2025-12-05-tema.md" → "Tema"
function formatTitle(filename) {
  // Убираем дату и расширение
  let clean = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.(md|html)$/, '');
  // Заменяем дефисы на пробелы
  clean = clean.replace(/-/g, ' ');
  // Делаем каждое слово с заглавной буквы
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
  const m = parseInt(dateObj.month, 10) - 1; // месяцы с 0
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн',
                  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${d} ${months[m]} ${dateObj.year}`;
}

// Основная функция
async function loadEntries() {
  try {
    // Один запрос за списком файлов
    const response = await fetch(REPO_API);
    if (!response.ok) throw new Error('Не удалось загрузить записи');
    
    const files = await response.json();
    
    // Фильтруем только .md и .html
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
      // Сортируем по имени файла в обратном порядке (новые сверху)
      .sort((a, b) => b.name.localeCompare(a.name));

    // Очищаем и рендерим
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

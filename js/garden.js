/**
 * garden.js (версия 2.0)
 * Теперь поддерживает отображение Markdown-записей.
 * Изменения:
 * 1. Ищет файлы с расширением .md в папке /entries
 * 2. Генерирует ссылки вида: entry-template.html?file=имя-файла.md
 * 3. Сохраняет возможность открытия старых .html файлов
 * 
 * Логика работы:
 * - Если есть .md файл с таким же именем, как .html — показываем .md версию
 * - Иначе показываем обычный HTML
 */

// 1. URL для GitHub API (папка с записями)
const repoUrl = 'https://api.github.com/repos/GenaPoleno/GenaPoleno.github.io/contents/entries';
const gardenMap = document.querySelector('.garden-map');

// 2. Функция преобразования имени файла в человекочитаемый заголовок
function formatTitle(filename) {
  // Убираем расширение
  let title = filename.replace(/\.(html|md)$/, '');
  // Заменяем дефисы и подчёркивания на пробелы
  title = title.replace(/[-_]/g, ' ');
  // Делаем первую букву каждого слова заглавной
  title = title.replace(/\b\w/g, char => char.toUpperCase());
  return title;
}

// 3. Основная функция загрузки записей
async function loadEntries() {
  try {
    // Запрашиваем список файлов в папке /entries
    const response = await fetch(repoUrl);
    
    if (!response.ok) {
      // Обработка лимита GitHub API (60 запросов/час без авторизации)
      if (response.status === 403) {
        throw new Error('Превышен лимит запросов к GitHub. Обновите страницу через минуту.');
      }
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const files = await response.json();
    
    // 4. Группируем файлы по базовому имени (без расширения)
    const entriesMap = new Map();
    
    files.forEach(file => {
      if (file.name.endsWith('.html') || file.name.endsWith('.md')) {
        // Имя без расширения (example.html → example)
        const baseName = file.name.replace(/\.(html|md)$/, '');
        
        if (!entriesMap.has(baseName)) {
          entriesMap.set(baseName, { html: false, md: false });
        }
        
        const entry = entriesMap.get(baseName);
        if (file.name.endsWith('.html')) entry.html = true;
        if (file.name.endsWith('.md')) entry.md = true;
      }
    });

    // 5. Создаём элементы списка для каждой записи
    // Сортируем по алфавиту (новые записи сверху, если имена начинаются с даты)
    Array.from(entriesMap.keys())
      .sort((a, b) => b.localeCompare(a))
      .forEach(baseName => {
        const entry = entriesMap.get(baseName);
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // Приоритет: если есть .md версия — используем её
        if (entry.md) {
          a.href = `entry-template.html?file=${baseName}.md`;
        } else if (entry.html) {
          a.href = `entries/${baseName}.html`;
        }
        
        a.textContent = formatTitle(baseName);
        li.appendChild(a);
        gardenMap.appendChild(li);
      });

  } catch (error) {
    console.error('Ошибка загрузки записей:', error);
    
    const errorItem = document.createElement('li');
    errorItem.innerHTML = `<span style="color: #e53935">⚠️ ${error.message}</span>`;
    gardenMap.appendChild(errorItem);
  }
}

// 6. Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', loadEntries);

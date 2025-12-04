/**
 * garden.js
 * Автоматически генерирует список записей на главной странице.
 * Как работает:
 * 1. Запрашивает список файлов в папке /entries через GitHub API
 * 2. Фильтрует только .html файлы
 * 3. Создаёт элементы списка <li> для каждой записи
 * 4. Вставляет их в блок с классом .garden-map
 * 
 * Требования:
 * - На главной странице должен быть <ul class="garden-map"></ul>
 * - Имена файлов в /entries/ должны быть в формате:
 *   "название-записи.html" (через дефисы)
 */

// 1. Получаем имя пользователя и репозитория из URL
const repoUrl = 'https://api.github.com/repos/GenaPoleno/GenaPoleno.github.io/contents/entries';
const gardenMap = document.querySelector('.garden-map');

// 2. Функция для преобразования snake_case или kebab-case в Человеческий Текст
function formatTitle(filename) {
  // Убираем расширение .html
  let title = filename.replace('.html', '');
  // Заменяем дефисы на пробелы
  title = title.replace(/-/g, ' ');
  // Делаем первую букву каждого слова заглавной
  title = title.replace(/\b\w/g, char => char.toUpperCase());
  return title;
}

// 3. Основная функция загрузки записей
async function loadEntries() {
  try {
    // Запрашиваем данные у GitHub API
    const response = await fetch(repoUrl);
    
    // Если ошибка (например, превышен лимит запросов)
    if (!response.ok) {
      throw new Error('Не удалось загрузить записи. Попробуйте позже.');
    }

    const files = await response.json();
    
    // 4. Фильтруем только HTML-файлы и создаём элементы списка
    files
      .filter(file => file.name.endsWith('.html')) // Оставляем только .html
      .sort((a, b) => b.name.localeCompare(a.name)) // Сортируем по алфавиту (новые сверху)
      .forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // Формируем путь к записи: entries/имя-файла.html
        a.href = `entries/${file.name}`;
        // Преобразуем имя файла в красивый заголовок
        a.textContent = formatTitle(file.name);
        
        li.appendChild(a);
        gardenMap.appendChild(li);
      });

  } catch (error) {
    // 5. Обработка ошибок: показываем сообщение в консоли и на странице
    console.error('Ошибка загрузки записей:', error);
    
    const errorItem = document.createElement('li');
    errorItem.innerHTML = `<span style="color: #e53935">⚠️ ${error.message}</span>`;
    gardenMap.appendChild(errorItem);
  }
}

// 6. Запускаем загрузку записей, когда страница готова
document.addEventListener('DOMContentLoaded', loadEntries);

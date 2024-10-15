import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './App.css'
import { TimelineIcon } from './Icon';
import Section from '@/Section';

export type Item = {
  id: number,
  productId: number,
  fileVersion: string,
  type: number,
  changes: {
    title: string,
    description: string,
    fileVersion: string,
    type: number,
    detailed?: string
  }[],
  metadata: {
    publishDate: string,
    isPublic: boolean
  }
}

type Product = {
  id: number;
  name: string;
  version: string;
  alias: string;
}

type ProductFilterMap = {
  [key: string]: number[];
};

const INITIAL_LIMIT = 100;

function App() {
  const [offset, setOffset] = useState(0);
  const [showButton, setShowButton] = useState(true);
  const [totalItem, setTotalItem] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [data, setData] = useState<Item[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [allData, setAllData] = useState<Item[]>([]);
  const [serverData, setServerData] = useState<Product[]>([])
  const [expandedGroups, setExpandedGroups] = useState<{ [itemId: number]: { [groupType: number]: boolean } }>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [showAllFilters, setShowAllFilters] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const additionalProducts = ['5.5', '6.1', 'Документация'];

  // Функция для генерации константы products
  const generateProducts = (data: any[]) => {
    const productNames = data.map(item => item.name);
    return [...new Set([...additionalProducts, ...productNames])];
  };

  // Функция для генерации productFilterMap с автоматическим распределением версий
  const generateProductFilterMap = (data: Product[]): ProductFilterMap => {
    const map: ProductFilterMap = {};

    // Обрабатываем серверные данные и группируем по именам продуктов
    data.forEach(item => {
      // Группировка по продуктам
      if (!map[item.name]) {
        map[item.name] = [];
      }
      map[item.name].push(item.id);
    });

    // Создаём отдельные массивы для версий 5.5, 6.1 и документации
    const version5_5: number[] = [];
    const version6_1: number[] = [];
    const documentation = [99]; // Заглушка для документации

    // Проверка версии для автоматического добавления в '5.5' или '6.1'
    data.forEach(item => {
      if (item.version.startsWith('5')) {
        version5_5.push(item.id);
      } else if (item.version.startsWith('6')) {
        version6_1.push(item.id);
      }
    });

    // Добавляем версии 5.5, 6.1 и документацию в конце
    map['5.5'] = version5_5;
    map['6.1'] = version6_1;
    map['Документация'] = documentation;

    return map;
  };

  const products = generateProducts(serverData)
  const displayedProducts = showAllFilters ? products : products.slice(0, 8);
  const productFilterMap = generateProductFilterMap(serverData)

  const getTitle = (id: number) => serverData.find(item => item.id === id)?.name;
  const getVersion = (id: number) => serverData.find(item => item.id === id)?.version;

  const productIconMap: { [key: string]: string } = {
    'Документация': 'icon-nav-component-webclient',
    'Платформа': 'icon-nav-component-platform',
    'Web-клиент': 'icon-nav-component-webclient',
    'Управление документами': 'icon-nav-component-documentmgmt',
    'Конструктор согласований': 'icon-nav-component-approval',
    'Базовые объекты': 'icon-nav-component-backoffice',
    'Windows-клиент': 'icon-nav-component-winclient',
    'Служба фоновых операций': 'icon-nav-component-workerservice',
    'Консоль управления': 'icon-nav-component-mgmtconsole',
    'Модуль интеграции с операторами ЭДО': 'icon-nav-component-edi',
    'Делопроизводство 4.5': 'icon-nav-component-takeoffice',
    'Управление процессами': 'icon-nav-component-workflow',
    'Менеджер решений': 'icon-nav-component-solutionmngr',
    'Модуль интеграции с реестром МЧД': 'icon-nav-component',
    'Модуль интеграции с УЦ Контур': 'icon-nav-component',
    'Управление архивом': 'icon-nav-component-archivemgmt',
    'Сервис конвертации файлов': 'icon-nav-component',
  };

  const findIconIdByProductId = (productId: number): string | undefined => {
    for (const [productName, productIds] of Object.entries(productFilterMap)) {
      if (productIds.includes(productId)) {
        return productIconMap[productName];
      }
    }
    return undefined;
  };

  const formattedDate = (item: Item) => {
    return format(new Date(item.metadata.publishDate), 'dd MMM yyyy', { locale: ru });
  };

  const formattedGroupDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: ru });
};

  const handleClickButton = () => {
    getData();
  }

  const fetchDataAndFilter = async (searchQuery: string): Promise<Item[]> => {
    const response = await fetch(`https://help.docsvision.com/api/changelog/tree?offset=0&limit=999`);
    const fetchedData = await response.json();
    if (!response.ok) throw new Error(fetchedData.message || response.statusText);
    setAllData(fetchedData);
    return filterSearchResults(fetchedData, searchQuery);
  }

  const fetchDataProducts = async () => {

    const response = await fetch(`https://help.docsvision.com/api/changelog/products`);
    const fetchedData = await response.json();
    setServerData(fetchedData);
  }
  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const filterSearchResults = (items: Item[], query: string): Item[] => {
    return items
      .map(item => {
        const matchingChanges = item.changes
          .map(change => {
            const titleHighlighted = highlightText(change.title, query);
            const descriptionHighlighted = highlightText(change.description, query);
            const detailedHighlighted = change.detailed ? highlightText(change.detailed, query) : '';
            return {
              ...change,
              title: titleHighlighted,
              description: descriptionHighlighted,
              detailed: detailedHighlighted,
            };
          })
          .filter(change =>
            change.title.includes('<mark>') ||
            change.description.includes('<mark>') ||
            (change.detailed && change.detailed.includes('<mark>'))
          );
        return matchingChanges.length ? { ...item, changes: matchingChanges } : null;
      })
      .filter(Boolean) as Item[];
  };

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim()) {
      const filteredItems = allData.length
        ? filterSearchResults(allData, searchQuery)
        : await fetchDataAndFilter(searchQuery);
      setShowButton(false);
      setData(filteredItems.length ? filteredItems : []);
    } else {
      handleClearSearch();
    }
  }

  const handleClearSearch = () => {
    if (allData.length) {
      setSearchValue('');
      setData(allData.slice(0, INITIAL_LIMIT))
      setShowButton(true)
    }
  }
  const handleFilterClick = (filter: string) => {
    setActiveFilters(prevFilters => prevFilters.includes(filter)
      ? prevFilters.filter(prevFilter => prevFilter !== filter)
      : [...prevFilters, filter]);
  }

  const filteredData = activeFilters.length
    ? data.filter(item => {
      // Извлекаем фильтры версий и продуктов
      const versionFilters = activeFilters.filter(filter => ['5.5', '6.1'].includes(filter));
      const productFilters = activeFilters.filter(filter => !['5.5', '6.1', 'Документация'].includes(filter));
      const isDocumentationFilterActive = activeFilters.includes('Документация');

      // Проверяем соответствие версиям и продуктам
      const matchesVersion = versionFilters.length === 0 || versionFilters.some(version => productFilterMap[version].includes(item.productId));
      const matchesProduct = productFilters.length === 0 || productFilters.some(product => productFilterMap[product].includes(item.productId));
      const hasDocumentationChanges = item.changes.some(change => change.type === 6);

      // Если активен фильтр по документации, показываем только элементы с документацией и соответствующие другим фильтрам
      if (isDocumentationFilterActive) {
        return hasDocumentationChanges && matchesVersion && matchesProduct;
      }

      // Если фильтр "Документация" не активен, не показываем объекты с изменениями в документации
      if (hasDocumentationChanges) {
        return false;
      }

      // Фильтрация только по версиям и продуктам
      return matchesVersion && matchesProduct;
    })
    : data;

  const groupDataByDate = (data: Item[]): { date: string; items: Item[] }[] => {
    // Сначала сортируем данные по дате
    const sortedData = data.sort((a, b) => new Date(b.metadata.publishDate).getTime() - new Date(a.metadata.publishDate).getTime());

    // Группируем данные по дате, создавая массив объектов
    const groupedData: { date: string; items: Item[] }[] = [];

    sortedData.forEach((item) => {
      const publishDate = format(new Date(item.metadata.publishDate), 'yyyy-MM-dd');
      const existingGroup = groupedData.find((group) => group.date === publishDate);

      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        groupedData.push({ date: publishDate, items: [item] });
      }
    });

    return groupedData;
  };

  const groupedData = groupDataByDate(filteredData);
  console.log(groupedData);


  const getData = async (initialLimit?: number) => {
    try {
      let newOffset = 0;
      if (!initialLimit) {
        newOffset = offset + INITIAL_LIMIT;
        setOffset(newOffset);
      }
      const response = await fetch(`https://help.docsvision.com/api/changelog/tree?offset=${newOffset}&limit=${INITIAL_LIMIT}`);
      const newData = await response.json();
      if (!response.ok) {
        throw new Error(newData.message || response.statusText);
      }
      setData([...data, ...newData]);
      setTotalItem(totalItem + newData.length);
      setShowButton(true)
      if (newData.length < INITIAL_LIMIT) {
        setShowButton(false)
      }
    } catch (error) {
      console.error('Ошибка получения данных с сервера', error);
    }
  }

  // Логика для переключения видимости всех групп у конкретного айтема
  const toggleExpandAllForItem = (itemId: number) => {
    const currentExpandedState = expandedGroups[itemId] || { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };

    // Проверяем, если все группы уже развернуты
    const allExpanded = Object.values(currentExpandedState).every(val => val);

    // Устанавливаем состояние всех групп в зависимости от их текущего состояния
    const newExpandedGroups = {
      ...expandedGroups,
      [itemId]: Object.keys(currentExpandedState).reduce((acc, key) => {
        acc[Number(key)] = !allExpanded; // Устанавливаем новое состояние для каждой группы
        return acc;
      }, {} as { [groupType: number]: boolean }),
    };

    setExpandedGroups(newExpandedGroups);
  };

  // Функция для переключения состояния группы секций
  const toggleGroup = (itemId: number, groupType: number) => {
    setExpandedGroups(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [groupType]: !prev[itemId]?.[groupType],
      },
    }));
  };

  const toggleDetails = (index: number) => {
    setExpandedDetails(prevState => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  useEffect(() => {
    getData(INITIAL_LIMIT);
    fetchDataProducts()
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchValue) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchValue);
      }, 1000);
    } else {
      searchTimeoutRef.current = setTimeout(() => {
        handleClearSearch();
      }, 1000);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]);

  return (
    <div className='timeline'>
      <h1 className='timeline__header'>История изменений</h1>
      <div className="timeline__container">
        <div className="timeline__box">
          <ul className="timeline__list">
            {groupedData.map((group) => (
              <li key={group.date} className='timeline__date-group'>
                <div className='timeline__date-line'></div> {/* Соединительная линия на уровне группы дат */}
                <div className='timeline__date-header'>
                  <div className='timeline__date-circle'></div> {/* Круг на линии слева от даты */}
                  <h2 className='timeline__date-title'>{formattedGroupDate(group.date)}</h2>
                </div>
                <ul className='timeline__date-items'>
                  {group.items.map((item: Item) => (
                    <li key={item.id} className={`timeline__list-item`}>
                      <div className='timeline__icon'>
                        <div className='timeline__icon-circle'>
                          <TimelineIcon iconId={findIconIdByProductId(item.productId)} />
                        </div>
                        {/* <div className='timeline__icon-line'></div> */}
                      </div>
                      <div className='timeline__content'>
                        <div className='timeline__title'>
                          <div className='timeline__title-text'>
                            {item.type === 1 ? `${getTitle(item.productId)} ${item.fileVersion}` : `Документация ${getTitle(item.productId)} ${getVersion(item.productId)}`}
                          </div>
                          <div className='timeline__title-date-block'>
                            <div className='timeline__date'>
                              {/* <div>{formattedDate(item)}</div> */}
                            </div>
                            <div className='timeline__toggle'>
                              <div className='timeline__toggle-wrapper'>
                                <div onClick={() => toggleExpandAllForItem(item.id)} className='timeline__expand-icon'>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='timeline__text'>
                          <ul>
                            {item.changes.filter(el => el.type === 1).length > 0 && (
                              <Section
                                name={'Исправленные ошибки'}
                                type={1}
                                item={item}
                                expandedGroups={expandedGroups}
                                expandedDetails={expandedDetails}
                                searchValue={searchValue}
                                toggleDetails={toggleDetails}
                                toggleGroup={toggleGroup}
                                highlightText={highlightText} />
                            )}
                            {item.changes.filter(el => el.type === 2).length > 0 && (
                              <Section
                                name={'Оптимизации'}
                                type={2}
                                item={item}
                                expandedGroups={expandedGroups}
                                expandedDetails={expandedDetails}
                                searchValue={searchValue}
                                toggleDetails={toggleDetails}
                                toggleGroup={toggleGroup}
                                highlightText={highlightText} />
                            )}
                            {item.changes.filter(el => el.type === 3).length > 0 && (
                              <Section
                                name={'Функциональные изменения'}
                                type={3}
                                item={item}
                                expandedGroups={expandedGroups}
                                expandedDetails={expandedDetails}
                                searchValue={searchValue}
                                toggleDetails={toggleDetails}
                                toggleGroup={toggleGroup}
                                highlightText={highlightText} />
                            )}
                            {item.changes.filter(el => el.type === 4).length > 0 && (
                              <Section
                                name={'Изменения в библиотеках элементов управления'}
                                type={4}
                                item={item}
                                expandedGroups={expandedGroups}
                                expandedDetails={expandedDetails}
                                searchValue={searchValue}

                                toggleDetails={toggleDetails}
                                toggleGroup={toggleGroup}
                                highlightText={highlightText} />
                            )}
                            {item.changes.filter(el => el.type === 5).length > 0 && (
                              <Section
                                name={'Изменения в API'}
                                type={5}
                                item={item}
                                expandedGroups={expandedGroups}
                                expandedDetails={expandedDetails}
                                searchValue={searchValue}
                                toggleDetails={toggleDetails}
                                toggleGroup={toggleGroup}
                                highlightText={highlightText} />
                            )}
                            {item.changes.filter(el => el.type === 6).length > 0 && (
                              <Section
                                name={'Изменения в документации'}
                                type={6}
                                item={item}
                                expandedGroups={expandedGroups}
                                expandedDetails={expandedDetails}
                                searchValue={searchValue}
                                toggleDetails={toggleDetails}
                                toggleGroup={toggleGroup}
                                highlightText={highlightText} />
                            )}
                          </ul>
                        </div>
                      </div>
                    </li>
                  ))}
                  {!showButton && (data.length === 0 || filteredData.length === 0) && (
                    <div className='message-container'>Не найдено.</div>
                  )}
                </ul>
              </li>
            ))}
          </ul>
          {data.length > 0 && !showButton && (
            (activeFilters.length > 0 && filteredData.length > 0) || // Когда есть активные фильтры и отфильтрованные данные
            (activeFilters.length === 0) // Или когда нет активных фильтров
          ) && (
              <div className='timeline__end'></div>
            )}
        </div>
        <div className='sidebar'>
          <div className='filter'>
            <div className="timeline__search">
              <div className='timeline__search-input-wrapper'>
                <div className='timeline__search-icon'></div>
                <input placeholder='Поиск по изменениям'
                  type="text"
                  className='timeline__search-input'
                  onChange={(e) => setSearchValue(e.target.value)}
                  value={searchValue} />
                {searchValue && <div onClick={handleClearSearch} className='timeline__search-clear-btn'></div>}
              </div>
            </div>
            <div className="timeline__filter">
              {displayedProducts.map((product) => (
                <label key={product} className="timeline__filter-product">
                  <input
                    type="checkbox"
                    checked={activeFilters.includes(product)}
                    onChange={() => handleFilterClick(product)}
                  />
                  {product}
                </label>
              ))}
            </div>
            {!showAllFilters && <div className='btn-show-all' onClick={() => setShowAllFilters(true)}>+ Больше фильтров</div>}
          </div>
        </div>
      </div>
      <div className="timeline__button-wrapper">
        {
          showButton && (
            <button className='timeline__button' onClick={handleClickButton}>
              загрузить ещё
            </button>
          )
        }
      </div>
    </div >
  );
}
export default App;

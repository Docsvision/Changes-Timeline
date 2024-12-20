import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './App.css'
import { productIconMap, TimelineIcon } from './Icon';
import Section from '@/Section';
import { getProductVersionFromPathname } from '@/helpers/getProductVersionFromPathname';
import { Item, Product, ProductFilterMap } from '@/types/Types';

const INITIAL_LIMIT = 100;

function App() {
  const predefinedProductVersion = getProductVersionFromPathname();
  const [offset, setOffset] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalItem, setTotalItem] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>(() => predefinedProductVersion ? [predefinedProductVersion] : []);
  const [data, setData] = useState<Item[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [allData, setAllData] = useState<Item[]>([]);
  const [serverData, setServerData] = useState<Product[]>([])
  const [expandedGroups, setExpandedGroups] = useState<{ [itemId: number]: { [groupType: number]: boolean } }>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [isRendered, setIsRendered] = useState(false); // Добавляем состояние для отслеживания завершения рендера

  const loaderRef = useRef<HTMLDivElement | null>(null); // Реф для ленивой загрузки
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialized = useRef(false); // Используем useRef для контроля однократного выполнения

  // Функция для генерации константы products
  const generateProducts = (data: any[]) => {
    const additionalProducts = ['Документация', ...(predefinedProductVersion ? [] : ['5.5', '6.1'] )];

    return sortProducts(data, additionalProducts);
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

  const sortOrder = ["5.5", "6.1", "7", "1", "6", "8", "13", "20", "28", "5", "3", "12", "19", "22", "32", "2", "Документация", "27", "29", "15"];

  // Функция для сортировки продуктов
  const sortProducts = (data: any[], additionalProducts: any) => {
    if (data.length > 0) {
      const productNames = data.map(item => ({
        ...item, // Сохраняем продуктовые данные
        sortKey: item.id.toString(), // Добавляем ключ для сортировки по id
      }));

      // Объединяем данные с дополнительными продуктами
      const combinedProducts = [...productNames, ...additionalProducts.map((name: any) => ({ name, sortKey: name, id: name }))];

      // Сортировка по массиву sortOrder
      const sortedProducts = combinedProducts.sort((a, b) => {
        const indexA = sortOrder.indexOf(a.sortKey);
        const indexB = sortOrder.indexOf(b.sortKey);

        // Если элемент отсутствует в sortOrder, помещаем его в конец
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
      });
      // Возвращаем только массив имен продуктов
      const productName = sortedProducts.map(product => product.name);
      return [...new Set([...productName])];
    };
  }

  const products = generateProducts(serverData)
  const productFilterMap = generateProductFilterMap(serverData)

  const getTitle = (id: number) => serverData.find(item => item.id === id)?.name;
  const getVersion = (id: number) => serverData.find(item => item.id === id)?.version;

  const findIconIdByProductId = (productId: number): string | undefined => {
    for (const [productName, productIds] of Object.entries(productFilterMap)) {
      if (productIds.includes(productId)) {
        return productIconMap[productName];
      }
    }
    return undefined;
  };

  const formattedGroupDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: ru });
  };

  // функция загрузки всех обьктов при поиске
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

  // маркируем совпадения поиска
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
      setHasMoreData(false);
      setData(filteredItems.length ? filteredItems : []);
      initialized.current = false;
    } else {
      handleClearSearch();
    }
  }

  const handleClearSearch = () => {
    if (allData.length) {
      setSearchValue('');
      setData(allData.slice(0, INITIAL_LIMIT))
      setHasMoreData(true)
    }
  }

  // при клике на чекбокс
  const handleFilterClick = (filter: string) => {
    setActiveFilters(prevFilters => prevFilters.includes(filter)
      ? prevFilters.filter(prevFilter => prevFilter !== filter)
      : [...prevFilters, filter]);
    initialized.current = false
  }

  const filteredData = activeFilters
    ? data.filter(item => {
      // Извлекаем фильтры версий и продуктов
      const versionFilters = activeFilters.filter(filter => ['5.5', '6.1'].includes(filter));
      const productFilters = activeFilters.filter(filter => !['5.5', '6.1', 'Документация'].includes(filter));
      const isDocumentationFilterActive = activeFilters.includes('Документация');

      // Проверяем соответствие версиям и продуктам
      const matchesVersion = versionFilters.length === 0 || versionFilters.some(version => productFilterMap[version].includes(item.productId));
      const matchesProduct = productFilters.length === 0 || productFilters.some(product => productFilterMap[product].includes(item.productId));
      const hasDocumentationChanges = item.changes.some(change => change.type === 6);

      // Если активен только фильтр документации, показываем только документации
      if (isDocumentationFilterActive && productFilters.length === 0 && versionFilters.length === 0) {
        return hasDocumentationChanges
      }
      // Если активен фильтр документации и версию, показываем документацию и версию
      if (isDocumentationFilterActive && productFilters.length === 0 && versionFilters.length > 0) {
        return matchesVersion
      }
      // Если активен фильтр документации и продукт, показываем документацию и продукт
      if (isDocumentationFilterActive && productFilters.length > 0 && versionFilters.length === 0) {
        return matchesProduct
      }
      // Если активен фильтр документации и версию и продукт, показываем документацию и версию и продукт
      if (isDocumentationFilterActive && productFilters.length > 0 && versionFilters.length > 0) {
        return matchesProduct && matchesVersion
      }
      // Если нет фильтра вернем все данные кроме документации
      if (!isDocumentationFilterActive && productFilters.length === 0 && versionFilters.length === 0) {
        return !hasDocumentationChanges
      }
      // Если активен фильтр версии, показываем только версию без документации
      if (!isDocumentationFilterActive && productFilters.length === 0 && versionFilters.length > 0) {
        return !hasDocumentationChanges && matchesVersion
      }
      // Если активен фильтр продукта, показываем только продукт без документации
      if (!isDocumentationFilterActive && productFilters.length > 0 && versionFilters.length === 0) {
        return !hasDocumentationChanges && matchesProduct
      }
      // Если активен фильтр версии и продукта, показываем только версию и продукт без документации
      if (!isDocumentationFilterActive && productFilters.length > 0 && versionFilters.length > 0) {
        return !hasDocumentationChanges && matchesProduct && matchesVersion
      }

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

  const getData = async (initialLimit?: number, customOffset?: number) => {
    try {
      let newOffset = 0;
      if (!initialLimit) {
        newOffset = customOffset ? customOffset : offset + INITIAL_LIMIT;
        setOffset(newOffset);
      }
      const response = await fetch(`https://help.docsvision.com/api/changelog/tree?offset=${newOffset}&limit=${INITIAL_LIMIT}`);
      const newData = await response.json();
      if (!response.ok) {
        throw new Error(newData.message || response.statusText);
      }
      setData([...data, ...newData]);
      setTotalItem(totalItem + newData.length);
      if (newData.length < INITIAL_LIMIT) {
        setHasMoreData(false)
        setOffset((prevOffset) => prevOffset + INITIAL_LIMIT);

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
// При клике на дату разворачиваем все элементы
  const toggleExpandAllForDate = (group: { items: Item[] }) => {
    // Проверяем, есть ли хотя бы один элемент, полностью развернутый в группе
    const isAnyExpanded = group.items.some(item => {
      const itemState = expandedGroups[item.id] || {};
      return Object.values(itemState).some(val => val); // true, если хотя бы одна группа развернута
    });

    // Устанавливаем новое состояние в зависимости от того, развернут ли хотя бы один элемент
    const newExpandedState = group.items.reduce((acc: { [key: number]: { [groupType: number]: boolean } }, item) => {
      acc[item.id] = {
        1: !isAnyExpanded,
        2: !isAnyExpanded,
        3: !isAnyExpanded,
        4: !isAnyExpanded,
        5: !isAnyExpanded,
        6: !isAnyExpanded,
      };
      return acc;
    }, {} as { [key: number]: { [groupType: number]: boolean } });

    // Обновляем состояние групп
    setExpandedGroups(prevState => ({
      ...prevState,
      ...newExpandedState,
    }));
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
    // Состояние рендера изменяется на true после того, как список был отрендерен
    if (data.length > 0) {
      setIsRendered(true);
    }
  }, [data]);

  // Используем IntersectionObserver для ленивой загрузки
  useEffect(() => {
    if (!isRendered || !loaderRef.current) return; // Ждём, пока рендер завершится

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreData) {
          getData(); // Подгружаем данные только после завершения рендера
        }
      },
      {
        rootMargin: '1000px',
      }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [isRendered, hasMoreData, offset]);

  useEffect(() => {
    getData(INITIAL_LIMIT);
    fetchDataProducts()
  }, []);

  useEffect(() => {

    if (!initialized.current && groupedData.length > 0) {
      const firstGroup = groupedData[0];

      // Проходим по каждому элементу первой группы
      firstGroup.items.forEach((item) => {
        // Устанавливаем состояние, чтобы все группы были развернуты
        const currentExpandedState = { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true };

        setExpandedGroups(prevState => ({
          ...prevState,
          [item.id]: currentExpandedState, // Открываем все группы для данного элемента
        }));
      });

      initialized.current = true; // Помечаем, что эффект был выполнен
    }
  }, [data, filteredData, groupedData]);


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
      <h1 className='timeline__header'>Изменения в продукте</h1>
      <div className="timeline__container">
        <div className="timeline__box">
          <ul className="timeline__list">
            {groupedData.map((group) => (
              <li key={group.date} className='timeline__date-group'>
                <div className='timeline__date-header'>
                  <div
                    className='timeline__date-title'
                    onClick={() => toggleExpandAllForDate(group)}
                  >
                    {formattedGroupDate(group.date)}
                  </div>
                </div>
                <ul className={`timeline__date-items expanded`}>
                  {group.items.map((item: Item) => (
                    <li key={item.id} className={`timeline__list-item`}>
                      <div className='timeline__date-header'>
                      </div>
                      <div className='timeline__icon'>
                        <div className='timeline__icon-circle'>
                          <TimelineIcon iconId={findIconIdByProductId(item.productId)} />
                        </div>
                        <div className='timeline__icon-line'></div>
                      </div>
                      <div className='timeline__content'>
                        <div className='timeline__title' onClick={() => toggleExpandAllForItem(item.id)}>
                          <div className='timeline__title-text'>
                            {item.type === 1 ? `${getTitle(item.productId)} ${item.fileVersion}` : `Документация ${getTitle(item.productId)} ${getVersion(item.productId)}`}
                          </div>
                          <div className='timeline__toggle'>
                            <div className='timeline__toggle-wrapper'>
                              <div className='timeline__expand-icon'>
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

                </ul>
              </li>
            ))}
            {!hasMoreData && (data.length === 0 || filteredData.length === 0) && (
              <div className='message-container'>Не найдено.</div>
            )}
          </ul>
          {data.length > 0 && !hasMoreData && (
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
              {products?.map((product) => (
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
          </div>
        </div>
      </div>
      {/* Лоадер, который будет наблюдать за концом списка */}
      <div ref={loaderRef} className="timeline__loader">
      </div>
    </div >
  );
}
export default App;

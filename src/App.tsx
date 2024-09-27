import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './App.css'
import { TimelineIcon } from './Icon';

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
  const [expandAll, setExpandAll] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});

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
  const productFilterMap = generateProductFilterMap(serverData)

  const getTitle = (id: number) => serverData[id].name;
  const getVersion = (id: number) => serverData[id].version

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
    return format(new Date(item.metadata.publishDate), 'dd MMMM yyyy', { locale: ru });
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

  const filterSearchResults = (items: Item[], query: string): Item[] => {
    return items
      .map(item => {
        const matchingChanges = item.changes.filter(change =>
          change.description.toLowerCase().includes(query.toLowerCase()) ||
          change.title.toLowerCase().includes(query.toLowerCase()));
        return matchingChanges.length ? { ...item, changes: matchingChanges } : null;
      })
      .filter(Boolean) as Item[];
  }

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
      const productFilters = activeFilters.filter(filter => !['5.5', '6.1'].includes(filter));
      const isDocumentationFilterActive = activeFilters.includes('Документация');

      // Проверяем соответствие версиям и продуктам
      const matchesVersion = versionFilters.length === 0 || versionFilters.some(version => productFilterMap[version].includes(item.productId));
      const matchesProduct = productFilters.length === 0 || productFilters.some(product => productFilterMap[product].includes(item.productId));
      const hasDocumentationChanges = item.changes.some(change => change.type === 6);

      // Логика фильтрации при активном фильтре "Документация"
      if (isDocumentationFilterActive) {
        // Если активированы только фильтры документации и версия
        if (versionFilters.length > 0 && productFilters.length === 1 && productFilters[0] === 'Документация') {
          return matchesVersion && hasDocumentationChanges; // Соответствует версии и имеет изменения документации
        }

        // Если активирован только фильтр документации
        if (versionFilters.length === 0 && productFilters.length === 1 && productFilters[0] === 'Документация') {
          return hasDocumentationChanges; // Возвращаем только элементы с изменениями документации
        }

        // Проверяем совпадение с версиями и продуктами
        return matchesVersion && matchesProduct && hasDocumentationChanges;
      }

      // Если фильтр "Документация" не активен, фильтруем только по версии и продукту
      return matchesVersion && matchesProduct;
    })
    : data;

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

  // Обновляем состояние для каждой группы
  const toggleGroup = (itemId: number, groupType: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [groupType]: !prev[itemId]?.[groupType],
      },
    }));
  };

  // Логика для сворачивания и разворачивания всех групп
  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
    const newExpandedGroups: { [itemId: number]: { [groupType: number]: boolean } } = {};
    data.forEach((item) => {
      newExpandedGroups[item.id] = {};
      [1, 2, 3, 4, 5, 6].forEach((groupType) => {
        newExpandedGroups[item.id][groupType] = !expandAll;
      });
    });
    setExpandedGroups(newExpandedGroups);
  };

  const toggleDetails = (index: number) => {
    setExpandedDetails((prevState) => ({
      ...prevState,
      [index]: !prevState[index]
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
      <div className="timeline__filter">
        {products.map((product) => (
          <div className={`timeline__filter-product ${activeFilters.includes(product) ? 'timeline__filter-product--active' : ''}`}
            key={product}
            onClick={() => handleFilterClick(product)}>
            {product}
          </div>
        ))}
      </div>

      <div className="timeline__container">
        <h1 className='timeline__header'>История изменений</h1>
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
          <div className='timeline__toggle'>
            <div onClick={toggleExpandAll} className={expandAll ? 'timeline__collapse-icon' : 'timeline__expand-icon'}>
            </div>
          </div>
        </div>

        <ul className="timeline__list">
          {filteredData.map((item: Item) => {
            return (
              <li key={item.id} className={`timeline__list-item`}>
                <div className='timeline__date'>
                  <div>{formattedDate(item)}</div>
                </div>
                <div className='timeline__icon'>
                  <div className='timeline__icon-circle'>
                    <TimelineIcon iconId={findIconIdByProductId(item.productId)} />
                  </div>
                  <div className='timeline__icon-line'></div>
                </div>

                <div className='timeline__content'>
                  <div className='timeline__title'>
                    {item.type === 1 ? `${getTitle(item.productId)} ${item.fileVersion}` : `Документация ${getTitle(item.productId)} ${getVersion(item.productId)}`}
                  </div>

                  <div className='timeline__text'>

                    <ul>
                      {item.changes.filter(el => el.type === 1).length > 0 && (
                        <>
                          <li
                            className='timeline__section-title timeline__section-title-error'
                            onClick={() => toggleGroup(item.id, 1)}
                          >
                            Исправленные ошибки
                            <div className='timeline__wrapper-icon'>
                              <div className={expandedGroups[item.id]?.[1] ? 'timeline__icon-up' : 'timeline__icon-down'}>
                              </div>
                            </div>
                          </li>
                          <div className={expandedGroups[item.id]?.[1] ? 'timeline__section-content open' : 'timeline__section-content closed'}>
                            <ul>
                              {item.changes.filter(el => el.type === 1).map((el, index) => (
                                <li key={`error-${index}`} className='timeline__change-item'>
                                  <div className='timeline__change'>
                                    <div className='timeline__change-title'>{el.title}</div>
                                    <div className='timeline__change-text'>{el.description}</div>
                                  </div>
                                  {el.detailed && (
                                    <>
                                      <button onClick={() => toggleDetails(index)}>
                                        {expandedDetails[index] ? 'Скрыть детали' : 'Ещё'}
                                      </button>
                                      <div
                                        className={`timeline__change-detailed ${expandedDetails[index] ? 'visible' : 'hidden'}`}
                                        dangerouslySetInnerHTML={{ __html: el.detailed }}
                                      />
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      {item.changes.filter(el => el.type === 2).length > 0 && (
                        <>
                          <li
                            className='timeline__section-title timeline__section-title-optimization'
                            onClick={() => toggleGroup(item.id, 2)}
                          >
                            Оптимизации
                            <div className='timeline__wrapper-icon'>
                              <div className={expandedGroups[item.id]?.[2] ? 'timeline__icon-up' : 'timeline__icon-down'}>
                              </div>
                            </div>
                          </li>
                          <div className={expandedGroups[item.id]?.[2] ? 'timeline__section-content open' : 'timeline__section-content closed'}>
                            <ul>
                              {item.changes.filter(el => el.type === 2).map((el, index) => (
                                <li key={`error-${index}`} className='timeline__change-item'>
                                  <div className='timeline__change'>
                                    <div className='timeline__change-title'>{el.title}</div>
                                    <div className='timeline__change-text'>{el.description}</div>
                                  </div>
                                  {el.detailed && (
                                    <>
                                      <button onClick={() => toggleDetails(index)}>
                                        {expandedDetails[index] ? 'Скрыть детали' : 'Ещё'}
                                      </button>
                                      <div
                                        className={`timeline__change-detailed ${expandedDetails[index] ? 'visible' : 'hidden'}`}
                                        dangerouslySetInnerHTML={{ __html: el.detailed }}
                                      />
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      {item.changes.filter(el => el.type === 3).length > 0 && (
                        <>
                          <li
                            className='timeline__section-title timeline__section-title-update'
                            onClick={() => toggleGroup(item.id, 3)}
                          >
                            Функциональные изменения
                            <div className='timeline__wrapper-icon'>
                              <div className={expandedGroups[item.id]?.[3] ? 'timeline__icon-up' : 'timeline__icon-down'}>
                              </div>
                            </div>                          </li>
                            <div className={expandedGroups[item.id]?.[3] ? 'timeline__section-content open' : 'timeline__section-content closed'}>
                            <ul>
                              {item.changes.filter(el => el.type === 3).map((el, index) => (
                                <li key={`error-${index}`} className='timeline__change-item'>
                                  <div className='timeline__change'>
                                    <div className='timeline__change-title'>{el.title}</div>
                                    <div className='timeline__change-text'>{el.description}</div>
                                  </div>
                                  {el.detailed && (
                                    <>
                                      <button onClick={() => toggleDetails(index)}>
                                        {expandedDetails[index] ? 'Скрыть детали' : 'Ещё'}
                                      </button>
                                      <div
                                        className={`timeline__change-detailed ${expandedDetails[index] ? 'visible' : 'hidden'}`}
                                        dangerouslySetInnerHTML={{ __html: el.detailed }}
                                      />
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      {item.changes.filter(el => el.type === 4).length > 0 && (
                        <>
                          <li
                            className='timeline__section-title timeline__section-title-libraries'
                            onClick={() => toggleGroup(item.id, 4)}
                          >
                            Изменения в библиотеках элементов управления
                            <div className='timeline__wrapper-icon'>
                              <div className={expandedGroups[item.id]?.[4] ? 'timeline__icon-up' : 'timeline__icon-down'}>
                              </div>
                            </div>                          </li>
                            <div className={expandedGroups[item.id]?.[4] ? 'timeline__section-content open' : 'timeline__section-content closed'}>
                            <ul>
                              {item.changes.filter(el => el.type === 4).map((el, index) => (
                                <li key={`error-${index}`} className='timeline__change-item'>
                                  <div className='timeline__change'>
                                    <div className='timeline__change-title'>{el.title}</div>
                                    <div className='timeline__change-text'>{el.description}</div>
                                  </div>
                                  {el.detailed && (
                                    <>
                                      <button onClick={() => toggleDetails(index)}>
                                        {expandedDetails[index] ? 'Скрыть детали' : 'Ещё'}
                                      </button>
                                      <div
                                        className={`timeline__change-detailed ${expandedDetails[index] ? 'visible' : 'hidden'}`}
                                        dangerouslySetInnerHTML={{ __html: el.detailed }}
                                      />
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      {item.changes.filter(el => el.type === 5).length > 0 && (
                        <>
                          <li
                            className='timeline__section-title timeline__section-title-api'
                            onClick={() => toggleGroup(item.id, 5)}
                          >
                            Изменения API
                            <div className='timeline__wrapper-icon'>
                              <div className={expandedGroups[item.id]?.[5] ? 'timeline__icon-up' : 'timeline__icon-down'}>
                              </div>
                            </div>                          </li>
                            <div className={expandedGroups[item.id]?.[5] ? 'timeline__section-content open' : 'timeline__section-content closed'}>
                            <ul>
                              {item.changes.filter(el => el.type === 5).map((el, index) => (
                                <li key={`error-${index}`} className='timeline__change-item'>
                                  <div className='timeline__change'>
                                    <div className='timeline__change-title'>{el.title}</div>
                                    <div className='timeline__change-text'>{el.description}</div>
                                  </div>
                                  {el.detailed && (
                                    <>
                                      <button onClick={() => toggleDetails(index)}>
                                        {expandedDetails[index] ? 'Скрыть детали' : 'Ещё'}
                                      </button>
                                      <div
                                        className={`timeline__change-detailed ${expandedDetails[index] ? 'visible' : 'hidden'}`}
                                        dangerouslySetInnerHTML={{ __html: el.detailed }}
                                      />
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      {item.changes.filter(el => el.type === 6).length > 0 && (
                        <>
                          <li
                            className='timeline__section-title timeline__section-title-docs'
                            onClick={() => toggleGroup(item.id, 6)}
                          >
                            Изменения в документации
                            <div className='timeline__wrapper-icon'>
                              <div className={expandedGroups[item.id]?.[6] ? 'timeline__icon-up' : 'timeline__icon-down'}>
                              </div>
                            </div>                          </li>
                            <div className={expandedGroups[item.id]?.[6] ? 'timeline__section-content open' : 'timeline__section-content closed'}>
                            <ul>
                              {item.changes.filter(el => el.type === 6).map((el, index) => (
                                <li key={`error-${index}`} className='timeline__change-item'>
                                  <div className='timeline__change'>
                                    <div className='timeline__change-title'>{el.title}</div>
                                    <div className='timeline__change-text'>{el.description}</div>
                                  </div>
                                  {el.detailed && (
                                    <>
                                      <button onClick={() => toggleDetails(index)}>
                                        {expandedDetails[index] ? 'Скрыть детали' : 'Ещё'}
                                      </button>
                                      <div
                                        className={`timeline__change-detailed ${expandedDetails[index] ? 'visible' : 'hidden'}`}
                                        dangerouslySetInnerHTML={{ __html: el.detailed }}
                                      />
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        {data.length > 0 && !showButton && (
          (activeFilters.length > 0 && filteredData.length > 0) || // Когда есть активные фильтры и отфильтрованные данные
          (activeFilters.length === 0) // Или когда нет активных фильтров
        ) && (
            <div className='timeline__end'></div>
          )}
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
      {!showButton && (data.length === 0 || filteredData.length === 0) && (
        <div className='message-container'>Не найдено.</div>
      )}
    </div >
  );
}
export default App;

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './App.css'
import { TimelineIcon } from './Icon';

type Item = {
  id: number,
  productId: number,
  fileVersion: string,
  changes: {
    title: string,
    description: string,
    fileVersion: string,
    type: number
  }[],
  metadata: {
    publishDate: string
  }
}
const INITIAL_LIMIT = 100;

function App() {
  const [offset, setOffset] = useState(0);
  const [showButton, setShowButton] = useState(true);
  const [totalItem, setTotalItem] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [data, setData] = useState<Item[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [allData, setAllData] = useState<Item[]>([]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const products = [
    '5.5',
    '6.1',
    'Документация',
    'Платформа',
    'Web-клиент',
    'Управление документами',
    'Конструктор согласований',
    'Базовые объекты',
    'Windows-клиент',
    'Служба фоновых операций',
    'Консоль управления',
    'Модуль интеграции с операторами ЭДО',
    'Делопроизводство',
    'Управление процессами',
    'Менеджер решений',
    'Модуль интеграции с реестром МЧД',
    'Модуль интеграции с УЦ Контур',
    'Управление архивом',
    'Сервис конвертации файлов'
  ];

  const productFilterMap: { [key: string]: number[] } = {
    'Документация': [99],
    'Платформа': [1, 14],
    'Web-клиент': [7, 16],
    'Управление документами': [4, 12],
    'Конструктор согласований': [5, 10],
    'Базовые объекты': [3, 11],
    'Windows-клиент': [2, 17],
    'Служба фоновых операций': [6, 18],
    'Консоль управления': [8, 13],
    'Модуль интеграции с операторами ЭДО': [9, 20, 21],
    'Делопроизводство': [15],
    'Управление процессами': [19, 26],
    'Менеджер решений': [22, 25],
    'Модуль интеграции с реестром МЧД': [23, 28],
    'Модуль интеграции с УЦ Контур': [24, 32],
    'Управление архивом': [27, 30, 33],
    'Сервис конвертации файлов': [29, 31],
    '5.5': [1, 2, 3, 4, 5, 6, 7, 8, 9, 20, 23, 24, 25, 26, 27, 31, 33],
    '6.1': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 28, 29, 30, 32],
  };

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
    'Делопроизводство': 'icon-nav-component-takeoffice',
    'Управление процессами': 'icon-nav-component-workflow',
    'Менеджер решений': 'icon-nav-component-solutionmngr',
    'Модуль интеграции с реестром МЧД': 'icon-nav-component',
    'Модуль интеграции с УЦ Контур': 'icon-nav-component',
    'Управление архивом': 'icon-nav-component-archivemgmt',
    'Сервис конвертации файлов': 'icon-nav-component',
  };

  const titles: { [key: number]: string } = {
    1: 'Платформа',
    2: 'Windows-клиент',
    3: 'Базовые объекты',
    4: 'Управление документами',
    5: 'Конструктор согласований',
    6: 'Служба фоновых операций',
    7: 'Web-клиент',
    8: 'Консоль управления',
    9: 'Модуль интеграции с операторами ЭДО',
    10: 'Конструктор согласований',
    11: 'Базовые объекты',
    12: 'Управление документами',
    13: 'Консоль управления',
    14: 'Платформа',
    15: 'Делопроизводство',
    16: 'Web-клиент',
    17: 'Windows-клиент',
    18: 'Служба фоновых операций',
    19: 'Управление процессами',
    20: 'Модуль интеграции с операторами ЭДО',
    21: 'Модуль интеграции с операторами ЭДО',
    22: "Менеджер решений",
    23: "Модуль интеграции с реестром МЧД",
    24: "Модуль интеграции с УЦ Контур",
    25: "Менеджер решений",
    26: "Управление процессами",
    27: "Управление архивом",
    28: "Модуль интеграции с реестром МЧД",
    29: "Сервис конвертации файлов",
    30: "Управление архивом",
    31: "Сервис конвертации файлов",
    32: "Модуль интеграции с УЦ Контур",
    33: "Управление архивом",
  };
  const getTitle = (id: number) => titles[id];

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
      setActiveFilters([])
    }
  }
  const handleFilterClick = (filter: string) => {
    setActiveFilters(prevFilters => prevFilters.includes(filter)
      ? prevFilters.filter(prevFilter => prevFilter !== filter)
      : [...prevFilters, filter]);
  }

  const filteredData = activeFilters.length
    ? data.filter(item => {
      return activeFilters.some(filter => productFilterMap[filter]?.includes(item.productId));
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

  useEffect(() => {
    getData(INITIAL_LIMIT);
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
            <input placeholder='Поиск по изменениям'
              type="text"
              className='timeline__search-input'
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue} />
          </div>
        </div>
        <ul className="timeline__list">
          {filteredData.map((item: Item) => (
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
                  {`${getTitle(item.productId)} ${item.fileVersion}`}
                </div>
                <div className='timeline__text'>
                  <ul>
                    {item.changes.filter(el => el.type === 1).length > 0 && (
                      <>
                        <li className='timeline__section-title timeline__section-title-error'>Исправленные ошибки</li>
                        {item.changes
                          .filter(el => el.type === 1)
                          .map((el, index) => (
                            <li key={`error-${index}`} className='timeline__change-item'>
                              <div className='timeline__change-title'>{el.title}</div>
                              <div className='timeline__change-text'>{el.description}</div>
                            </li>
                          ))}
                      </>
                    )}

                    {item.changes.filter(el => el.type === 3).length > 0 && (
                      <>
                        <li className='timeline__section-title timeline__section-title-update'>Функциональные изменения</li>
                        {item.changes
                          .filter(el => el.type === 3)
                          .map((el, index) => (
                            <li key={`update-${index}`} className='timeline__change-item'>
                              <div className='timeline__change-title'>{el.title}</div>
                              <div className='timeline__change-text'>{el.description}</div>
                            </li>
                          ))}
                      </>
                    )}

                    {item.changes.filter(el => el.type !== 1 && el.type !== 3).length > 0 && (
                      <>
                        <li className='timeline__section-title timeline__section-title-other'>Изменения API</li>
                        {item.changes
                          .filter(el => el.type !== 1 && el.type !== 3)
                          .map((el, index) => (
                            <li key={`other-${index}`} className='timeline__change-item'>
                              <div className='timeline__change-title'>{el.title}</div>
                              <div className='timeline__change-text'>{el.description}</div>
                            </li>
                          ))}
                      </>
                    )}
                  </ul>
                </div>
              </div>
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
        <div className='message-container'>Изменений не было.</div>
      )}
    </div >
  );
}
export default App;

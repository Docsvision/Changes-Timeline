import { Item } from "@/types/Types";

type SectionProps = {
    name: string;
    type: number;
    item: Item;
    searchValue: string;
    expandedGroups: { [itemId: number]: { [groupType: number]: boolean } };
    expandedDetails: { [itemId: number]: boolean };
    toggleDetails: (index: number) => void;
    toggleGroup: (itemId: number, groupType: number) => void;
    highlightText: (text: string, query: string) => string;
}

function getTypeDescription(type: number): string {
    switch (type) {
        case 1:
            return 'error'; // Исправление
        case 2:
            return 'update'; // Оптимизация
        case 3:
            return 'update'; // Функциональное изменение
        case 4:
            return 'update'; // Изменение в библиотеках элементов управления
        case 5:
            return 'api'; // Изменение в API
        case 6:
            return 'update'; // Изменение в документации
        default:
            return 'update'; // Неизвестный тип
    }
}

function Section(props: SectionProps) {
    const { name, type, item, expandedGroups, expandedDetails,searchValue, toggleDetails, toggleGroup, highlightText } = props
    return (
        <>
            <li
                className={`timeline__section-title timeline__section-title-${getTypeDescription(type)}`}
                onClick={() => toggleGroup(item.id, type)}
            >
                {name}
                <div className='timeline__wrapper-icon'>
                    <div className={expandedGroups[item.id]?.[type] ? 'timeline__icon-up' : 'timeline__icon-down'}>
                    </div>
                </div>                          </li>
            <div className={expandedGroups[item.id]?.[type] ? 'timeline__section-content open' : 'timeline__section-content closed'}>
                <ul className="timeline__section-list">
                    {item.changes.filter(el => el.type === type).map((el, index) => (
                        <li key={`error-${index}`} className='timeline__change-item'>
                            <div className='timeline__change'>
                                <div className='timeline__change-title' dangerouslySetInnerHTML={{ __html: el.title }}></div>
                                <div className='timeline__change-text'>
                                    <div dangerouslySetInnerHTML={{ __html: el.description }}></div>
                                    {el.detailed && (
                                        <>
                                            <button onClick={() => toggleDetails(index)}>
                                                {expandedDetails[index] ? 'СКРЫТЬ' : 'ЕЩЕ'}
                                            </button>
                                            <div
                                                className={`timeline__change-detailed ${expandedDetails[index] ? 'visible' : 'hidden'}`}
                                                dangerouslySetInnerHTML={{ __html: highlightText(el.detailed, searchValue) }}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>)
}

export default Section
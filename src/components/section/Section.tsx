import { BuildChange } from "@/types/Types";

import "./Section.css";

type ISectionProps = {
    name: string;
    type: number;
    changes: BuildChange[];
    buildId: number;
    expandedGroups: { [buildId: number]: { [changeType: number]: boolean } };
    expandedDetails: { [buildId: number]: boolean };
    toggleDetails: (index: number) => void;
    toggleGroup: (buildId: number, changeType: number) => void;
}

function getTypeDescription(type: number): string {
    switch (type) {
        case 1:
            return "error"; // Исправление
        case 2:
            return "update"; // Оптимизация
        case 3:
            return "update"; // Функциональное изменение
        case 4:
            return "update"; // Изменение в библиотеках элементов управления
        case 5:
            return "api"; // Изменение в API
        case 6:
            return "update"; // Изменение в документации
        default:
            return "update"; // Неизвестный тип
    };
};

export function Section(props: ISectionProps) {
    const { name, type, buildId, changes, expandedGroups, expandedDetails, toggleDetails, toggleGroup } = props;
    return (
        <>
            <li className={`timeline__section-title timeline__section-title-${getTypeDescription(type)}`}
                onClick={() => toggleGroup(buildId, type)}>
                {name}
                <div className="timeline__wrapper-icon">
                    <div className={expandedGroups[buildId]?.[type] ? "timeline__icon-up" : "timeline__icon-down"}></div>
                </div>                          
            </li>
            <div className={expandedGroups[buildId]?.[type] ? "timeline__section-content open" : "timeline__section-content closed"}>
                <ul className="timeline__section-list">
                    {changes.map((el, index) => (
                        <li key={`error-${index}`} className="timeline__change-build">
                            <div className="timeline__change">
                                <div className="timeline__change-title" dangerouslySetInnerHTML={{ __html: el.title }}></div>
                                <div className="timeline__change-text">
                                    <div dangerouslySetInnerHTML={{ __html: el.description }}></div>
                                    {el.detailed && (
                                        <>
                                            <button onClick={() => toggleDetails(index)}>
                                                {expandedDetails[index] ? "СКРЫТЬ" : "ЕЩЕ"}
                                            </button>
                                            <div className={`timeline__change-detailed ${expandedDetails[index] ? "visible" : "hidden"}`}
                                                dangerouslySetInnerHTML={{ __html: el.detailed }} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

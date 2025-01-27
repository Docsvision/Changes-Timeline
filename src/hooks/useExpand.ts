import { useRef, useState } from "react";
import { GroupedBuilds } from "@/types/Types";

const EXPANDED_STATE = { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true };
const NOT_EXPANDED_STATE = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };

export function useExpand() {
    const [expandedGroups, setExpandedGroups] = useState<{ [buildId: number]: { [changeType: number]: boolean } }>({});
    const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
    const shouldExpandFirstGroup = useRef<boolean>(false);

    function expandAllForGroupedBuilds(group: GroupedBuilds) {
        group.builds.forEach((build) => {
            // Устанавливаем состояние, чтобы все группы были развернуты
            setExpandedGroups(prevState => ({
              ...prevState,
              [build.id]: { ...EXPANDED_STATE }, // Открываем все группы для данного элемента
            }));
        });
    }

    function toggleExpandAllForBuild(buildId: number) {
        const currentExpandedState = expandedGroups[buildId] || { ...NOT_EXPANDED_STATE };
    
        // Проверяем, если все группы уже развернуты
        const allExpanded = Object.values(currentExpandedState).every(val => val);
    
        // Устанавливаем состояние всех групп в зависимости от их текущего состояния
        const newExpandedGroups = {
            ...expandedGroups,
            [buildId]: Object.keys(currentExpandedState).reduce((acc, key) => {
                acc[Number(key)] = !allExpanded; // Устанавливаем новое состояние для каждой группы
                return acc;
            }, {} as { [changeType: number]: boolean }),
        };
    
        setExpandedGroups(newExpandedGroups);
    };

    // При клике на дату разворачиваем все элементы
    function toggleExpandAllForGroupedBuilds(group: GroupedBuilds) {
        // Проверяем, есть ли хотя бы один элемент, полностью развернутый в группе
        const isAnyExpanded = group.builds.some(build => {
            const itemState = expandedGroups[build.id] || {};
            return Object.values(itemState).some(val => val); // true, если хотя бы одна группа развернута
        });
    
        // Устанавливаем новое состояние в зависимости от того, развернут ли хотя бы один элемент
        const newExpandedState = group.builds.reduce((acc: { [key: number]: { [changeType: number]: boolean } }, item) => {
            acc[item.id] = {
                1: !isAnyExpanded,
                2: !isAnyExpanded,
                3: !isAnyExpanded,
                4: !isAnyExpanded,
                5: !isAnyExpanded,
                6: !isAnyExpanded,
            };
            return acc;
        }, {} as { [key: number]: { [changeType: number]: boolean } });
    
        // Обновляем состояние групп
        setExpandedGroups(prevState => ({
            ...prevState,
            ...newExpandedState,
        }));
    };

    // Функция для переключения состояния группы секций
    function toggleGroup(buildId: number, changeType: number) {
        setExpandedGroups(prev => ({
            ...prev,
            [buildId]: {
                ...prev[buildId],
                [changeType]: !prev[buildId]?.[changeType],
            },
        }));
    };

    function toggleDetails(index: number) {
        setExpandedDetails(prevState => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    return { expandedGroups, expandedDetails, toggleDetails, toggleExpandAllForBuild, 
        toggleExpandAllForGroupedBuilds, toggleGroup, expandAllForGroupedBuilds, shouldExpandFirstGroup };
}
import { useCallback, useEffect, useRef } from "react";
import { Section } from "@/components/section/Section";
import { GroupedBuild } from "@/types/Types";
import { useExpand } from "@/hooks/useExpand";
import { useGroups } from "@/hooks/useGroups";
import { useProducts } from "@/hooks/useProducts";
import { useFilters } from "@/hooks/useFilters";
import { useBuilds } from "@/hooks/useBuilds";
import { getGroupIdFromQuery } from "@/helpers/getGroupIdFromQuery";
import { GroupDate } from "@/components/groupDate/GroupDate";
import { Group } from "@/components/group/Group";
import { Icon } from "@/components/icon/Icon";
import { CHANGE_NAME_BY_TYPE, GROUP_ICON_ID } from "@/helpers/constants";
import { Build } from "@/components/build/Builds";
import { getBuildTitle } from "@/helpers/getBuildTitle";
import { findIconIdByProductId } from "@/helpers/findIconIdByProductId";
import { Search } from "@/components/search/Search";
import { Switch } from "@/components/switch/Switch";
import { Checkbox } from "@/components/checkbox/Checkbox";

import "./App.css";

export function App() {
  const groupId = getGroupIdFromQuery();
  const hasScrolledRef = useRef(false);
  const groups = useGroups();
  const { products, productsMap } = useProducts();
  const {expandAllForGroupedBuilds, expandedDetails, expandedGroups, toggleDetails, toggleExpandAllForBuild, 
    toggleExpandAllForGroupedBuilds, toggleGroup, shouldExpandFirstGroup } = useExpand();
  const { builds, buildsLoadObserver, hasMoreBuilds } = useBuilds(groupId);
  const { filters, groupedBuilds, handleChangeFilter, handleChangeSearch } = useFilters(products, builds, groups, productsMap);

  useEffect(() => {
    shouldExpandFirstGroup.current = true;
  }, [filters]);

  useEffect(() => {
    if (groupedBuilds.length && shouldExpandFirstGroup.current) {
      const firstGroup = groupedBuilds[0];

      expandAllForGroupedBuilds(firstGroup);
      shouldExpandFirstGroup.current = false;
    }
  }, [groupedBuilds, shouldExpandFirstGroup.current]);

  const setObservableElement = useCallback((node: HTMLDivElement | null) => {
    if (node && buildsLoadObserver.current) {
      buildsLoadObserver.current.observe(node);
    }
  }, [buildsLoadObserver.current]);

  const setCheboxContainerHeight = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
      const rect = node.getBoundingClientRect();
      const heightInViewport = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      node.style.height = `${heightInViewport}px`;
  }, []);

  const scrollToGroup = useCallback((currentGroupId: number) => (element: HTMLDivElement) => {
    if (!element || hasScrolledRef.current || !(groupId && +groupId === currentGroupId)) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    hasScrolledRef.current = true;
  }, []);

  return (
    <div className="timeline">
      <h1 className="timeline__header">Изменения в продукте</h1>
      <div className="timeline__container">
        <div className="timeline__box">
          <ul className="timeline__list">
            {groupedBuilds.map((group, index) => (
              <li key={`${group.date}-${index}`} className={"timeline__date-group"}>
                <GroupDate group={group} toggleExpandAllForGroupedBuilds={toggleExpandAllForGroupedBuilds} />
                {!!group.groupId && (
                    <Group icon={<Icon iconId={GROUP_ICON_ID} wide />} groupInfo={group.groupInfo} ref={scrollToGroup(group.groupId)} />
                )}
                <ul className={`timeline__date-items expanded`}>
                  {group.builds.map((build: GroupedBuild) => (
                    <Build key={build.id} buildId={build.id} icon={<Icon iconId={findIconIdByProductId(build.productId, products)} />} 
                      title={getBuildTitle(build.productId, build.fileVersion, products, build.type)} toggleExpandAllForBuild={toggleExpandAllForBuild}>
                      {Object.entries(build.changes).map(([type, changes]) => (
                        <Section key={type} buildId={build.id} changes={changes} name={CHANGE_NAME_BY_TYPE[+type]} type={+type} 
                          toggleDetails={toggleDetails} toggleGroup={toggleGroup} expandedDetails={expandedDetails} expandedGroups={expandedGroups} />
                      ))}
                    </Build>     
                  ))}
                </ul>
              </li>
            ))}
            {!hasMoreBuilds && (builds.length === 0 || groupedBuilds.length === 0) && (
              <div className="message-container">Не найдено.</div>
            )}
          </ul>
          {builds.length > 0 && hasMoreBuilds && !filters.search?.value && (
            <div className="timeline__end" ref={setObservableElement}></div>
          )}
        </div>
        <div className="timeline__sidebar">
          {!!Object.keys(filters).length && (
            <div className="timeline__filters">
              <Search label={filters.search.displayName} name={filters.search.name} onSearchChange={handleChangeSearch} />
              <div className="timeline__switch-container">
                {filters.exclusive.map(filter => (
                  <Switch id={filter.name} key={filter.id} checked={filter.value} label={filter.displayName} 
                    name={filter.name} onChange={handleChangeFilter(filter.type)} />
                ))}
              </div>
              <div className="timeline__checkbox-container" ref={setCheboxContainerHeight}>
                {filters.versions.shouldRender && filters.versions.filters.map(filter => (
                  <Checkbox key={filter.id} id={filter.name} name={filter.name} checked={filter.value} 
                    label={filter.displayName} onChange={handleChangeFilter(filter.type)} />
                ))}
                {filters.products.map(filter => (
                  <Checkbox key={filter.id} id={filter.name} name={filter.name} checked={filter.value} 
                    label={filter.displayName} onChange={handleChangeFilter(filter.type)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

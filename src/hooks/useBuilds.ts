import { Dispatch, useEffect, useRef, useState } from "react";
import { Build } from "@/types/Types";
import { fetchBuilds } from "@/helpers/api";
import { INITIAL_LIMIT } from "@/helpers/constants";

export function useBuilds(groupId: number | null) {
    const [builds, setBuilds] = useState<Build[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMoreBuilds, setHasMoreBuilds] = useState(true);

    const lazyLoadObserver = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (!groupId) {
            getBuilds(offset, setBuilds, setOffset, setHasMoreBuilds);
            return;
        }

        getBuildsByGroupId(groupId, setBuilds, setOffset, setHasMoreBuilds);
    }, []);

    useEffect(() => {
        if (!builds.length || !offset) return;

        lazyLoadObserver.current = new IntersectionObserver((entries, observer) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                getBuilds(offset, setBuilds, setOffset, setHasMoreBuilds);
                observer.disconnect();
            }
        });

        return () => lazyLoadObserver.current?.disconnect();
    }, [offset]);

    return { builds, hasMoreBuilds, buildsLoadObserver: lazyLoadObserver };
};

export async function getBuilds(offset: number, setBuilds: Dispatch<React.SetStateAction<Build[]>>, 
    setOffset: Dispatch<React.SetStateAction<number>>, setHasMore: Dispatch<React.SetStateAction<boolean>>) {
    try {
        const builds = await fetchBuilds(offset, INITIAL_LIMIT);
        setBuilds(prev => [...prev, ...builds]);
        setOffset(prev => prev + INITIAL_LIMIT);
        builds.length < INITIAL_LIMIT ? setHasMore(false) : setHasMore(true);
    } catch(error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }

        console.error("Ошибка получения данных с сервера", error);
    }
};

export async function getBuildsByGroupId(groupId: number, setBuilds: Dispatch<React.SetStateAction<Build[]>>, 
    setOffset: Dispatch<React.SetStateAction<number>>, setHasMore: Dispatch<React.SetStateAction<boolean>>) {
    let offset = 0;
    let isGroupInBuilds = false;
    let hasMoreData = true;
    const resultBuilds: Build[] = [];

    try {
      while (!isGroupInBuilds && hasMoreData) {
        const builds: Build[] = await fetchBuilds(offset, INITIAL_LIMIT);
        
        isGroupInBuilds = builds.some(build => build.groupId === groupId);
        hasMoreData = builds.length === INITIAL_LIMIT;
        
        offset += INITIAL_LIMIT;
        resultBuilds.push(...builds);
      }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }

        console.error("Ошибка получения данных с сервера", error);
    }

    setBuilds(resultBuilds);
    setOffset(offset);
    setHasMore(hasMoreData);
};
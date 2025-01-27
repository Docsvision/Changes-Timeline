import { Dispatch, useEffect, useState } from "react";
import { Group } from "@/types/Types";
import { fetchGroups } from "@/helpers/api";


export function useGroups() {
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        getGroups(setGroups);
    }, [])

    return groups;
};

export async function getGroups(set: Dispatch<React.SetStateAction<Group[]>>) {
    try {
        const groups = await fetchGroups();
        set(groups);
    } catch(error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
};
import { format } from "date-fns";
import { Build, Group, GroupedBuild, GroupedBuilds, MappedBuildChanges } from "@/types/Types";

export function groupBuildsByDate(builds: Build[], groups: Group[]): GroupedBuilds[] {
    // Сначала сортируем данные по дате
    const sortedBuilds = builds.sort((a, b) => new Date(b.metadata.publishDate).getTime() - new Date(a.metadata.publishDate).getTime());

    // Группируем данные по дате, создавая массив объектов
    const groupedBuilds: GroupedBuilds[] = [];

    sortedBuilds.forEach((build) => {
        const buildGroup = !!build.groupId && groups.find(group => group.id === build.groupId);

        const publishDate = buildGroup && buildGroup.publishDate
            ? format(new Date(buildGroup.publishDate), "yyyy-MM-dd")
            : format(new Date(build.metadata.publishDate), "yyyy-MM-dd");

        const existingGroup = groupedBuilds.find((group) => group.date === publishDate);

        const buildChanges = build.changes.reduce<MappedBuildChanges>((acc, change) => {
            if (!acc[change.type]) acc[change.type] = [];
            acc[change.type].push(change);

            return acc;
        }, {})

        const groupedBuild: GroupedBuild = { ...build, changes: buildChanges } 

        if (existingGroup && existingGroup.groupId === build.groupId) {
            existingGroup.builds.push(groupedBuild);
        } else {
            const groupInfo = groups.find(group => group.id === build.groupId);
            groupedBuilds.push({ date: publishDate, builds: [groupedBuild], groupId: build.groupId, groupInfo });
        }
    });

    return groupedBuilds;
};
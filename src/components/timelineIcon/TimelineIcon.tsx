import { icons } from "@/helpers/icons";

export interface IIconType {
  id: string;
  viewBox: string;
  paths: {}[];
}

const IconComponent = ({ viewBox, paths }: IIconType) => (
  <svg viewBox={viewBox} width="100%" height="100%">
    {paths.map((path, index) => (
      <path key={index} {...path} />
    ))}
  </svg>
);
export const TimelineIcon = ({ iconId }: { iconId: string | undefined }) => {
  const icon = icons.find(icon => icon.id === iconId);

  return (
    <>
      {icon ? <IconComponent {...icon} /> : null}
    </>
  );
};
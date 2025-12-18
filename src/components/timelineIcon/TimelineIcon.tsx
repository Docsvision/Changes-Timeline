import { icons } from "@/helpers/icons";

export interface IIconType {
  id: string;
  viewBox: string;
  paths: {}[];
}

type IconProps = {
  iconId: string | undefined;
} & React.SVGProps<SVGSVGElement>;


export const TimelineIcon = ({ iconId, ...svgProps }: IconProps) => {
  const Svg = icons[iconId ?? ""];

  if (!Svg) return null;

  return (
    <Svg
      width="100%"
      height="100%"
      aria-hidden
      focusable={false}
      {...svgProps}
    />
  );
};
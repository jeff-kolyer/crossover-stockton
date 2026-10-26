export type CrossoverAction = {
  id: string;
  title: string;
  href: string;
  summary: string;
  overviewSummary: string;
  buttonLabel: string;
  image: { src: string; alt: string; width: number; height: number };
  status: { value: string; label: string }[];
  active: boolean;
};

export const dogStreetActionId = "look-for-dogs-on-the-street";

export const crossoverActions: CrossoverAction[] = [
  {
    id: dogStreetActionId,
    title: "Look for dogs on the street",
    href: "/action/look-for-dogs-on-the-street/",
    summary: "Help us verify reports of roaming dogs in Stockton and document what we find.",
    overviewSummary: "Explore reported areas, look for roaming dogs, and document what you find.",
    buttonLabel: "Look for dogs",
    image: {
      src: "/images/action/dog-on-street.jpg",
      alt: "Dog sitting beside a Stockton street at sunset",
      width: 836,
      height: 471,
    },
    status: [
      { value: "0", label: "Field visits" },
      { value: "0", label: "Dogs spotted" },
      { value: "Not yet", label: "Reporting tested" },
    ],
    active: true,
  },
];

export const activeCrossoverActions = crossoverActions.filter((action) => action.active);

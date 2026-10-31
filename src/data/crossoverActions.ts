export type CrossoverAction = {
  id: string;
  title: string;
  href: string;
  summary: string;
  buttonLabel: string;
  image: { src: string; alt: string; width: number; height: number };
  status: { value: string; label: string }[];
  active: boolean;
};

export const dogStreetActionId = "look-for-dogs-on-the-street";

export const crossoverActions: CrossoverAction[] = [
  {
    id: dogStreetActionId,
    title: "Verifying reported conditions",
    href: "/work/dogs/",
    summary: "We're visiting areas identified in public reports to observe and document conditions firsthand.",
    buttonLabel: "Explore our fieldwork",
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
  {
    id: "requesting-records",
    title: "Requesting records",
    href: "/work/dogs/",
    summary: "We're requesting public records to better understand reported problems and how existing services respond.",
    buttonLabel: "Explore our records requests",
    image: {
      src: "/images/action/records-request.jpg",
      alt: "Person reviewing a public records request on a laptop",
      width: 836,
      height: 471,
    },
    status: [
      { value: "1", label: "Records requested" },
      { value: "0", label: "Records received" },
      { value: "1", label: "Requests pending" },
    ],
    active: true,
  },
  {
    id: "testing-pathways",
    title: "Testing pathways",
    href: "/work/dogs/",
    summary: "We're testing existing routes to contribute to understand what works, what gets in the way, and what could be improved.",
    buttonLabel: "Explore our pathway tests",
    image: {
      src: "/images/action/testing-pathways.jpg",
      alt: "Person entering an animal care facility",
      width: 836,
      height: 471,
    },
    status: [
      { value: "2", label: "Pathways initiated" },
      { value: "2", label: "Awaiting responses" },
      { value: "0", label: "Pathways tested" },
    ],
    active: true,
  },
];

export const activeCrossoverActions = crossoverActions.filter((action) => action.active);

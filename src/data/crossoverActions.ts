import dogsInvestigationsData from "./dogs-investigations.json";
import recordsData from "./records.json";
import type { EvidenceRecord } from "../types";

// The investigation names the request record; its outcome tracks whether it is still pending.
const recordsRequestId = (dogsInvestigationsData as {
  active_investigations: Array<{ id: string; records_request?: { activity_record_id: string } }>;
}).active_investigations.find((investigation) => investigation.id === "street-dog-immediate-welfare")?.records_request?.activity_record_id;
const recordsRequest = (recordsData as EvidenceRecord[]).find((record) => record.id === recordsRequestId && record.record_type === "activity");
const recordsRequestPending = recordsRequest?.outcome?.status === "awaiting_response" ? "1"
  : recordsRequest?.outcome?.status === "received" || recordsRequest?.outcome?.status === "closed" ? "0"
  : "Unknown";

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

export const dogStreetActionId = "verifying-reported-conditions";

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
    // Manual as of October 30: the location-check plan is still planned, and no street-condition
    // observation, dog-sighting result, or reporting test is recorded. The shelter visit is separate.
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
    // Receipt is manual: the request outcome says no records arrived, but has no receipt count.
    status: [
      { value: recordsRequest ? "1" : "Unknown", label: "Records requested" },
      { value: "0", label: "Records received" },
      { value: recordsRequestPending, label: "Requests pending" },
    ],
    active: true,
  },
  {
    id: "testing-pathways",
    title: "Testing pathways",
    href: "/work/dogs/",
    summary: "We're investigating existing ways to contribute to animal care, documenting what happens when we try to get involved and whether those opportunities lead to meaningful action.",
    buttonLabel: "Explore our pathway tests",
    image: {
      src: "/images/action/testing-pathways.jpg",
      alt: "Person entering an animal care facility",
      width: 836,
      height: 471,
    },
    // Manual as of October 30: one Stockton Street Dogs application and the Animal Services
    // inquiry/application represent two pathways. Three Activity records have no pathway grouping
    // or completed-test outcome, so neither count can be calculated safely from record totals.
    status: [
      { value: "2", label: "Pathways initiated" },
      { value: "2", label: "Awaiting responses" },
      { value: "0", label: "Pathways tested" },
    ],
    active: true,
  },
];

export const activeCrossoverActions = crossoverActions.filter((action) => action.active);

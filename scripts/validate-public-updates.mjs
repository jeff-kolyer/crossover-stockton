import { readFile } from "node:fs/promises";

const receiptId = "crossover-2026-11-02-sas-field-call-records-received";
const updates = await readFile("dist/updates/index.html", "utf8");
const activity = await readFile("dist/work/dogs/activity/index.html", "utf8");
if (!updates.includes("Received Stockton Animal Services field-call records")
  || !updates.includes("Nov 2, 2026")
  || !updates.includes("The City responded to our October 20 public records request. Review and analysis are pending.")
  || !updates.includes(`/work/dogs/activity/#${receiptId}`)
  || !updates.includes("Crossover activity")) throw new Error("The public Updates page is missing the receipt or its Activity link");
if (!activity.includes(`id="${receiptId}"`)) throw new Error("The receipt is missing from the Activity view");
if (updates.includes("Requested Stockton Animal Services field-call records")) throw new Error("An ordinary internal activity entered the public Updates feed");
console.log("Verified receipt in Updates and Activity with one shared record ID; ordinary activities remain excluded.");

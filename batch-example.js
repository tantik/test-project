import { businessTypes } from "./config/business-types.js";
import { runSalesPipeline } from "./pipeline/run-sales-pipeline.js";
import { generateSalesMessages } from "./agents/sales-manager.js";
import { polishSalesMessage } from "./agents/message-polisher.js";

const leads = [
  {
    id: "lead_001",
    source: "instagram",
    channel: "instagram_dm",
    businessName: "Nail Salon Sakura",
    niche: "nail",
    city: "Tokyo",
    instagramHandle: "@nailsakura",
    instagramUrl: "https://instagram.com/example_salon",
    instagramBio: "丁寧なネイルケアと季節のデザイン。ご予約はDMまたはLINEから。",
    websiteUrl: "",
    lineUrl: "",
    notes: "Beautiful nail portfolio. Reservation entry seems to include DM and LINE.",
    rawText: "Instagram salon with DM and LINE booking."
  },
  {
    id: "lead_002",
    source: "instagram",
    channel: "instagram_dm",
    businessName: "Lash Atelier Miu",
    niche: "eyelash",
    city: "Osaka",
    instagramHandle: "@lashmiu",
    instagramUrl: "https://instagram.com/example_lash",
    instagramBio: "まつげパーマ・フラットラッシュ。ご予約はDMより承ります。",
    websiteUrl: "",
    lineUrl: "",
    notes: "No clear website. DM booking visible.",
    rawText: "Instagram profile mentions DM booking only."
  }
];

async function main() {
  const results = [];

  for (const rawLead of leads) {
    const result = await runSalesPipeline({
      rawLead,
      businessTypes,
      generateMessages: generateSalesMessages,
      polishMessage: polishSalesMessage
    });

    results.push({
      id: result.id,
      businessName: result.businessName,
      totalScore: result.scoring?.totalScore,
      bestMessage: result.selectedMessage?.text,
      polishedMessage: result.polishedMessage
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

main();

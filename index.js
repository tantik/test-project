import { businessTypes } from "./config/business-types.js";
import { runSalesPipeline } from "./pipeline/run-sales-pipeline.js";
import { generateSalesMessages } from "./agents/sales-manager.js";
import { polishSalesMessage } from "./agents/message-polisher.js";

const rawLead = {
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
  rawText: `
Instagram:
https://instagram.com/example_salon

Описание:
- небольшой nail salon
- в bio есть LINE予約
- полноценной внешней онлайн-системы записи не видно
- посты с красивым дизайном
- не сеть
`
};

async function main() {
  try {
    const result = await runSalesPipeline({
      rawLead,
      businessTypes,
      generateMessages: generateSalesMessages,
      polishMessage: polishSalesMessage
    });

    console.log("=== PIPELINE RESULT ===");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n=== BEST MESSAGE ===");
    console.log(result.selectedMessage?.text || "No selected message");

    console.log("\n=== POLISHED MESSAGE ===");
    console.log(result.polishedMessage || "No polished message");
  } catch (error) {
    console.error("Pipeline error:", error);
  }
}

main();

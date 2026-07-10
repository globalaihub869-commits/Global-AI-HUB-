import { randomUUID } from "crypto";
import { debitWallet, getUserById } from "./users.js";

export type ListingCategory = "Models" | "Agents" | "APIs" | "Templates";
export type ListingSubcategory = "Chatbots" | "Automation" | "General";

export interface Listing {
  id: string;
  name: string;
  vendor: string;
  category: ListingCategory;
  subcategory: ListingSubcategory;
  priceUsd: number;
  rating: number;
  salesCount: number;
  description: string;
  tags: string[];
  accentColor: string;
}

export interface MarketplaceActivityEvent {
  id: string;
  buyerName: string;
  listingName: string;
  amountUsd: number;
  createdAt: string;
}

const ACCENTS = [
  "rgba(168,85,247,0.6)",
  "rgba(34,211,238,0.6)",
  "rgba(236,72,153,0.6)",
  "rgba(34,197,94,0.6)",
  "rgba(250,204,21,0.6)",
];

const listings: Listing[] = [
  { id: "gpt-vendor-1", name: "NimbusChat Pro Assistant", vendor: "Nimbus AI", category: "Agents", subcategory: "Chatbots", priceUsd: 29, rating: 4.8, salesCount: 1240, description: "A production-ready customer support chatbot agent with built-in escalation logic and CRM sync.", tags: ["Support", "24/7", "CRM"], accentColor: ACCENTS[0]! },
  { id: "tiktok-prompt-pack", name: "TikTok Viral Prompt Pack", vendor: "Verbatim Labs", category: "Templates", subcategory: "General", priceUsd: 12, rating: 4.6, salesCount: 3894, description: "200 high-converting TikTok script prompts optimized for short-form video hooks.", tags: ["Prompts", "Social", "Video"], accentColor: ACCENTS[1]! },
  { id: "auto-invoice-agent", name: "AutoInvoice Ops Agent", vendor: "Formless", category: "Agents", subcategory: "Automation", priceUsd: 49, rating: 4.7, salesCount: 682, description: "Automates invoice generation, reminders, and reconciliation across your finance stack.", tags: ["Finance", "Automation", "Ops"], accentColor: ACCENTS[2]! },
  { id: "vision-api-basic", name: "VisionParse API", vendor: "Pulse Analytics", category: "APIs", subcategory: "General", priceUsd: 19, rating: 4.5, salesCount: 954, description: "Drop-in REST API for document and receipt parsing with 99.2% field accuracy.", tags: ["OCR", "API", "Documents"], accentColor: ACCENTS[3]! },
  { id: "llm-finetune-model", name: "Echofy Voice-LLM v3", vendor: "Echofy", category: "Models", subcategory: "General", priceUsd: 89, rating: 4.9, salesCount: 311, description: "Fine-tuned multimodal voice+text model, optimized for real-time conversational latency.", tags: ["LLM", "Voice", "Realtime"], accentColor: ACCENTS[4]! },
  { id: "social-dm-agent", name: "Social DM Closer Agent", vendor: "Launchpad AI", category: "Agents", subcategory: "Chatbots", priceUsd: 24, rating: 4.4, salesCount: 1587, description: "Auto-replies and qualifies leads from Instagram & WhatsApp DMs around the clock.", tags: ["Sales", "DMs", "Leads"], accentColor: ACCENTS[0]! },
  { id: "sop-template-bundle", name: "SOP & Onboarding Template Bundle", vendor: "CopyForge", category: "Templates", subcategory: "General", priceUsd: 15, rating: 4.3, salesCount: 2210, description: "Editable SOP, onboarding, and playbook templates pre-loaded with AI writing prompts.", tags: ["SOP", "Docs", "Ops"], accentColor: ACCENTS[1]! },
  { id: "cron-automation-agent", name: "CronFlow Automation Agent", vendor: "Global AI Hub Labs", category: "Agents", subcategory: "Automation", priceUsd: 34, rating: 4.6, salesCount: 498, description: "Schedules and chains multi-step AI workflows with retries, alerts, and logs.", tags: ["Automation", "Workflows", "Scheduling"], accentColor: ACCENTS[2]! },
  { id: "sentiment-api", name: "SentimentPulse API", vendor: "Pulse Analytics", category: "APIs", subcategory: "General", priceUsd: 9, rating: 4.2, salesCount: 1720, description: "Real-time sentiment and emotion scoring API for reviews, tickets, and social mentions.", tags: ["NLP", "API", "Analytics"], accentColor: ACCENTS[3]! },
  { id: "midjourney-prompt-model", name: "Prompt-Tuned Image Model", vendor: "Formless", category: "Models", subcategory: "General", priceUsd: 59, rating: 4.7, salesCount: 275, description: "A style-locked diffusion model checkpoint tuned for consistent brand visuals.", tags: ["Image", "Diffusion", "Branding"], accentColor: ACCENTS[4]! },
  { id: "starter-chat-template", name: "Starter Chatbot Template", vendor: "Global AI Hub Labs", category: "Templates", subcategory: "General", priceUsd: 3, rating: 4.5, salesCount: 4210, description: "A lightweight prompt + flow template to launch a basic support chatbot in minutes.", tags: ["Starter", "Chatbot", "Beginner"], accentColor: ACCENTS[1]! },
  { id: "micro-summarizer-api", name: "MicroSummarize API", vendor: "Pulse Analytics", category: "APIs", subcategory: "General", priceUsd: 4, rating: 4.3, salesCount: 3160, description: "Ultra-cheap text summarization endpoint, perfect for testing before you scale up.", tags: ["NLP", "API", "Budget"], accentColor: ACCENTS[3]! },
];

let idCounter = listings.length;

const ACTIVITY_LIMIT = 40;
const BUYER_NAMES = ["Priya S.", "Marcus T.", "Lena K.", "Devon R.", "Aisha M.", "Tomás G.", "Wei L.", "Sofia N."];

const activity: MarketplaceActivityEvent[] = [
  { id: randomUUID(), buyerName: "Priya S.", listingName: "TikTok Viral Prompt Pack", amountUsd: 12, createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString() },
  { id: randomUUID(), buyerName: "Devon R.", listingName: "NimbusChat Pro Assistant", amountUsd: 29, createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString() },
  { id: randomUUID(), buyerName: "Wei L.", listingName: "SentimentPulse API", amountUsd: 9, createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
];

interface VendorSalePoint {
  label: string;
  amountUsd: number;
}

const vendorSalesHistory: VendorSalePoint[] = [
  { label: "Mon", amountUsd: 120 },
  { label: "Tue", amountUsd: 180 },
  { label: "Wed", amountUsd: 90 },
  { label: "Thu", amountUsd: 240 },
  { label: "Fri", amountUsd: 310 },
  { label: "Sat", amountUsd: 260 },
  { label: "Sun", amountUsd: 340 },
];

let vendorTotalSales = vendorSalesHistory.reduce((sum, p) => sum + p.amountUsd, 0);
let vendorUploadsCount = 6;

export function listListings(params: { category?: string; subcategory?: string; search?: string }): Listing[] {
  let results = listings;
  if (params.category && params.category !== "All") {
    results = results.filter((l) => l.category === params.category);
  }
  if (params.subcategory && params.subcategory !== "All") {
    results = results.filter((l) => l.subcategory === params.subcategory);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.vendor.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return results;
}

export function getListing(id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}

export function listMarketplaceActivity(after?: string): MarketplaceActivityEvent[] {
  if (!after) return activity.slice(-15).reverse();
  const afterTime = new Date(after).getTime();
  return activity.filter((e) => new Date(e.createdAt).getTime() > afterTime).reverse();
}

function recordMarketplaceActivity(buyerName: string, listingName: string, amountUsd: number) {
  const event: MarketplaceActivityEvent = { id: randomUUID(), buyerName, listingName, amountUsd, createdAt: new Date().toISOString() };
  activity.push(event);
  if (activity.length > ACTIVITY_LIMIT) activity.splice(0, activity.length - ACTIVITY_LIMIT);
  return event;
}

export function getVendorDashboardStats() {
  return {
    totalSalesUsd: vendorTotalSales,
    uploadsCount: vendorUploadsCount,
    salesHistory: vendorSalesHistory,
  };
}

export type PurchaseResult =
  | { status: "ok"; listing: Listing; walletBalanceUsd: number }
  | { status: "not_found" }
  | { status: "insufficient_balance"; walletBalanceUsd: number };

export function purchaseListing(userId: string, listingId: string): PurchaseResult {
  const listing = getListing(listingId);
  if (!listing) return { status: "not_found" };

  const user = getUserById(userId);
  if (!user) return { status: "not_found" };

  const updated = debitWallet(userId, listing.priceUsd);
  if (!updated) return { status: "insufficient_balance", walletBalanceUsd: user.walletBalanceUsd };

  listing.salesCount += 1;
  vendorTotalSales += listing.priceUsd;
  recordMarketplaceActivity(user.name, listing.name, listing.priceUsd);

  return { status: "ok", listing, walletBalanceUsd: updated.walletBalanceUsd };
}

export function simulateRandomPurchaseEvent(): MarketplaceActivityEvent {
  const listing = listings[Math.floor(Math.random() * listings.length)]!;
  const buyer = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)]!;
  return recordMarketplaceActivity(buyer, listing.name, listing.priceUsd);
}

export function nextListingId(): string {
  idCounter += 1;
  return `listing-${idCounter}`;
}

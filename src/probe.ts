import { getSiteContent } from "@/lib/site.functions";
type T = Awaited<ReturnType<typeof getSiteContent>>;
const x: T = null as any;
const y: number = x.categories;

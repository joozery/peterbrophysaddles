import { Suspense } from "react";
import { DEFAULT_BUSINESS_NAME } from "@/lib/admin-types";
import { getBrandName } from "@/lib/server/site-settings";

async function BrandNameValue() { return <>{await getBrandName()}</>; }

/** Business name from Admin → Settings, for use inside server-rendered text. */
export function BrandName() {
  return <Suspense fallback={DEFAULT_BUSINESS_NAME}><BrandNameValue /></Suspense>;
}

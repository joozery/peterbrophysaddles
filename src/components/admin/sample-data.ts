// Order/enquiry types, status labels and small formatting helpers for the admin panel.

export type OrderStatus = "pending" | "in-production" | "ready" | "shipped" | "cancelled";
export type AdminOrder = { id: string; customer: string; email: string; location: string; date: string; items: { name: string; quantity: number; price: number }[]; status: OrderStatus; paid: boolean; paymentLinks?: PaymentLink[] };
export type PaymentLink = { id: string; url: string; amount: number; description: string; status: "open" | "paid" | "cancelled"; createdAt: string; createdBy: string; paidAt?: string };

export type EnquiryStatus = "new" | "replied" | "quoted" | "closed";
export type Enquiry = { id: string; name: string; email: string; phone: string; topic: string; discipline: string; message: string; date: string; status: EnquiryStatus; source?: string; productId?: string; productName?: string; orderId?: string };

export const orderStatusLabel: Record<OrderStatus, string> = { pending: "Pending", "in-production": "In production", ready: "Ready", shipped: "Shipped", cancelled: "Cancelled" };
export const enquiryStatusLabel: Record<EnquiryStatus, string> = { new: "New", replied: "Replied", quoted: "Quoted", closed: "Closed" };

export const orderTotal = (order: AdminOrder) => order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const formatDate = (iso: string) => new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso + "T00:00:00"));

export const quoteStatusLabel: Record<"draft" | "sent" | "accepted" | "declined", string> = { draft: "Draft", sent: "Sent", accepted: "Accepted", declined: "Declined" };
export const quoteTone: Record<"draft" | "sent" | "accepted" | "declined", string> = { draft: "closed", sent: "pending", accepted: "paid", declined: "cancelled" };

// Official Bosta status mapping matching backend src/utils/shipping/bostaStatus.ts
export const BOSTA_STATUS_LIST = [
  { code: 100, status: "PendingPickup", orderStatus: "pending" },
  { code: 10, status: "Pickup requested", orderStatus: "processing" },
  { code: 11, status: "Waiting for route", orderStatus: "processing" },
  { code: 20, status: "Route Assigned", orderStatus: "processing" },
  { code: 21, status: "Picked up from business", orderStatus: "processing" },
  { code: 22, status: "Picking up from consignee", orderStatus: "processing" },
  { code: 23, status: "Picked up from consignee", orderStatus: "out_for_delivery" },
  { code: 24, status: "Received at warehouse", orderStatus: "processing" },
  { code: 25, status: "Fulfilled", orderStatus: "processing" },
  { code: 30, status: "In transit", orderStatus: "out_for_delivery" },
  { code: 40, status: "Picking up", orderStatus: "out_for_delivery" },
  { code: 41, status: "Picked up", orderStatus: "out_for_delivery" },
  { code: 45, status: "Delivered", orderStatus: "delivered" },
  { code: 46, status: "Returned to business", orderStatus: "returned" },
  { code: 47, status: "Exception", orderStatus: "failed_to_deliver" },
  { code: 48, status: "Terminated", orderStatus: "canceled" },
  { code: 49, status: "Canceled", orderStatus: "canceled" },
  { code: 101, status: "Lost", orderStatus: "failed_to_deliver" },
  { code: 102, status: "Damaged", orderStatus: "failed_to_deliver" },
  { code: 103, status: "Investigation", orderStatus: "processing" },
  { code: 104, status: "Awaiting your action", orderStatus: "failed_to_deliver" },
  { code: 105, status: "Archived", orderStatus: "canceled" },
];

export const CANCELLED_BOSTA_STATUSES = [
  "Canceled",
  "Cancelled",
  "Terminated",
  "Archived",
];
export const CANCELLED_BOSTA_CODES = [48, 49, 105];

export const RETURNED_BOSTA_STATUSES = ["Returned to business", "Returned"];
export const RETURNED_BOSTA_CODES = [46];

export const isBostaCancelledStatus = (bosta) =>
  CANCELLED_BOSTA_STATUSES.includes(bosta?.status) ||
  CANCELLED_BOSTA_CODES.includes(bosta?.statusCode);

export const isBostaDeliveredStatus = (bosta) =>
  bosta?.status === "Delivered" || bosta?.statusCode === 45;

export const isBostaReturnedStatus = (bosta) =>
  RETURNED_BOSTA_STATUSES.includes(bosta?.status) ||
  RETURNED_BOSTA_CODES.includes(bosta?.statusCode);

export const isBostaTerminalStatus = (bosta) =>
  isBostaCancelledStatus(bosta) ||
  isBostaDeliveredStatus(bosta) ||
  isBostaReturnedStatus(bosta);

const ORDER_STATUS_BADGE_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  out_for_delivery: "bg-purple-50 text-purple-700 border-purple-200/60",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  returned: "bg-orange-50 text-orange-700 border-orange-200/60",
  failed_to_deliver: "bg-rose-50 text-rose-700 border-rose-200/60",
  canceled: "bg-red-50 text-red-700 border-red-200/60",
};

// Map each official Bosta status + legacy aliases to its Systego badge style
export const BOSTA_STATUS_STYLES = {
  ...Object.fromEntries(
    BOSTA_STATUS_LIST.map(({ status, orderStatus }) => [
      status,
      ORDER_STATUS_BADGE_STYLES[orderStatus],
    ]),
  ),
  // Legacy aliases for backwards compatibility with older DB records
  "Out for delivery": ORDER_STATUS_BADGE_STYLES.out_for_delivery,
  Cancelled: ORDER_STATUS_BADGE_STYLES.canceled,
  "Failed to deliver": ORDER_STATUS_BADGE_STYLES.failed_to_deliver,
  Returned: ORDER_STATUS_BADGE_STYLES.returned,
};

// Status filter groups mapping Systego snake_case status -> all matching Bosta statuses
export const BOSTA_STATUS_GROUPS = BOSTA_STATUS_LIST.reduce(
  (acc, { status, orderStatus }) => {
    if (!acc[orderStatus]) acc[orderStatus] = [orderStatus];
    if (!acc[orderStatus].includes(status)) acc[orderStatus].push(status);
    return acc;
  },
  {
    pending: ["pending"],
    processing: ["processing"],
    out_for_delivery: ["out_for_delivery", "Out for delivery"],
    delivered: ["delivered"],
    returned: ["returned", "Returned"],
    failed_to_deliver: ["failed_to_deliver", "Failed to deliver"],
    canceled: ["canceled", "Cancelled"],
  },
);

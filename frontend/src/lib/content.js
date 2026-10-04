import {
  FiBox,
  FiCoffee,
  FiCpu,
  FiFileText,
  FiGrid,
  FiShoppingBag,
} from "react-icons/fi";
import {
  BASE_CHARGE,
  PER_KG_CHARGE,
  SUPPORT_EMAIL,
} from "./constants";

export const SERVICES = [
  {
    category: "Documents",
    icon: FiFileText,
    title: "Documents & Papers",
    text: "Contracts, certificates and important papers delivered safely to the receiver's hand.",
  },
  {
    category: "Electronics",
    icon: FiCpu,
    title: "Electronics",
    text: "Phones, laptops and gadgets handled with extra care from pickup to doorstep.",
  },
  {
    category: "Clothing",
    icon: FiShoppingBag,
    title: "Clothing & Fashion",
    text: "Ideal for online sellers and personal gifts — lightweight, quick and affordable.",
  },
  {
    category: "Food",
    icon: FiCoffee,
    title: "Food & Groceries",
    text: "Send home-made food and groceries to family and friends across the country.",
  },
  {
    category: "Others",
    icon: FiBox,
    title: "General Parcels",
    text: "Anything that doesn't fit the usual boxes — book it as a general parcel.",
  },
  {
    category: null,
    icon: FiGrid,
    title: "Delivery Management",
    text: "Admins can search, filter, update statuses and manage every parcel from one dashboard.",
  },
];

export const STEPS = [
  {
    title: "Create an account",
    text: "Sign up free with your email in less than a minute.",
  },
  {
    title: "Book your parcel",
    text: "Enter parcel and receiver details — the charge is calculated instantly.",
  },
  {
    title: "Get a tracking code",
    text: "Every booking receives a unique TRK code you can share with the receiver.",
  },
  {
    title: "Track until delivered",
    text: "Follow the status from Pending to Delivered, any time, from any device.",
  },
];

export const FAQS = [
  {
    q: "How is the delivery charge calculated?",
    a: `Every parcel has a base charge of ৳${BASE_CHARGE} plus ৳${PER_KG_CHARGE} for each kilogram. For example, a 2 KG parcel costs ৳${BASE_CHARGE + 2 * PER_KG_CHARGE}. You can see the exact amount before you confirm a booking.`,
  },
  {
    q: "How do I track my parcel?",
    a: "Use the tracking code (it looks like TRK-AB12CD34) that you receive after booking. Enter it on the Track Parcel page — no login is needed, so your receiver can track it too.",
  },
  {
    q: "What do the parcel statuses mean?",
    a: "Pending means the booking is received. Picked Up means our courier has collected it. In Transit means it is on the way, and Delivered means it reached the receiver. Cancelled parcels are not delivered.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes — as long as the parcel is still Pending you can cancel it from My Parcels. Once it has been picked up or is in transit it can no longer be cancelled.",
  },
  {
    q: "I forgot my password. What should I do?",
    a: `Use the “Forgot password” link on the login page and enter your registered email. If you still need help, contact us at ${SUPPORT_EMAIL}.`,
  },
];

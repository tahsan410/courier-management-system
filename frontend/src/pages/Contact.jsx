import { useState } from "react";
import toast from "react-hot-toast";
import { FiClock, FiMail, FiMapPin, FiPhone, FiSend } from "react-icons/fi";

import PageHeader from "../components/PageHeader";
import FaqList from "../components/FaqList";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { FAQS } from "../lib/content";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
} from "../lib/constants";

const INFO = [
  {
    icon: FiMail,
    label: "Email us",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
  },
  {
    icon: FiPhone,
    label: "Call us",
    value: SUPPORT_PHONE,
    href: `tel:${SUPPORT_PHONE_HREF}`,
  },
  { icon: FiMapPin, label: "Location", value: "Bangladesh" },
  { icon: FiClock, label: "Online tracking", value: "Available 24/7" },
];

export default function Contact() {
  useDocumentTitle("Contact");

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // The backend has no contact endpoint, so the message is composed in the
  // visitor's own email app (mailto) instead of being silently dropped.
  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = form.subject.trim() || "Support request";
    const body = `${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`;

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    toast.success("Opening your email app…");
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We're here to help"
        subtitle="Questions about a booking, pricing or your account? Send us a message and we'll get back to you."
      />

      <section className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* INFO */}
          <div className="space-y-4">
            {INFO.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <div className="card flex items-center gap-4 p-5 transition hover:border-brand-200">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      {label}
                    </p>
                    <p className="truncate font-semibold text-slate-900">{value}</p>
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} className="block">
                  {content}
                </a>
              ) : (
                <div key={label}>{content}</div>
              );
            })}
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="card space-y-5 p-7 sm:p-8">
            <h2 className="text-xl font-extrabold text-slate-900">Send us a message</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Your name</label>
                <input
                  id="name"
                  name="name"
                  required
                  className="input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="label">Subject</label>
              <input
                id="subject"
                name="subject"
                required
                className="input"
                placeholder="How can we help?"
                value={form.subject}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="message" className="label">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="input resize-y"
                placeholder="Write your message here. Include your tracking code if it's about a parcel."
                value={form.message}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto">
              <FiSend /> Send message
            </button>
            <p className="hint !mt-2">
              This opens your email app with the message ready to send.
            </p>
          </form>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-extrabold text-slate-900">
            Frequently asked questions
          </h2>
          <FaqList items={FAQS} />
        </div>
      </section>
    </>
  );
}

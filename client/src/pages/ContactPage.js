import Layout from "../components/layout";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <div className="container">
        <h2 className="page-title">Contact Us</h2>
        <form className="summary-card contact-form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            className="search-input"
            type="text"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
          />

          <label>Email</label>
          <input
            className="search-input"
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            required
          />

          <label>Phone</label>
          <input
            className="search-input"
            type="tel"
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            required
          />

          <label>Message</label>
          <textarea
            className="search-input"
            value={form.message}
            onChange={(event) => handleChange("message", event.target.value)}
            required
          />

          <button className="primary-btn" type="submit">
            Send Message
          </button>
          {submitted ? (
            <p className="success-text">Thanks. We received your message and will contact you soon.</p>
          ) : null}
        </form>
        <section className="summary-card">
          <p>Email: support@moviebooking.local</p>
          <p>Phone: +91 90000 00000</p>
          <p>Support Hours: Monday to Saturday, 9:00 AM to 10:00 PM</p>
        </section>
      </div>
    </Layout>
  );
}

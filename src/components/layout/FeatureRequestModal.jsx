import React, { useState } from "react";
import Modal from "../ui/Modal";

const FeatureRequestModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create mailto link with pre-filled content
    const subject = encodeURIComponent(`Feature Request: ${title}`);
    const body = encodeURIComponent(
      `Hi,

I'd like to request a new feature for Music Practice Lab:

Feature: ${title}

Details:
${details}

User Info:
Name: ${name}
Email: ${email}

Thanks!`,
    );

    // Replace with your actual email address
    const mailtoLink = `mailto:wormcrackerz@gmail.com?subject=${subject}&body=${body}`;

    // Open default mail app
    window.open(mailtoLink);

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setName("");
      setEmail("");
      setTitle("");
      setDetails("");
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-lg font-semibold">Request a feature</div>
      <form onSubmit={handleSubmit} className="space-y-3 mt-2">
        <div>
          <label className="block text-sm mb-1">Your Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Your Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Feature Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="Short summary of the feature"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Feature Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={4}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="Describe what you'd like to see and how it would help you practice music..."
          />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="text-sm text-green-600 h-5">
            {submitted ? "Opening your email app..." : ""}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Send Email
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default FeatureRequestModal;

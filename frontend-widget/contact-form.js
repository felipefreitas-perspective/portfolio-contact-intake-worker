const DEFAULT_CONFIG = {
  apiUrl: "https://portfolio-contact-intake-api.lipeofreitas.workers.dev",
  siteId: "portfolio"
};

export function mountContactForm(selector, options = {}) {
  const container = typeof selector === "string"
    ? document.querySelector(selector)
    : selector;

  if (!container) {
    throw new Error("Contact form container not found");
  }

  const config = {
    ...DEFAULT_CONFIG,
    ...options
  };

  container.innerHTML = renderForm();

  const form = container.querySelector("[data-contact-form]");
  const status = container.querySelector("[data-contact-status]");
  const submitButton = container.querySelector("button[type='submit']");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(status, "", "");
    submitButton.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch(`${config.apiUrl}/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          siteId: config.siteId,
          name: formData.get("name"),
          email: formData.get("email"),
          inquiryType: formData.get("inquiryType"),
          message: formData.get("message"),
          consent: formData.get("consent") === "on",
          company: formData.get("company"),
          sourcePage: window.location.href
        })
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Unable to send inquiry");
      }

      form.reset();
      setStatus(status, "Thanks. Your inquiry was sent successfully.", "success");
    } catch (error) {
      setStatus(status, error.message || "Unable to send inquiry.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function renderForm() {
  return `
    <form class="ff-contact-form" data-contact-form>
      <label>
        Name
        <input name="name" type="text" autocomplete="name" minlength="2" maxlength="120" required />
      </label>

      <label>
        Email
        <input name="email" type="email" autocomplete="email" maxlength="254" required />
      </label>

      <label>
        Inquiry type
        <select name="inquiryType" required>
          <option value="project">Project inquiry</option>
          <option value="consulting">Consulting</option>
          <option value="collaboration">Collaboration</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Message
        <textarea name="message" minlength="20" maxlength="2000" required></textarea>
      </label>

      <label class="ff-contact-form__honeypot">
        Company
        <input name="company" type="text" tabindex="-1" autocomplete="off" />
      </label>

      <label class="ff-contact-form__consent">
        <input name="consent" type="checkbox" required />
        <span>I agree to be contacted back about this inquiry.</span>
      </label>

      <button type="submit">Send inquiry</button>
      <div class="ff-contact-form__status" data-contact-status role="status" aria-live="polite"></div>
    </form>
  `;
}

function setStatus(element, message, type) {
  element.textContent = message;
  element.classList.toggle("is-error", type === "error");
  element.classList.toggle("is-success", type === "success");
}

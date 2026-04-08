const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((element) => observer.observe(element));

const leadForm = document.getElementById("leadForm");
const formStatus = document.getElementById("formStatus");
const consentCheckbox = leadForm.querySelector('input[name="consent"]');
const consentLabel = consentCheckbox.closest(".consent");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setStatus(message, type) {
  formStatus.textContent = message;
  formStatus.classList.remove("is-success", "is-error");

  if (type) {
    formStatus.classList.add(type === "success" ? "is-success" : "is-error");
  }
}

function normalizePhone(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function setConsentErrorState(isError) {
  consentLabel.classList.toggle("consent--error", isError);
}

consentCheckbox.addEventListener("change", () => {
  if (consentCheckbox.checked) {
    setConsentErrorState(false);
  }
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(leadForm);
  const name = String(formData.get("name") || "").trim();
  const phone = normalizePhone(String(formData.get("phone") || "").trim());
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const message = String(formData.get("message") || "").trim();
  const consentAccepted = formData.get("consent") === "on";

  if (!name || name.length < 2) {
    setStatus("Укажите имя (минимум 2 символа).", "error");
    return;
  }

  if (!phone || phone.replace(/\D/g, "").length < 10) {
    setStatus("Укажите корректный номер телефона.", "error");
    return;
  }

  if (!emailRegex.test(email)) {
    setStatus("Укажите корректный email.", "error");
    return;
  }

  if (!consentAccepted) {
    setConsentErrorState(true);
    setStatus("Необходимо подтвердить согласие с Политикой и обработкой ПДн.", "error");
    return;
  }

  setConsentErrorState(false);

  // Демонстрационная отправка: сохраняем заявку локально.
  const payload = {
    name,
    phone,
    email,
    message,
    createdAt: new Date().toISOString(),
  };

  const leads = JSON.parse(localStorage.getItem("leads") || "[]");
  leads.push(payload);
  localStorage.setItem("leads", JSON.stringify(leads));

  setStatus("Заявка отправлена. Я свяжусь с вами в ближайшее время.", "success");
  leadForm.reset();
});

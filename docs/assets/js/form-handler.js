/*
=============================================================
Project Clarity — Form handler + consultation wizard (plain JS)
=============================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    initConsultationWizard();
    initAjaxForms();
});

function initAjaxForms() {
    const forms = document.querySelectorAll(
        "#consultation-request-form, #contact-form"
    );

    forms.forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (form.id === "consultation-request-form") {
                if (!validateConsultationStep(4)) return;
            }

            if (form.id === "contact-form") {
                if (!validateContactForm(form)) return;
            }

            const status = form.querySelector("#form-status");
            const button = form.querySelector("#submit-btn");
            const wrapper = document.getElementById("form-wrapper");
            const success = document.getElementById("form-success");

            if (button) {
                button.disabled = true;
                button.textContent = "Sending…";
            }
            if (status) status.textContent = "";

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { Accept: "application/json" },
                });

                if (response.ok) {
                    if (wrapper) wrapper.hidden = true;
                    if (success) {
                        success.hidden = false;
                        success.classList.add("is-visible");
                        success.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                    form.reset();
                } else {
                    const data = await response.json().catch(() => ({}));
                    const message =
                        data.errors?.map((e) => e.message).join(", ") ||
                        "Something went wrong. Please try again or email support@jineshsavlani.com.";
                    if (status) status.textContent = message;
                    if (button) {
                        button.disabled = false;
                        button.textContent = form.id === "contact-form"
                            ? "Send Message"
                            : "Submit Consultation Request";
                    }
                }
            } catch (error) {
                if (status) {
                    status.textContent =
                        "Network error. Please try again or email support@jineshsavlani.com.";
                }
                if (button) {
                    button.disabled = false;
                    button.textContent = form.id === "contact-form"
                        ? "Send Message"
                        : "Submit Consultation Request";
                }
            }
        });
    });
}

function validateContactForm(form) {
    const status = form.querySelector("#form-status");
    if (status) status.textContent = "";

    const name = form.querySelector("#full-name");
    const email = form.querySelector("#email");
    const subject = form.querySelector("#subject");
    const message = form.querySelector("#message");
    const privacy = form.querySelector('input[name="agree_privacy"]');

    let ok = true;
    if (!name || !(name.value || "").trim()) ok = false;
    if (!email || !(email.value || "").trim()) ok = false;
    if (email && (email.value || "").trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) ok = false;
    if (!subject || !subject.value) ok = false;
    if (!message || !(message.value || "").trim()) ok = false;
    if (!privacy || !privacy.checked) ok = false;

    if (!ok && status) {
        status.textContent = !privacy || !privacy.checked
            ? "Please accept the Privacy Policy to continue."
            : "Please complete all required fields.";
        status.style.color = "var(--color-error)";
    }
    return ok;
}

function initConsultationWizard() {
    const form = document.getElementById("consultation-request-form");
    if (!form) return;

    let step = 1;
    const total = 4;
    const panels = form.querySelectorAll(".wizard-panel");
    const btnNext = document.getElementById("wizard-next");
    const btnBack = document.getElementById("wizard-back");
    const btnSubmit = document.getElementById("submit-btn");
    const stepCurrent = document.getElementById("step-current");
    const barFill = document.getElementById("wizard-bar-fill");

    function setVisible(el, visible) {
        if (!el) return;
        el.classList.toggle("is-hidden", !visible);
        el.hidden = !visible;
    }

    function showStep(n) {
        step = n;
        panels.forEach((panel) => {
            const s = Number(panel.getAttribute("data-step"));
            const active = s === step;
            panel.hidden = !active;
            panel.classList.toggle("is-active", active);
        });
        if (stepCurrent) stepCurrent.textContent = String(step);
        if (barFill) barFill.style.width = (step / total) * 100 + "%";

        // Back only from step 2+
        setVisible(btnBack, step > 1);
        // Continue on steps 1–3 only
        setVisible(btnNext, step < total);
        // Submit only on last step
        setVisible(btnSubmit, step === total);

        if (step === 4) fillBirthConfirm();

        const status = form.querySelector("#form-status");
        if (status) status.textContent = "";
        const consentErr = document.getElementById("consent-error");
        if (consentErr) {
            consentErr.hidden = true;
            consentErr.textContent = "";
        }

        try {
            form.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (e) { /* ignore */ }
    }

    function formatDisplayDate(iso) {
        if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "—";
        const [y, m, d] = iso.split("-");
        return d + "/" + m + "/" + y;
    }

    function formatDisplayTime(value) {
        if (!value || !/^\d{1,2}:\d{2}/.test(value)) return value || "—";
        const parts = value.split(":");
        let h = parseInt(parts[0], 10);
        const min = parts[1].slice(0, 2);
        if (Number.isNaN(h)) return value;
        const suffix = h >= 12 ? "PM" : "AM";
        h = h % 12;
        if (h === 0) h = 12;
        return h + ":" + min + " " + suffix;
    }

    function fillBirthConfirm() {
        const dob = form.querySelector("#date-of-birth")?.value || "";
        const tob = form.querySelector("#time-of-birth")?.value || "";
        const pob = form.querySelector("#place-of-birth")?.value || "—";
        const elDob = document.getElementById("confirm-dob");
        const elTob = document.getElementById("confirm-tob");
        const elPob = document.getElementById("confirm-pob");
        if (elDob) elDob.textContent = formatDisplayDate(dob);
        if (elTob) elTob.textContent = formatDisplayTime(tob);
        if (elPob) elPob.textContent = pob || "—";
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            if (!validateConsultationStep(step)) return;
            if (step < total) showStep(step + 1);
        });
    }
    if (btnBack) {
        btnBack.addEventListener("click", () => {
            if (step > 1) showStep(step - 1);
        });
    }

    showStep(1);
}

function clearFieldErrors(form) {
    form.querySelectorAll(".field-error").forEach((el) => {
        el.textContent = "";
    });
    form.querySelectorAll(".is-invalid").forEach((el) => {
        el.classList.remove("is-invalid");
    });
}

function setError(form, id, message) {
    const input = form.querySelector("#" + id);
    const err = form.querySelector('.field-error[data-for="' + id + '"]');
    if (input) input.classList.add("is-invalid");
    if (err) err.textContent = message;
}

function validateConsultationStep(step) {
    const form = document.getElementById("consultation-request-form");
    if (!form) return true;
    clearFieldErrors(form);
    const status = form.querySelector("#form-status");
    if (status) status.textContent = "";
    const consentErr = document.getElementById("consent-error");
    if (consentErr) {
        consentErr.hidden = true;
        consentErr.textContent = "";
    }

    let ok = true;

    function requireField(id, label) {
        const el = form.querySelector("#" + id);
        if (!el) return;
        const val = (el.value || "").trim();
        if (!val) {
            setError(form, id, label + " is required.");
            ok = false;
        } else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            setError(form, id, "Please enter a valid email.");
            ok = false;
        }
    }

    if (step === 1) {
        requireField("full-name", "Full name");
        requireField("email", "Email");
        requireField("phone", "Phone / WhatsApp");
    }
    if (step === 2) {
        requireField("date-of-birth", "Date of birth");
        requireField("time-of-birth", "Time of birth");
        requireField("place-of-birth", "Place of birth");
    }
    if (step === 3) {
        requireField("priority", "Priority area");
    }
    if (step === 4) {
        const checks = form.querySelectorAll('.consent-box input[type="checkbox"][required]');
        checks.forEach((c) => {
            if (!c.checked) ok = false;
        });
        if (!ok && consentErr) {
            consentErr.hidden = false;
            consentErr.textContent = "Please confirm birth details and accept the required statements.";
        }
    }

    if (!ok && step < 4) {
        const first = form.querySelector(".is-invalid");
        if (first) first.focus();
    }
    return ok;
}

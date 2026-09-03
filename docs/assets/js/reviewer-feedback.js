document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reviewer-feedback-form");
    if (!form) return;

    const requiredGroups = [
        {
            name: "familiarity_before_reading",
            message: "Please select how familiar you were with Vedic Astrology."
        },
        {
            name: "clarity_and_approachability",
            message: "Please select how clear and approachable the explanations felt."
        }
    ];

    function clearErrors() {
        form.querySelectorAll(".field-error").forEach(error => {
            error.textContent = "";
        });
        form.querySelectorAll(".choice-list").forEach(group => {
            group.removeAttribute("aria-invalid");
        });
    }

    function validateForm() {
        clearErrors();
        let firstInvalid = null;

        requiredGroups.forEach(group => {
            const choices = form.querySelectorAll('input[name="' + group.name + '"]');
            const selected = form.querySelector('input[name="' + group.name + '"]:checked');
            if (!selected) {
                const error = form.querySelector('[data-for="' + group.name + '"]');
                const list = choices[0]?.closest(".choice-list");
                if (error) error.textContent = group.message;
                if (list) list.setAttribute("aria-invalid", "true");
                if (!firstInvalid && choices.length) firstInvalid = choices[0];
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            return false;
        }
        return true;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!validateForm()) return;

        const status = document.getElementById("form-status");
        const button = document.getElementById("submit-btn");
        const wrapper = document.getElementById("form-wrapper");
        const success = document.getElementById("form-success");

        button.disabled = true;
        button.textContent = "Sending…";
        status.textContent = "";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.errors?.map(item => item.message).join(", ") || "Something went wrong. Please try again.");
            }

            form.reset();
            wrapper.hidden = true;
            success.hidden = false;
            success.classList.add("is-visible");
            success.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (error) {
            status.textContent = error.message || "Network error. Please try again.";
            button.disabled = false;
            button.textContent = "Submit Feedback";
        }
    });
});

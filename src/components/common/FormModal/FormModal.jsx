import { useState } from "react";

import Modal from "../Modal/Modal";
import "./FormModal.css";

// Generic create/edit form in a modal, driven by a field list.
//
// fields: [{ name, label, type: "text"|"email"|"number"|"url"|"textarea"|"select"|"checkbox"|"readonly",
//            display (readonly only: text to show instead of the raw value),
//            options: [{ value, label }] or (values) => [...], required, placeholder, hint, full,
//            resets: ["otherField"] — clears dependent fields when this one changes }]
// onSubmit(values) must return a Promise; a rejected Promise shows its message in the form.
function FormModal({ title, fields, initialValues, submitLabel = "Save", onSubmit, onClose }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function setValue(name, value) {
    const resets = fields.find((field) => field.name === name)?.resets ?? [];
    setValues((current) => ({
      ...current,
      ...Object.fromEntries(resets.map((dependent) => [dependent, ""])),
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const missing = fields.find((field) => field.required && !String(values[field.name] ?? "").trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSubmit(values);
    } catch (submitError) {
      setError(submitError.message || "Could not save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="form-modal" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </button>
        </>
      }
    >
      <form id="form-modal" className="form-modal-grid" onSubmit={handleSubmit} noValidate>
        {fields.map((field) => {
          const id = `field-${field.name}`;
          const value = values[field.name] ?? "";
          const options = typeof field.options === "function" ? field.options(values) : field.options;

          if (field.type === "checkbox") {
            return (
              <label key={field.name} className="form-modal-check field-full" htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={value === true}
                  onChange={(event) => setValue(field.name, event.target.checked)}
                />
                {field.label}
              </label>
            );
          }

          return (
            <div key={field.name} className={`field ${field.full || field.type === "textarea" ? "field-full" : ""}`}>
              <label className="field-label" htmlFor={id}>
                {field.label}
                {field.required && <span className="form-modal-required"> *</span>}
              </label>

              {field.type === "readonly" ? (
                <input id={id} className="input" value={field.display ?? value} readOnly disabled />
              ) : field.type === "textarea" ? (
                <textarea
                  id={id}
                  className="input"
                  rows={4}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) => setValue(field.name, event.target.value)}
                ></textarea>
              ) : field.type === "select" ? (
                <select
                  id={id}
                  className="input"
                  value={value}
                  onChange={(event) => setValue(field.name, event.target.value)}
                >
                  {field.placeholder && <option value="">{field.placeholder}</option>}
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  className="input"
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(event) => setValue(field.name, event.target.value)}
                />
              )}

              {field.hint && <span className="field-hint">{field.hint}</span>}
            </div>
          );
        })}

        {error && (
          <p className="form-modal-error field-full" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default FormModal;

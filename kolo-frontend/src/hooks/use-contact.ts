import { useMutation } from "@tanstack/react-query";
import { submitContactForm, type ContactForm } from "../services/contact.service";

export function useContactForm() {
  return useMutation({
    mutationFn: (form: ContactForm) => submitContactForm(form),
  });
}

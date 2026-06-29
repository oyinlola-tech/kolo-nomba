import { apiClient } from "../api/client";

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactForm(form: ContactForm): Promise<void> {
  await apiClient.post("/contact", form);
}

export const EMAIL_SENDER = Symbol("EMAIL_SENDER");

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface EmailSender {
  send(input: SendEmailInput): Promise<void>;
}

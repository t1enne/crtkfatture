import { Icons, Toaster } from "construct-ui";

export interface ToastInterface {
  message: string;
  intent?: string;
  key?: any;
}

export const Toasts = new Toaster();
export const AppToaster = {
  notify({ msg, intent }) {
    Toasts.show({
      message: msg,
      intent,
      timeout: 5000,
      icon: intent == "negative"
        ? Icons.ALERT_CIRCLE
        : intent == "warning"
        ? Icons.ALERT_TRIANGLE
        : Icons.INFO,
    });
  },
};

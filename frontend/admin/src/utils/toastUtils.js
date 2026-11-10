import { toast } from "sonner";

export const showSuccessToast = (message) => {
  toast.success(message, {
    style: {
      background: "#181818",
      color: "#ffffff",
      border: "1px solid rgba(255,255,255,0.1)",
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    style: {
      background: "#181818",
      color: "#ff5e72",
      border: "1px solid rgba(250,45,72,0.3)",
    },
  });
};

export const showInfoToast = (message) => {
  toast.info(message, {
    style: {
      background: "#181818",
      color: "#ffffff",
      border: "1px solid rgba(255,255,255,0.1)",
    },
  });
};


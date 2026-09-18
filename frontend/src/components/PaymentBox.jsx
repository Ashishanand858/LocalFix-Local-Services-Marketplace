import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function PaymentBox({ bookingId, onPaid }) {
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);

    try {
      const orderResponse = await api.post("/payments/create-order", {
        bookingId,
      });

      const { mode, data } = orderResponse.data;

      if (mode === "demo") {
        await api.post("/payments/verify", {
          bookingId,
          demo: true,
        });

        toast.success("Demo payment successful");
        onPaid?.();
        return;
      }

      const loaded = await loadRazorpayScript();

      if (!loaded) {
        toast.error("Unable to load Razorpay");
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "LocalFix",
        description: "Local service booking",
        order_id: data.orderId,

        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              bookingId,
              ...response,
            });

            toast.success("Payment verified");
            onPaid?.();
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },

        modal: {
          ondismiss: () => {
            setBusy(false);
          },
        },

        theme: {
          color: "#0f172a",
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", () => {
        toast.error("Payment failed");
        setBusy(false);
      });

      razorpayInstance.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to initiate payment",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-sm font-bold">Payment</div>

      <p className="mt-1 text-sm text-slate-500">
        Complete your payment securely using Razorpay.
      </p>

      <button className="btn-primary mt-4 w-full" onClick={pay} disabled={busy}>
        {busy ? "Processing..." : "Continue to payment"}
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

export default function PhoneVerification({ phone, onVerified }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [pinId, setPinId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const intervalRef = useRef(null); // holds interval ID

  const sendOtp = async () => {
    if (!phone) return alert("Enter phone number first");
    setLoading(true);

    try {
      const res = await fetch("/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setPinId(data.pinId);
        setResendTimer(60); // start 60s timer

        // clear previous interval if any
        if (intervalRef.current) clearInterval(intervalRef.current);

        // start countdown
        intervalRef.current = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert("Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      alert("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || !pinId) return alert("Enter OTP code");
    setLoading(true);

    try {
      const res = await fetch("/api/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinId, pin: otp }),
      });

      const data = await res.json();
      if (data.verified) {
        setOtpVerified(true);
        onVerified(true);
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={otpVerified ? "success" : "outline"}
          disabled={loading || otpVerified || resendTimer > 0}
          onClick={sendOtp}
        >
          {otpVerified ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : loading ? (
            "Sending..."
          ) : resendTimer > 0 ? (
            `Resend (${resendTimer}s)`
          ) : otpSent ? (
            "Resend"
          ) : (
            "Send OTP"
          )}
        </Button>
      </div>

      {otpSent && !otpVerified && (
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button type="button" onClick={verifyOtp} disabled={loading}>
            {loading ? "Checking..." : "Verify"}
          </Button>
        </div>
      )}

      {otpVerified && (
        <p className="text-green-500 text-sm flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> Phone verified
        </p>
      )}
    </div>
  );
}

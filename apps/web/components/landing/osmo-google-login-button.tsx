"use client";

import { MARKETING_OSMO_COLORS } from "@/lib/marketing-osmo-tokens";
import { useGoogleOAuth } from "@react-oauth/google";
import { useEffect, useRef } from "react";

type OsmoGoogleLoginButtonProps = {
  onSuccess: (credential?: string) => void;
  onError: () => void;
};

type GoogleTokenClient = {
  requestAccessToken: () => void;
};

type GoogleOAuth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: { access_token?: string; error?: string }) => void;
    error_callback?: () => void;
  }) => GoogleTokenClient;
};

function getGoogleOAuth2(): GoogleOAuth2 | undefined {
  const google = (window as Window & {
    google?: { accounts?: { oauth2?: GoogleOAuth2 } };
  }).google;
  return google?.accounts?.oauth2;
}

export function OsmoGoogleLoginButton({
  onSuccess,
  onError,
}: OsmoGoogleLoginButtonProps) {
  const { clientId } = useGoogleOAuth();
  const clientRef = useRef<GoogleTokenClient | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;

    const tryInit = () => {
      const oauth2 = getGoogleOAuth2();
      if (!oauth2 || cancelled) return false;

      clientRef.current = oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: (response) => {
          if (response.error || !response.access_token) {
            onErrorRef.current();
            return;
          }
          onSuccessRef.current(response.access_token);
        },
        error_callback: () => onErrorRef.current(),
      });
      return true;
    };

    if (tryInit()) return;

    const intervalId = window.setInterval(() => {
      if (tryInit()) window.clearInterval(intervalId);
    }, 200);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [clientId]);

  return (
    <button
      type="button"
      onClick={() => {
        const requestToken = () => {
          if (!clientRef.current) return false;
          clientRef.current.requestAccessToken();
          return true;
        };

        if (requestToken()) return;

        const started = Date.now();
        const retryId = window.setInterval(() => {
          if (requestToken() || Date.now() - started > 2500) {
            window.clearInterval(retryId);
            if (!clientRef.current) onError();
          }
        }, 150);
      }}
      className="flex h-12 w-full items-center justify-center rounded-xl text-sm font-medium text-white transition hover:brightness-110"
      style={{ backgroundColor: MARKETING_OSMO_COLORS.ctaButton }}
    >
      Continuar com o Google
    </button>
  );
}

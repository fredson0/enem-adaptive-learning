"use client";

import { MARKETING_OSMO_COLORS } from "@/lib/marketing-osmo-tokens";
import { GoogleLogin } from "@react-oauth/google";

type OsmoGoogleLoginButtonProps = {
  onSuccess: (credential?: string) => void;
  onError: () => void;
};

/** Visual Osmo (roxo) com o clique real no Google Identity. */
export function OsmoGoogleLoginButton({
  onSuccess,
  onError,
}: OsmoGoogleLoginButtonProps) {
  return (
    <div className="group relative h-12 w-full cursor-pointer overflow-hidden rounded-xl">
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-sm font-medium text-white transition-colors group-hover:brightness-110"
        style={{ backgroundColor: MARKETING_OSMO_COLORS.ctaButton }}
      >
        Continuar com o Google
      </div>
      <div className="absolute inset-0 z-20 flex scale-[1.4] items-center justify-center opacity-[0.01]">
        <GoogleLogin
          onSuccess={(response) => onSuccess(response.credential)}
          onError={onError}
          theme="filled_black"
          shape="rectangular"
          size="large"
          text="continue_with"
          width={400}
        />
      </div>
    </div>
  );
}

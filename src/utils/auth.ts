import { AuthNextSignInStep, AuthUserAttributeKey } from "@aws-amplify/auth/dist/esm/types";
import { Amplify } from "aws-amplify";
import { signIn, confirmSignIn } from "aws-amplify/auth";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.COGNITO_USER_POOL_CLIENT_ID || "",
      identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID || "",
      loginWith: {
        phone: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        phone_number: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
});

// Send OTP to the user's phone number
export const sendOTP = async (phoneNumber: string) => {
  try {
    const { nextStep } = await signIn({
      username: phoneNumber,
    });
    return nextStep;
  } catch (error) {
    throw new Error("u didnt enter phone freak");
  }
};

export const confirmOTP = async (
  nextStep: AuthNextSignInStep<AuthUserAttributeKey>,
  code: string
) => {
  try {
    if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE") {
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: code,
      });

      if (isSignedIn) {
        console.log("Signed in successfully");
      }
    }
  } catch (error) {
    throw new Error("Invalid OTP");
  }
};

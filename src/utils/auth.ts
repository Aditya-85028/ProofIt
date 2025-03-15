import { Amplify, Auth } from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

// Send OTP to the user's phone number
export const sendOTP = async (phoneNumber: string) => {
  try {
    const response = await Auth.signIn(phoneNumber);
    return response; // AWS Cognito expects this for multi-step authentication
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Confirm OTP to complete login
export const confirmOTP = async (phoneNumber: string, code: string) => {
  try {
    return await Auth.sendCustomChallengeAnswer(phoneNumber, code);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

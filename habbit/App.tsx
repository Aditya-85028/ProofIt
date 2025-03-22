import React from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react-native";
import outputs from "./amplify_outputs.json";
import Home from "./app/home"; 

Amplify.configure(outputs);

export default function App() {
  return (
    <Authenticator.Provider>
      <Authenticator>
        <Home />
      </Authenticator>
    </Authenticator.Provider>
  );
}

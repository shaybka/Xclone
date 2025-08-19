import { useSSO } from "@clerk/clerk-expo"
import {  useState } from "react"
import { Alert } from "react-native";

export const useSocialAuth =()=>{
    const [isLoading,setIsLoading] = useState(false)
    const{startSSOFlow} =useSSO();

    const handleSocialAuth = async (strategy:"oauth_google"|"oauth_apple") => {
        setIsLoading(true);
       try {
        const {createdSessionId,setActive} = await startSSOFlow({strategy})
         if (createdSessionId) {
        setActive!({ session: createdSessionId })
      }
       } catch (error) {
        console.log("error in social auth",error)
        const provider = strategy === "oauth_google" ? "Google" : "Apple";
        Alert.alert("Error",`Failed to authenticate with ${provider} please try again`);
       }finally{
        setIsLoading(false);
       }
    };

    return { isLoading, handleSocialAuth }
}
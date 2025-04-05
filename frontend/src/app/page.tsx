"use client";

import ConnectButton from "@/components/ConnectButton";
import { DIAPrice } from "@/components/DIAPrice";
import { useAccount, useDisconnect } from "wagmi";
import Markets from "@/components/Markets";
import { useEffect, useState } from "react";
import { getProfileImage, getProfileName } from "@/utils/profileUtils";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [profileName, setProfileName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadProfileData() {
      if (isConnected && address) {
        setIsLoadingProfile(true);
        try {
          const [name, image] = await Promise.all([
            getProfileName(address),
            getProfileImage(address)
          ]);
          
          setProfileName(name);
          setProfileImage(image);
        } catch (error) {
          console.error("Error loading profile data:", error);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setProfileName("");
        setProfileImage("");
      }
    }
    
    if (mounted) {
      loadProfileData();
    }
  }, [address, isConnected, mounted]);

  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[#070E1B]">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-2xl font-bold text-white mb-8">
            Crypto Prediction Markets on LUKSO
          </h1>
          <div className="bg-gray-800 rounded-lg p-6 text-white">
            Loading...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[#070E1B]">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-2xl font-bold text-white mb-8">
        Crypto Prediction Markets on LUKSO
        </h1>
        <div className="bg-gray-800 rounded-lg p-6">
          {isConnected ? (
            <>
              <div className="flex items-center mb-4">
                {isLoadingProfile ? (
                  <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse mr-3"></div>
                ) : profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full mr-3" 
                  />
                ) : null}
                <div>
                  {isLoadingProfile ? (
                    <div className="h-5 w-32 bg-gray-700 animate-pulse mb-1"></div>
                  ) : profileName ? (
                    <p className="text-white font-bold">Welcome {profileName}</p>
                  ) : null}
                  <p className="text-white text-xs">{address}</p>
                </div>
              </div>
              <DIAPrice />
              <Markets />
            </>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </main>
  );
}
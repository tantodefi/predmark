import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';
import createBlockie from 'ethereum-blockies-base64';

// Define LSP3Profile schema for Universal Profiles
const LSP3ProfileSchema: ERC725JSONSchema[] = [
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  }
];

// Configuration for ERC725.js
const config = {
  ipfsGateway: 'https://api.universalprofile.cloud/ipfs/',
};

// Use a more reliable RPC URL for LUKSO
const RPC_URL = 'https://rpc.lukso.sigmacore.io';

// Define a more lenient type for the profile data
interface ProfileData {
  name?: string;
  description?: string;
  profileImage?: Array<{url: string; width?: number; height?: number}>;
  tags?: string[];
  links?: Array<{title: string; url: string}>;
  [key: string]: any;
}

// Function to fetch Universal Profile data
export async function fetchProfileData(address: string): Promise<ProfileData | null> {
  try {
    if (!address) return null;

    console.log(`Fetching profile data for ${address}`);

    // Create ERC725 instance
    const erc725 = new ERC725(
      LSP3ProfileSchema,
      address,
      RPC_URL,
      config
    );

    // Fetch profile data
    console.log('Calling erc725.fetchData...');
    const result = await erc725.fetchData('LSP3Profile');
    console.log('ERC725 result:', result);
    
    // Access the data using string index notation to avoid TypeScript errors
    const profileData = result && typeof result === 'object' ? (result as any)['value'] : null;
    console.log('Extracted profile data:', profileData);
    
    if (!profileData) {
      console.log('No profile data found');
      return null;
    }
    
    try {
      // The data might be a JSON string that needs parsing
      if (typeof profileData === 'string') {
        const parsedData = JSON.parse(profileData);
        console.log('Parsed profile data:', parsedData);
        return parsedData as ProfileData;
      }
      
      // If the result has nested LSP3Profile structure
      if (profileData.LSP3Profile) {
        return profileData.LSP3Profile as ProfileData;
      }
      
      // If the result is directly the profile data
      return profileData as ProfileData;
    } catch (parseError) {
      console.error("Error parsing profile data:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Universal Profile:", error);
    return null;
  }
}

// Generate blockies avatar as fallback
export function generateBlockiesAvatar(address: string): string {
  try {
    return createBlockie(address);
  } catch (error) {
    console.error("Error generating blockies avatar:", error);
    return '';
  }
}

// Helper function to convert IPFS URLs to HTTP URLs
function convertIpfsUrl(url: string): string {
  if (url.startsWith('ipfs://')) {
    const ipfsHash = url.replace('ipfs://', '');
    return `https://api.universalprofile.cloud/ipfs/${ipfsHash}`;
  }
  return url;
}

// Function to get profile image
export async function getProfileImage(address: string): Promise<string> {
  try {
    const profileData = await fetchProfileData(address);
    
    // If profile has an image, use it
    if (profileData?.profileImage?.[0]?.url) {
      const imageUrl = profileData.profileImage[0].url;
      console.log('Original profile image URL:', imageUrl);
      const convertedUrl = convertIpfsUrl(imageUrl);
      console.log('Converted profile image URL:', convertedUrl);
      return convertedUrl;
    }
    
    // Otherwise, generate blockies
    return generateBlockiesAvatar(address);
  } catch (error) {
    console.error("Error getting profile image:", error);
    return generateBlockiesAvatar(address);
  }
}

// Function to get profile name
export async function getProfileName(address: string): Promise<string> {
  try {
    const profileData = await fetchProfileData(address);
    
    // If profile has a name, use it
    if (profileData?.name) {
      return profileData.name;
    }
    
    // Otherwise, return shortened address
    return shortenAddress(address);
  } catch (error) {
    console.error("Error getting profile name:", error);
    return shortenAddress(address);
  }
}

// Helper function to shorten address for display
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
} 
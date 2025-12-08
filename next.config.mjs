/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io", // 👈 This allows UploadThing images to show
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // 👈 This allows the avatars to show
      }
    ],
  },
};

export default nextConfig;
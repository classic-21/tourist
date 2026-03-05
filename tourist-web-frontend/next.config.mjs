/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 's3.ap-south-1.amazonaws.com'], // Allow images from Cloudinary and AWS
    },
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone", // Enables standalone mode to generate the standalone folder
	reactStrictMode: true, // Optional: enables React strict mode (good for development)
	swcMinify: true, // Optional: faster builds using SWC minification
}

export default nextConfig

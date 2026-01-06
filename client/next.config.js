/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Change this to false
    tsconfigPath: './tsconfig.json', // Explicitly point to tsconfig
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'taskin-panjabi-server.onrender.com'],
    unoptimized: true,
  },
};

module.exports = nextConfig;



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   images: {
//     domains: ['localhost', 'taskin-panjabi-server.onrender.com'],
//     unoptimized: true,
//   },
// };

// module.exports = nextConfig;


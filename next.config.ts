/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'api.sejongssg.kr',
        port: '',
        pathname: '/**',
      },
      {                                                                                                                                                                                                                                                                                                          
          protocol: 'https',                                                                                                                                                                                                                                                                                       
          hostname: 'files.sejongssg.kr',                                                                                                                                                                                                                                                                          
        },                                                                                                                                                                                                                                                                                                         
        {                                                                                                                                                                                                                                                                                                          
          protocol: 'http',                                                                                                                                                                                                                                                                                        
          hostname: 'localhost',                                                                                                                                                                                                                                                                                   
          port: '3902',                                                                                                                                                                                                                                                                                            
        },                                                                                                                                                                                                                                                                                                         
        {                                                                                                                                                                                                                                                                                                          
          protocol: 'https',                                                                                                                                                                                                                                                                                       
          hostname: 'avatars.githubusercontent.com', // GitHub OAuth 프로필                                                                                                                                                                                                                                        
        }, 
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;

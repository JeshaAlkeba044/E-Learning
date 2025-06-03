import midtransClient from 'midtrans-client';



// Initialize Snap client
export const snap = new midtransClient.Snap({
  isProduction: false, // Sandbox mode
  serverKey: "SB-Mid-server-qVcM3srtyxTVHk60icrBTdM7",
  clientKey: "SB-Mid-client-Ei9swL70-o4j3tiu"
});

// Initialize Core API client (optional)
export const core = new midtransClient.CoreApi({
  isProduction: false, // Sandbox mode
  serverKey: "SB-Mid-server-qVcM3srtyxTVHk60icrBTdM7",
  clientKey: "SB-Mid-client-Ei9swL70-o4j3tiu"
});
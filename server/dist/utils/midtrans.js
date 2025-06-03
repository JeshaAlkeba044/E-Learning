"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.core = exports.snap = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
// Initialize Snap client
exports.snap = new midtrans_client_1.default.Snap({
    isProduction: false, // Sandbox mode
    serverKey: "SB-Mid-server-qVcM3srtyxTVHk60icrBTdM7",
    clientKey: "SB-Mid-client-Ei9swL70-o4j3tiu"
});
// Initialize Core API client (optional)
exports.core = new midtrans_client_1.default.CoreApi({
    isProduction: false, // Sandbox mode
    serverKey: "SB-Mid-server-qVcM3srtyxTVHk60icrBTdM7",
    clientKey: "SB-Mid-client-Ei9swL70-o4j3tiu"
});

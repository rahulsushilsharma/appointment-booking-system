const LocalUrl = "http://localhost:8000/api";
const ProductionURL =
  "https://appointment-booking-system-kjuw.onrender.com/api";

export const API_URL = import.meta.env.PROD === true ? ProductionURL : LocalUrl;

//   vercel env variable
//   VITE_PROD=true

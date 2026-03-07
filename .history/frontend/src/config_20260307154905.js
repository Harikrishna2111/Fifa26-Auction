const envApiUrl = import.meta.env.VITE_API_URL;
const defaultApiUrl =
	import.meta.env.MODE === "development"
		? "http://localhost:5000"
		: "https://fifa26-auction-vj5i.onrender.com";

export const API_URL = (envApiUrl || defaultApiUrl).replace(/\/$/, "");

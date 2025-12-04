
import { ReviewData } from '../types';

export const api = {
  fetchReviews: async (dbUrl: string): Promise<ReviewData[]> => {
    if (!dbUrl) return [];
    try {
      // Add timestamp to prevent caching
      const cacheBuster = `&_t=${Date.now()}`;
      const response = await fetch(`${dbUrl}?action=read${cacheBuster}`);
      
      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // This usually happens when the script is not deployed as "Anyone"
        // Google returns an HTML login page instead of JSON
        throw new Error("Format de réponse invalide. Vérifiez les permissions du script (Doit être 'Tout le monde').");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },

  saveReview: async (dbUrl: string, review: ReviewData): Promise<boolean> => {
    if (!dbUrl) {
      console.error("Database URL is missing");
      return false;
    }
    try {
      // Using 'no-cors' mode is the most robust way to send data to GAS from client-side
      // It sends an opaque request. We won't get a readable response JSON, 
      // but the request will be sent without CORS preflight issues.
      await fetch(`${dbUrl}?action=save`, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ review }),
      });
      
      // Since we can't read the response in no-cors, we assume success if no network error occurred
      return true;
    } catch (error) {
      console.error("Error saving review:", error);
      throw error;
    }
  },

  deleteReview: async (dbUrl: string, id: string): Promise<boolean> => {
    if (!dbUrl) return false;
    try {
      await fetch(`${dbUrl}?action=delete&id=${id}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({}),
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      return false;
    }
  }
};

import httpx
from typing import Tuple

class SAPCSRFService:
    async def fetch_csrf_token(self, url: str, access_token: str) -> Tuple[str, httpx.Cookies]:
        """
        Fetches the X-CSRF-Token and associated session cookies.
        """
        headers = {
            "Authorization": f"Bearer {access_token}",
            "x-csrf-token": "Fetch"
        }
        
        async with httpx.AsyncClient() as client:
            # We use the base OData URL to fetch the CSRF token
            response = await client.get(url, headers=headers)
            
            if response.status_code not in (200, 204):
                raise Exception(f"Failed to fetch CSRF token: {response.status_code} - {response.text}")
                
            csrf_token = response.headers.get("x-csrf-token")
            if not csrf_token:
                raise Exception("No x-csrf-token found in the SAP response headers.")
                
            return csrf_token, response.cookies

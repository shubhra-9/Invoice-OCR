import time
import httpx
import config

class SAPOAuthService:
    def __init__(self):
        self.token_url = config.SAP_TOKEN_URL
        self.client_id = config.SAP_CLIENT_ID
        self.client_secret = config.SAP_CLIENT_SECRET
        self.scope = config.SAP_SCOPE
        
        self._access_token = None
        self._expires_at = 0

    async def get_access_token(self) -> str:
        """
        Retrieves a valid OAuth token. Uses cached token if available and not expired.
        """
        # Add a 60-second buffer to token expiration
        if self._access_token and time.time() < (self._expires_at - 60):
            return self._access_token

        if not self.token_url or not self.client_id or not self.client_secret:
            raise ValueError("SAP OAuth credentials are not fully configured.")

        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        if self.scope:
            data["scope"] = self.scope

        async with httpx.AsyncClient() as client:
            response = await client.post(self.token_url, data=data)
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch SAP OAuth token: {response.text}")
                
            token_data = response.json()
            self._access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            self._expires_at = time.time() + expires_in
            
            if not self._access_token:
                raise Exception("SAP OAuth token response did not contain an 'access_token'.")
                
            return self._access_token

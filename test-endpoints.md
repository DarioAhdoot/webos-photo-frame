# Testing Immich API Endpoints

Try these curl commands to see which endpoint works for your server:

## Test the newer API endpoint (v1.118.0+):
```bash
curl -H "x-api-key: YOUR_API_KEY" http://diarrhio.mooo.com:2283/api/server/ping
```

## Test if the server responds to basic API requests:
```bash
curl -H "x-api-key: YOUR_API_KEY" http://diarrhio.mooo.com:2283/api/albums
```

## Check what version of Immich you're running:
You can check your Immich version by going to:
- Web interface → Settings → Server Info
- Or check the docker container logs
- Or look at the /api/server-info endpoint (if available)

Replace `YOUR_API_KEY` with your actual API key.
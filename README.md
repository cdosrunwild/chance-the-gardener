# FarmBot 3D Garden

## The Goal of this Project
To create 3D models of a FarmBot system garden on the fly.

## FarmBot API
This project makes API calls to the FarmBot system. 
For more information on API endpoints, checkout: https://hexdocs.pm/farmbot/api-reference.html and https://developer.farm.bot/v14/Documentation/web-app/rest-api

## Generating renders
### First time?
- Need to download & install Node.js at https://nodejs.org/en/download/
- Need to download & install Python at https://www.python.org/downloads/
- Run `npm install` once before moving on.
- This is required to install `child_process`.


### Recurring usage
1. Put your plant photos in `/images`.
2. Run the app with `npm start`.
3. Click on the Process images button.
4. Wait for progress bar to reach 100%.
5. ????
6. Check `/renders` for your output.

## Things to keep in mind
If the bot is scheduled to scan the garden, please insure that the garden is in a relatively stable environment. 
That includes:
- Rain, fog, dust, so have a cover over the garden to prevent anything from making the camera blurry.
- Insure the scanning schedule happens during the night, so the light from the LEDs is constant, without interference from sun rays that cause high contrast spots in images.


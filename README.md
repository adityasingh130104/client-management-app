# Universal Gym Management App

## 🚀 Live Deployment
**Production URL:** https://universalgym.vercel.app  
**Mobile-friendly** - table view, full CRUD/pay/extend/stats.

## Features
- Table display (no cards)
- Add/Edit/Delete clients
- Payment tracking
- Membership extension
- Search & filter (all/expired)
- Live stats dashboard
- Classic vintage gym UI

## Local Development
```
npm install
npm start
```
Open http://localhost:3000

## Deployment Notes
- **Persistent JSON storage**: data/clients.json (survives restarts)
- Local: Data saved automatically after add/pay/extend/edit/delete
- Vercel: Use MongoDB Atlas (uncomment connection) for production
- Static files served correctly

**Task complete!** Use the Vercel link on mobile.

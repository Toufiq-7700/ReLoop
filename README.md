# ♻️ ReLoop — Give Things a Second Life

![ReLoop Demo](readme%20image/image.png)

ReLoop is an AI-powered circular marketplace that connects households, buyers, recyclers, industries, and makers. Users can upload or describe an unwanted item, and Gemini helps identify the item, understand its material and condition, recommend its best next life, generate a listing, and guide the user toward relevant reuse, recycling, upcycling, or marketplace opportunities.

## 🎯 Problem

Many households keep unused products, recyclable materials, and broken items that still have value — but people don't know whether to sell, donate, reuse, repair, recycle, or upcycle them, or who might need them.

## 💡 Solution

ReLoop uses **Google Gemini AI** to analyze items, classify materials, recommend the best next action, generate marketplace listings, and match users with relevant buyers, makers, recyclers, and industries.

## ✨ Features

- **AI Item Analysis** — Upload an image or describe an item; Gemini identifies material, condition, and recommends actions
- **Smart Matching** — AI-powered matching with recyclers, makers, buyers, and industries
- **Marketplace** — Browse reusable items, recyclable materials, and handmade upcycled products
- **Materials Demand Board** — Industries post what recyclable materials they need
- **Makers Directory** — Discover artisans who upcycle waste into products
- **Recyclers Directory** — Find certified recyclers and waste collectors
- **AI Listing Generation** — Gemini generates editable marketplace listings
- **Collection Requests** — Request waste/recyclable material pickup
- **Demo Mode** — Pre-loaded demo items for easy demonstration

## 🏗️ Technology

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Backend**: Node.js serverless function (Vercel-compatible)
- **AI**: Google Gemini 2.0 Flash API
- **Storage**: localStorage (prototype)

## 📁 Architecture

```
/reloop
├── index.html          # Single-page application
├── styles.css          # Design system & styles
├── app.js              # Frontend application logic
├── data.js             # Mock data (listings, makers, recyclers)
├── api/
│   └── gemini.js       # Gemini API serverless endpoint
├── assets/images/      # Image assets
├── .gitignore
└── README.md
```

## 🤖 Gemini AI Usage

Gemini powers the core "What can I do with this?" workflow:
1. **Image/text understanding** — Analyzes uploaded items
2. **Classification** — Identifies category, material, condition
3. **Recommendation** — Suggests sell, donate, reuse, repair, recycle, or upcycle
4. **Matching** — Explains why specific roles (maker, recycler, buyer) are relevant
5. **Listing generation** — Creates marketplace listing text from analysis
6. **Upcycling ideas** — Suggests creative reuse options

## 🚀 Local Setup

### Frontend
Serve `index.html` with any static server:
```bash
# Using Python
python3 -m http.server 5500

# Using Node
npx serve .
```

### Backend
```bash
# Set your Gemini API key
export GEMINI_API_KEY=your_key_here

# Run the API server
node api/gemini.js
```
The API runs on `http://localhost:3000`.

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

**NEVER** commit the API key to the repository.

## 🌐 Deployment

### Frontend (GitHub Pages / Vercel / Netlify)
Static files — deploy `index.html`, `styles.css`, `app.js`, `data.js`.

### Backend (Vercel Serverless)
1. Push to GitHub
2. Connect to Vercel
3. Add `GEMINI_API_KEY` as environment secret
4. The `api/gemini.js` auto-deploys as a serverless function

Update `API_BASE` in `app.js` for your production URL.

## 🎬 Hackathon Demo Flow

1. Open the app → see polished landing page
2. Click **"Analyze My Item"**
3. Click a **demo preset** (e.g., "Plastic Bottles") or type a description
4. Click **"Analyze with Gemini"** → see AI analysis
5. View recommendations, matches, upcycling ideas
6. Click **"Create Listing with AI"** → publish to marketplace
7. Browse **Marketplace**, **Materials**, **Makers**, **Recyclers**
8. Submit a **Collection Request**

## 🔮 Future Improvements

- Real image analysis via Gemini Vision API
- User authentication and profiles
- Real-time messaging between users
- Geolocation-based matching
- Payment integration
- Mobile app
- Community impact tracking with real data

## 📄 License

MIT — Built for MLH Hackathon 2026

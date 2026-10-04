<div align="center">

# 🚚 CourierExpress

### Courier & Logistics Management System

Book parcels, track deliveries with a single code, and manage every shipment from one admin dashboard.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)

[**Live Demo**](https://courier-management-system01.netlify.app) · [**API**](https://courier-management-system-fiss.onrender.com/docs)

</div>

---

## 📖 About

**CourierExpress** is a full-stack web application that connects **customers** and **delivery managers** on a single platform. Customers can book a parcel, see the delivery charge instantly, and follow the parcel until it arrives. Admins get a powerful dashboard to search, filter, update and export every shipment.

> ⚠️ The backend is hosted on Render's free plan, so the **first request may take 30–60 seconds** while the server wakes up.

## ✨ Features

### 👤 Customers
- Sign up / log in with secure JWT authentication
- Book a parcel with a **live delivery charge** (`৳60 base + ৳20 per KG`)
- Receive a unique **tracking code** (e.g. `TRK-AB12CD34`) after booking
- View all personal parcels with stats, status tabs and search
- **Cancel** a booking while it is still *Pending*
- Reset a forgotten password through an **email link**

### 🔎 Public tracking
- Track any parcel with just its code, **no login required**
- Visual progress timeline: `Pending → Picked Up → In Transit → Delivered`
- Shareable tracking links (`/track?code=...`)
- Receiver phone number is partially masked on the public page

### 🛠️ Admin
- Dashboard overview: total, pending, in-transit, delivered and revenue
- Search by title, receiver or tracking code (debounced)
- Filter by category and status, sort by date, price or weight
- Update parcel status directly from the table
- View parcel details, delete parcels (with confirmation)
- **Export** filtered parcels to **CSV**
- Admin accounts can only be created with a **secret signup code**

### 🔐 Security
- Passwords hashed with **bcrypt**
- JWT access tokens (24h) with automatic session-expiry handling on the frontend
- Role-based access control (user / admin) on both API and routes
- Password-reset links are **single-use**, expire in **30 minutes**, and cannot be used as login tokens
- Forgot-password responds identically whether or not the email exists (no account probing)
- Secrets (`SECRET_KEY`, admin code, email API key) are read from **environment variables**

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS v4, React Router, React Hot Toast, React Icons |
| Backend | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Database | SQLite |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Email | Brevo transactional email API |
| Hosting | Netlify (frontend), Render (backend) |

## 📁 Project Structure

```
courier-management-system/
├── backend/
│   ├── main.py            # API routes
│   ├── models.py          # SQLAlchemy models (User, Parcel)
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── auth.py            # JWT, password hashing, reset tokens
│   ├── database.py        # DB engine & session
│   ├── emailer.py         # Brevo email helper
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, Footer, StatusBadge, StatusTimeline, ...
    │   ├── context/       # Auth context
    │   ├── hooks/         # useAuth, useApiError, useCopy, ...
    │   ├── lib/           # api.js, constants.js, content.js
    │   └── pages/         # Home, Services, Pricing, About, Contact, Track,
    │                      # Login, Signup, ForgotPassword, ResetPassword,
    │                      # BookParcel, MyParcels, AdminDashboard, NotFound
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and npm

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/courier-management-system.git
cd courier-management-system
```

### 2. Run the backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Set the environment variables (see [Environment Variables](#-environment-variables)), then start the server.

**Windows (PowerShell):**
```powershell
$env:ADMIN_SIGNUP_CODE="your-admin-code"
uvicorn main:app --reload --port 8000
```

**macOS / Linux:**
```bash
export ADMIN_SIGNUP_CODE="your-admin-code"
uvicorn main:app --reload --port 8000
```

The API runs at `http://127.0.0.1:8000` and interactive docs are at `http://127.0.0.1:8000/docs`.

### 3. Run the frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
VITE_API_URL=http://127.0.0.1:8000
```

Start the dev server:
```bash
npm run dev
```

Open **http://localhost:5173**.

## 🔑 Environment Variables

### Backend
| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | **Yes (production)** | Long random string used to sign JWTs. A weak dev key is used (with a warning) if missing. |
| `ADMIN_SIGNUP_CODE` | **Yes** | Secret code required to register an admin. If unset, admin signup is **disabled**. |
| `FRONTEND_URL` | Yes (production) | Public frontend URL, used in password-reset emails. Defaults to `http://localhost:5173`. |
| `BREVO_API_KEY` | For email | Brevo API key (starts with `xkeysib-`). |
| `MAIL_FROM_EMAIL` | For email | A sender address **verified in Brevo**. |
| `MAIL_FROM_NAME` | Optional | Sender display name. Defaults to `CourierExpress`. |

> 💡 **Local development without Brevo:** if `BREVO_API_KEY` is not set, no email is sent. The password-reset link is printed in the backend terminal instead, so you can test the full flow.

### Frontend
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (no trailing slash). Defaults to the deployed API. |

## 📡 API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/signup` | Public | Register a user (admin requires `admin_code`) |
| `POST` | `/login` | Public | Log in, returns a JWT |
| `POST` | `/forgot-password` | Public | Send a password-reset email |
| `POST` | `/reset-password` | Public | Set a new password using a reset token |
| `GET` | `/parcels/track/{code}` | Public | Track a parcel by tracking code |
| `POST` | `/parcels/book` | User | Book a new parcel |
| `GET` | `/parcels/my` | User | List the current user's parcels |
| `PUT` | `/parcels/cancel/{id}` | User | Cancel a *Pending* parcel |
| `GET` | `/admin/parcels` | Admin | List parcels (search, filter, sort, paginate) |
| `PUT` | `/admin/parcels/{id}/status` | Admin | Update a parcel's status |
| `DELETE` | `/admin/parcels/{id}` | Admin | Delete a parcel |

Full interactive documentation is available at `/docs` (Swagger UI).

## 💰 Pricing Logic

```
Delivery charge = ৳60 (base) + ৳20 × weight in KG
```
Example: a 2 KG parcel costs `60 + 2 × 20 = ৳100`.

## 🌐 Deployment

- **Backend (Render):** create a Web Service from the `backend` folder, set the start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`, and add the environment variables above.
- **Frontend (Netlify):** set the base directory to `frontend`, build command `npm run build`, publish directory `dist`. The included `public/_redirects` file enables client-side routing.

> Deploy the **backend first**, then the frontend.

## 🗺️ Roadmap

- [ ] Parcel invoice / label printing
- [ ] Profile page with password change
- [ ] Parcel status history (timestamps for each stage)
- [ ] Dark mode
- [ ] Switch from SQLite to PostgreSQL for production

## 👨‍💻 Author

**Tahsan Farhad**

- GitHub: [@your-username](https://github.com/tahsan410)
- LinkedIn: [your-profile](https://www.linkedin.com/in/tahsan-farhad-819398382)

---

<div align="center">

If you found this project useful, consider giving it a ⭐

</div>

---

# ✅ **DETAILED IMPLEMENTATION ROADMAP**

## **1. Tenant Module**

### **1.1 Tenant Onboarding**

**Goal:** Create a simple and friendly registration process.

#### Tasks:

**1.1.1 Authentication Layer**

* Implement `/auth/register` + `/auth/login`
* Provider support:

  * Email + Password (default)
  * OAuth: Google, Apple, Facebook (use Firebase Auth or Supabase Auth)

**1.1.2 Profile Creation Screen (UI)**

* Fields:

  * `name` (text)
  * `age` (number)
  * `occupation` (text)
  * `budget_min`, `budget_max` (slider)
  * `preferred_locations` (multiselect list)

**1.1.3 Database Schema (tenantProfile)**

```json
tenantProfile {
  id: string
  user_id: string
  name: string
  age: number
  occupation: string
  budget_min: number
  budget_max: number
  preferred_locations: string[]
  has_pets: boolean
  profile_photo_url: string
  responsiveness_score: number
  verification_status: "unverified" | "video_verified"
  created_at: timestamp
}
```

---

### **1.2 Preferences & Filters**

**Goal:** Allow tenants to define what they want.

#### Tasks:

**1.2.1 UI: Filter Panel**

* Components:

  * Budget Slider Component
  * Location Picker
  * Toggle: Pets Allowed
  * Toggle: Roommates OK

**1.2.2 Backend: Preference Matching Query**

* Endpoint: `/properties/search`
* Filters query parameters:

  * `price <= budget_max`
  * `price >= budget_min`
  * `location ∈ preferred_locations`
  * `pets_allowed = true/false`

---

### **1.3 Apartment Swipe Interface**

**Goal:** Swipe-based selection.

#### Tasks:

**1.3.1 UI Card Layout**

* Photo carousel
* Price
* Address
* Short description
* Landlord rating stars
* Icons for rules (pets / smoking / roommates)

**1.3.2 Swipe Logic**

* Swipe Left → `POST /properties/dislike`
* Swipe Right → `POST /properties/like`

**1.3.3 Automatic Match Logic**

* If landlord liked tenant + tenant likes property → create `match` record

---

### **1.4 Match + Chat Flow**

#### Tasks:

**1.4.1 Match Creation Schema**

```json
match {
  id: string
  tenant_id: string
  landlord_id: string
  property_id: string
  status: "matched" | "chatting" | "closed"
  created_at: timestamp
}
```

**1.4.2 Chat UI**

* Real-time messaging (Firebase RTDB or Supabase Realtime recommended)

**1.4.3 Before First Message Prompt**

* Show **“Record Intro Video?”** modal

  * **Buttons:**

    * ✅ Record Intro Video
    * ❌ Skip for now

---

## **2. Intro Video Feature (Trust Layer)**

### **2.1 Trigger Timing**

* Trigger only **after** a match, **before** chat message send.

### **2.2 UI Text (Microcopy)**

Soft, friendly tone:

| Element     | Text                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Title       | "Help the landlord get to know you 😊"                                                                    |
| Description | "Record a short intro (15–30 sec). It helps build trust and increases your chances of getting the place!" |
| Button 1    | "Record Intro Video"                                                                                      |
| Button 2    | "Maybe Later"                                                                                             |

### **2.3 Video Upload**

**2.3.1 Frontend**

* Use device camera (React Native Vision Camera OR Expo Camera)

**2.3.2 Backend**

* Upload to storage: `/videos/tenant/{userId}/intro.mp4`
* Save URL to tenant profile

**2.3.3 Update Verification Status**
`verification_status = "video_verified"`

**Badge UI:**
Small blue check icon + text: *Verified Tenant*

---

## **3. Landlord Module**

### **3.1 Onboarding**

Same structure as tenant but simpler:

* Name
* Contact email
* Description
* Optional: Business verification

### **3.2 Property Publishing**

Form fields:

* Photos
* Title
* Description
* Address (blur exact address for privacy)
* Price per month
* Rules (pets, smoking, students)

### **3.3 Landlord Swipe Interface**

* Cards show tenant short profile + verified badge

---

## **4. Data Models (Full)**

### `tenantProfile`, `landlordProfile`, `property`, `match`, `review`

```json
review {
  id: string
  reviewer_id: string
  reviewee_id: string
  rating: number (1-5)
  text: string
  created_at: timestamp
}
```

---

## **5. UI, Ratings, and Business Model**

### **5.1 UI Wireframe Suggestions**

* **Home** → Swipe screen showing apartments (tenants) or tenants (landlords).
* **Matches** → List of all mutual matches.
* **Messages** → Chat room for matched pairs.
* **Profile** → Edit profile, set preferences, upload photo/video, see verification status.
* **Ratings & Reviews** → After move-out or end of conversation:

  * Allow rating 1–5 stars.
  * Optional short written feedback with structured tags.
  * Display aggregated rating in user profiles.

### **5.2 Example Code Templates**

#### **Swipe Screen (React Native Pseudocode)**

```js
<CardStack data={properties}>
  {property => (
    <PropertyCard property={property} />
  )}
</CardStack>

onSwipeRight(property.id) => api.likeProperty(property.id)
onSwipeLeft(property.id) => api.skipProperty(property.id)
```

#### **Match Logic**

```sql
IF landlord_likes_tenant AND tenant_likes_property
THEN INSERT INTO match (tenant_id, landlord_id, property_id, status, created_at)
```

#### **Video Upload Component**

```js
const video = await Camera.recordAsync();
await uploadToStorage(video.uri, `tenant/${user.id}/intro.mp4`);
updateProfile({ verification_status: "video_verified" });
```

---

### **5.3 Business Model**

* **Free Core Features:** browse & match.
* **Optional Upgrades:**

  * **Tenant Boost:** higher profile visibility for 7 days.
  * **Landlord Premium:** access to tenant insights + highlight listings.
* **No agency commissions:** direct connection between tenants and landlords, keeping it simple and cost-efficient.

---

# ✅ Next Step

If you want, I can now generate:

1. **Full UI mockups** (Figma-ready)
2. **REST API endpoint list**
3. **Database SQL migrations**
4. **React Native component boilerplate**

**Which one do you want next?**
**A)** UI mockups
**B)** Backend API blueprint
**C)** Database SQL
**D)** Frontend component starter code

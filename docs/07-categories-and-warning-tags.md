# ReviewHistory — Categories & Warning Tags

All 10 entity categories, their rating dimensions, and warning tags.

---

## Summary: Rating Dimensions per Category

| Category | Dimension 1 | Dimension 2 | Dimension 3 | Dimension 4 |
|----------|-------------|-------------|-------------|-------------|
| LANDLORD | Maintenance | Deposit Return | Communication | Price Fairness |
| DOCTOR | Wait Time | Diagnosis Quality | Price Fairness | Staff Behaviour |
| MECHANIC | Parts Authenticity | Work Quality | Price Fairness | Timeliness |
| SHOP | Product Quality | Price Fairness | Staff Behaviour | Cleanliness |
| PROPERTY_DEALER | Honesty | Listing Accuracy | Professionalism | Fee Transparency |
| PHARMACY | Medicine Authenticity | Price Fairness | Staff Knowledge | Availability |
| RESTAURANT | Food Quality | Price Fairness | Hygiene | Service Speed |
| SCHOOL | Teaching Quality | Fee Transparency | Facilities | Staff Behaviour |
| SALON | Work Quality | Price Fairness | Hygiene | Staff Behaviour |
| OTHER | Overall Quality | Price Fairness | Communication | — |

---

## 🏠 Category 1: LANDLORD

**Description:** Residential or commercial property owners renting out property to tenants.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Maintenance | `maintenance` | How well the property is maintained |
| Deposit Return | `deposit_return` | Did they return the security deposit fairly? |
| Communication | `communication` | Responsiveness to calls, messages, requests |
| Price Fairness | `price_fairness` | Is the rent fair for the property and area? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `deposit_kept` | Security Deposit Kept | ضمانتی رقم نہیں لوٹائی | 💰 |
| `hidden_charges` | Hidden Charges | چھپے ہوئے چارجز | 🔍 |
| `maintenance_ignored` | Maintenance Ignored | مرمت کام نہیں کیا | 🔧 |
| `illegal_eviction` | Illegal Eviction | غیر قانونی بے دخلی | 🚫 |
| `rent_increase_sudden` | Sudden Rent Increase | اچانک کرایہ بڑھا دیا | 📈 |
| `privacy_violation` | Privacy Violation | گھر میں بغیر اجازت آنا | 🔓 |
| `utilities_overcharged` | Utilities Overcharged | بجلی/گیس کا زیادہ بل | ⚡ |
| `dirty_property` | Property Given Dirty | گندی حالت میں دیا | 🪣 |
| `no_receipt` | No Rent Receipt Given | کرایہ رسید نہیں ملی | 📄 |
| `verbal_threats` | Verbal Threats | دھمکیاں دیں | ⚠️ |

---

## 👨‍⚕️ Category 2: DOCTOR

**Description:** General practitioners, specialists, dentists, and all medical professionals at private clinics or hospitals.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Wait Time | `wait_time` | Did the appointment time mean anything? |
| Diagnosis Quality | `diagnosis_quality` | Was the diagnosis accurate and thorough? |
| Price Fairness | `price_fairness` | Were consultation fees reasonable? |
| Staff Behaviour | `staff_behaviour` | Were receptionist and staff respectful? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `overcharging` | Overcharging | بہت زیادہ فیس | 💸 |
| `unnecessary_tests` | Unnecessary Tests | غیر ضروری ٹیسٹ | 🧪 |
| `long_wait` | Long Wait Times | بہت انتظار | ⏰ |
| `misdiagnosis` | Misdiagnosis | غلط تشخیص | ❌ |
| `rude_behaviour` | Rude Behaviour | بدتمیزی | 😤 |
| `dismissive` | Dismissive / Not Listening | بات نہیں سنی | 🙉 |
| `over_medication` | Over-Medication | بہت زیادہ دوائیں | 💊 |
| `unhygienic_clinic` | Unhygienic Clinic | گندا کلینک | 🦠 |
| `fake_degrees` | Suspected Fake Degree | ڈگری مشکوک | 🎓 |
| `no_prescription` | No Written Prescription | نسخہ نہیں دیا | 📝 |

---

## 🔧 Category 3: MECHANIC

**Description:** Auto mechanics (cars, motorcycles), AC technicians, appliance repair shops, electricians.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Parts Authenticity | `parts_authenticity` | Were genuine/new parts used? |
| Work Quality | `work_quality` | Was the repair done correctly? |
| Price Fairness | `price_fairness` | Were charges reasonable for the work done? |
| Timeliness | `timeliness` | Was work completed on time as promised? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `fake_parts` | Fake / Used Parts Installed | جعلی / پرانے پارٹس لگائے | ⚙️ |
| `overcharging` | Overcharging for Labour | مزدوری زیادہ لی | 💸 |
| `repeat_failure` | Repair Failed Again | دوبارہ خراب ہو گیا | 🔁 |
| `delayed_delivery` | Delayed Delivery | وقت پر نہیں دیا | ⏳ |
| `unnecessary_work` | Unnecessary Work Done | فالتو کام کیا | 🔨 |
| `stolen_parts` | Original Parts Stolen | اصل پارٹس چرا لیے | 🚗 |
| `no_warranty` | No Warranty Given | وارنٹی نہیں دی | 📋 |
| `rude_behaviour` | Rude Behaviour | بدتمیزی | 😤 |

---

## 🏪 Category 4: SHOP

**Description:** Grocery stores, electronics shops, clothing stores, general trade, any retail business.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Product Quality | `product_quality` | Are products genuine, fresh, and as advertised? |
| Price Fairness | `price_fairness` | Are prices reasonable? |
| Staff Behaviour | `staff_behaviour` | Are staff respectful and helpful? |
| Cleanliness | `cleanliness` | Is the shop clean and hygienic? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `expired_products` | Expired Products Sold | میعاد ختم مال بیچا | ⛔ |
| `fake_brands` | Fake / Counterfeit Brands | جعلی برانڈ | 🏷️ |
| `overcharging` | Overcharging | زیادہ پیسے لیے | 💸 |
| `short_measure` | Short Measure / Weight | وزن کم تولا | ⚖️ |
| `rude_staff` | Rude Staff | بدتمیز عملہ | 😤 |
| `no_return_policy` | No Returns Accepted | واپسی قبول نہیں | 🔄 |
| `no_receipt` | Receipt Refused | رسید نہیں دی | 📄 |
| `misleading_ads` | Misleading Advertising | جھوٹا اشتہار | 📢 |

---

## 🏘️ Category 5: PROPERTY_DEALER

**Description:** Real estate agents, property brokerage firms, any intermediary in property buy/sell/rent transactions.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Honesty | `honesty` | Were they truthful about property details? |
| Listing Accuracy | `listing_accuracy` | Did the property match the listing? |
| Professionalism | `professionalism` | Were they professional throughout? |
| Fee Transparency | `fee_transparency` | Were commission/fees clearly explained upfront? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `fake_listing` | Fake / Bait Property Listing | جھوٹی جائیداد دکھائی | 🏚️ |
| `double_dealing` | Double Dealing (Both Parties) | دونوں سے پیسے لیے | 🤝 |
| `advance_taken` | Advance Taken, Disappeared | ایڈوانس لے کر غائب | 💨 |
| `overcharging` | Excessive Commission | کمیشن زیادہ لیا | 💸 |
| `hidden_issues` | Hidden Property Issues | جائیداد کی خرابی چھپائی | 🔍 |
| `no_paperwork` | No Proper Documentation | کاغذات نہیں | 📜 |
| `pressuring` | Pressuring / Rushed Sale | دباؤ ڈالا | 😰 |
| `forged_documents` | Suspected Forged Documents | جعلی کاغذات | ⚠️ |

---

## 💊 Category 6: PHARMACY

**Description:** Pharmacies, dispensaries, medical stores selling medicines and health products.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Medicine Authenticity | `medicine_authenticity` | Are medicines genuine and not counterfeit? |
| Price Fairness | `price_fairness` | Are prices at or below MRP? |
| Staff Knowledge | `staff_knowledge` | Do staff give correct medicine advice? |
| Availability | `availability` | Are common medicines consistently in stock? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `fake_medicine` | Fake / Counterfeit Medicine | جعلی دوائی | 💊 |
| `overcharging` | Overcharging Above MRP | MRP سے زیادہ لیا | 💸 |
| `expired_medicine` | Expired Medicine Sold | میعاد ختم دوائی | ⛔ |
| `wrong_medicine` | Wrong Medicine Given | غلط دوائی دی | ❌ |
| `bad_advice` | Dangerous Self-Prescribing | غلط مشورہ | ⚠️ |
| `out_of_stock` | Always Out of Stock | دوائیں نہیں ملتیں | 🚫 |

---

## 🍽️ Category 7: RESTAURANT

**Description:** Dine-in restaurants, takeaways, delivery kitchens, food stalls, cafés.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Food Quality | `food_quality` | How was the taste, freshness, and portion size? |
| Price Fairness | `price_fairness` | Value for money? |
| Hygiene | `hygiene` | Was the kitchen and serving area clean? |
| Service Speed | `service_speed` | How fast was food served or delivered? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `food_poisoning` | Food Poisoning Incident | فوڈ پوائزننگ | 🤢 |
| `unhygienic` | Unhygienic Kitchen | گندا کچن | 🦠 |
| `overcharging` | Overcharging / Fake Menu Price | زیادہ بل | 💸 |
| `rude_staff` | Rude Staff | بدتمیز عملہ | 😤 |
| `stale_food` | Stale / Old Food | باسی کھانا | 🍱 |
| `wrong_order` | Wrong Orders Repeatedly | غلط آرڈر | ❓ |
| `slow_delivery` | Very Slow Delivery | بہت دیر سے آیا | ⏰ |

---

## 🏫 Category 8: SCHOOL

**Description:** Private schools, academies, coaching centres, universities.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Teaching Quality | `teaching_quality` | How good were the teachers and curriculum? |
| Fee Transparency | `fee_transparency` | Were all fees disclosed upfront? |
| Facilities | `facilities` | Quality of classrooms, labs, library, playground |
| Staff Behaviour | `staff_behaviour` | Were teachers and admin respectful to students? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `hidden_fees` | Hidden / Surprise Fees | چھپی ہوئی فیس | 💸 |
| `unqualified_teachers` | Unqualified Teachers | نااہل اساتذہ | 📚 |
| `poor_facilities` | Poor Facilities | بری سہولیات | 🏫 |
| `corporal_punishment` | Corporal Punishment | مار پیٹ | ⚠️ |
| `fee_refund_refused` | Fee Refund Refused | فیس واپس نہ کی | ❌ |
| `fake_results` | Results Manipulation | نتائج میں گڑبڑ | 📊 |
| `rude_staff` | Rude Teachers / Admin | بدتمیزی | 😤 |

---

## ✂️ Category 9: SALON

**Description:** Barbershops, beauty parlours, spas, nail studios.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Work Quality | `work_quality` | Was the haircut/treatment done well? |
| Price Fairness | `price_fairness` | Were prices reasonable and disclosed upfront? |
| Hygiene | `hygiene` | Were tools sterilised? Was the salon clean? |
| Staff Behaviour | `staff_behaviour` | Were staff professional and respectful? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `overcharging` | Overcharging | زیادہ پیسے لیے | 💸 |
| `unhygienic_tools` | Unhygienic Tools | گندے اوزار | 🦠 |
| `bad_haircut` | Bad Haircut / Work | برا کام | ✂️ |
| `rude_staff` | Rude Staff | بدتمیزی | 😤 |
| `hidden_charges` | Surprise Charges Added | اچانک زیادہ بل | 🔍 |
| `allergy_reaction` | Product Allergy Reaction | الرجی ہوئی | ⚠️ |

---

## 🔵 Category 10: OTHER

**Description:** Any local entity that doesn't fit the above nine categories — tutors, courier services, event planners, internet providers, etc.

**Rating Dimensions:**

| Dimension | Key | Description |
|-----------|-----|-------------|
| Overall Quality | `overall_quality` | General quality of service |
| Price Fairness | `price_fairness` | Was the price reasonable? |
| Communication | `communication` | Responsive and clear communication? |
| Reliability | `reliability` | Did they deliver on promises? |

**Warning Tags:**

| Tag Key | Label | Urdu Label | Emoji |
|---------|-------|------------|-------|
| `scam` | Suspected Scam | دھوکہ | ⚠️ |
| `advance_taken` | Advance Taken, No Service | ایڈوانس لے کر غائب | 💨 |
| `overcharging` | Overcharging | زیادہ پیسے | 💸 |
| `poor_service` | Poor Service Quality | بری سروس | 👎 |
| `rude_behaviour` | Rude Behaviour | بدتمیزی | 😤 |
| `not_delivered` | Promised Deliverable Not Given | وعدہ پورا نہیں کیا | ❌ |

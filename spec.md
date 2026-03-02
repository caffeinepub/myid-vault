# MyID Vault

## Current State
- Add ID flow has two category types: "College Student ID" and "Other ID"
- "Other ID" has a plain text input for ID Type (free text like "Passport", "Aadhaar", etc.)
- ID Number field is a generic text input labeled "ID Number" across all other ID types
- Each ID category (college, other) shows a photo upload for the person's profile photo
- No option to upload a photo/scan of the document itself

## Requested Changes (Diff)

### Add
- Dropdown list for ID category selection in the "Other ID" flow, with these categories:
  - Aadhaar Card
  - PAN Card
  - Passport
  - Driving Licence
  - Voter ID
  - College ID (student ID for college)
  - School ID
- Each category shows its own set of relevant fields:
  - **Aadhaar Card**: Aadhar No. (12-digit), Full Name, DOB, Address (optional)
  - **PAN Card**: PAN No., Full Name, DOB, Father's Name
  - **Passport**: Passport No., Full Name, DOB, Issue Date, Expiry Date, Issued By, Nationality
  - **Driving Licence**: Licence No., Full Name, DOB, Issue Date, Expiry Date, Vehicle Class, Issued By (RTO)
  - **Voter ID**: Voter ID No., Full Name, DOB, Father's/Husband's Name, Address (optional)
  - **College ID**: Full Name, Enrollment/Roll No., Course, Branch, College Name, Academic Year, Valid Until
  - **School ID**: Full Name, Roll No., Class/Grade, School Name, Academic Year, Valid Until
- "Upload Document Photo" option (separate from profile photo) -- a second photo upload field labeled "Document Photo" for uploading a scan or photo of the physical document

### Modify
- Replace the free-text "ID Type" input in OtherIDForm with a styled dropdown (select) that lists the above categories
- For Aadhaar category: replace "ID Number" label with "Aadhar No." and apply 12-digit numeric hint
- "Choose ID Type" step now shows the dropdown in the form instead of a separate card for "Other"
- The category selection on the home "choose type" screen can remain simple (College Student vs Other ID), but the "Other ID" form now has a dropdown
- Add a second photo upload area in both College ID and Other ID forms, labeled "Document Photo" (scan of the physical card)

### Remove
- Free-text ID Type input replaced by dropdown

## Implementation Plan
1. Update `OtherFormData` interface to add `documentPhotoFile` and `documentPhotoPreview` fields
2. Update `CollegeFormData` interface to add `documentPhotoFile` and `documentPhotoPreview` fields
3. Create a `ID_CATEGORIES` config object mapping each category to its specific fields config
4. Replace the "ID Type" text input in `OtherIDForm` with a `<select>` dropdown listing all categories
5. Render category-specific fields dynamically based on selected category
6. For Aadhaar: show "Aadhar No." label instead of "ID Number"
7. Add a `DocumentPhotoUpload` component (reuse PhotoUpload with different label "Document Photo")
8. Add Document Photo upload to CollegeIDForm and OtherIDForm
9. Store document photo in the existing `photo` field or handle as a second blob -- since backend only supports one photo per card, store document photo using the same ExternalBlob mechanism; the existing `photo` field on backend will hold the profile photo, and document photo will be a second upload stored client-side in form state (passed as a separate ExternalBlob)
10. Update submit handlers to handle the document photo field (pass to backend using existing `photo` param as document scan if no profile photo, or consider field reuse)
11. Update CardViewerPage to display document photo if present (show as "Document Scan" section below the card)
12. Run typecheck and lint to ensure no errors
